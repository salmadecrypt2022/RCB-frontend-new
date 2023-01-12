$(document).ready(function () {

    console.log('--------------------------------fffffffff');


    $('#reserveTable').DataTable({
        "responsive": true,
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "/api/v1/admin/reserves",
            "type": "POST",
            headers: {
                'Authorization': token
            },
            dataFilter: function (data) {
                var json = jQuery.parseJSON(data);
                json.recordsTotal = json.data.recordsTotal;
                json.recordsFiltered = json.data.recordsFiltered;
                json.data = json.data.data;
                json.draw = json.data.draw;
                return JSON.stringify(json); // return JSON string
            }
        },
        "aoColumns": [
            {
                mData: 'user_address',
                render: function (mData, type, row) {
                    var firstFive = mData.slice(0, 10);
                    var lastFive = mData.slice(mData.length - 8, mData.length);
                    return `<td>${firstFive}...${lastFive}</td>`;
                }
            },

            {
                "mData": "sId",
                render: function (mData, type, row) {
                    return `<td>${(mData == undefined || mData == "") ? '-' : mData}</td>`;
                }
            },
          
            {
                "mData": "sTransactionStatus",
                render: function (mData, type, row) {

                    if (mData == -1) {
                        return `<td>failed</td>`;
                    }
                    if (mData == 0) {
                        return `<td>pending</td>`;
                    }
                    if (mData == 1) {
                        return `<td>Mined</td>`;
                    }
                    if (mData == -99) {
                        return `<td>Transaction not submitted to Blockchain</td>`;
                    }
    

                    // return `<td>${(mData == undefined || mData == "") ? '-' : mData}</td>`;
                }
            },
            // {
            //     "mData": "sTransactionStatus",
            //     orderable: false,
            //     "render": function (data, type, row, meta) {
            //         return `<td>${(mData == undefined || mData == "") ? '-' : mData}</td>`;
            //     }
            // }
        ],
        "columnDefs": [{
            "searchable": true,
            "orderable": true,
        }],
        "iDisplayLength": 10
    });

    // Add Placeholder to the search box
    // $("#reserveTable_filter > label > input[type=search]").attr("placeholder", "Username");
    $("#reserveTok").on("click", async () => {
        // $('#preloader').addClass(5000);
        // $('#main-wrapper').removeClass('show');

        if (!(await ethereum._metamask.isUnlocked())) {
            $('#lblAmountError').html('MetaMask Is Locked, Please Unlock It & Reload The Page To Connect!');
            $("#lblAmountError").removeClass("d-none");
            return;
        }

        $.ajax({
            type: "POST",
            url: "/api/v1/admin/usersInCategory",
            data: {},
            headers: {
                'Authorization': token
            },
            success: function (result, status, xhr) {
                // console.log(xhr);
                // toastr["success"](xhr.responseJSON.message);
                console.log('-------- xhr.responseJSON.data[data]-----', xhr.responseJSON.data['data']);
    
                if (xhr.responseJSON.data && xhr.responseJSON.data['data'].length) {
                    let d = xhr.responseJSON.data['data'];
                    let newMSG = "<option value=''>Select user</option>";
                    for (i = 0; i < d.length; i++) {
                        newMSG = newMSG + "<option value=" + d[i].sWalletAddress + ">" + d[i].sWalletAddress + "</option>";
                    }
    
    
                    $('#user_address').html(newMSG);
                    setTimeout(function () {
                        // $('#user_address').selectpicker();
                        $('#reserveToken').modal('show');
                    }, 1000)
    
                }
    
            },
            error: function (xhr, status, error) {
                toastr["error"](xhr.responseJSON.message);
                console.log(xhr);
            }
        });
    
    })

    $("#btnReserve").on("click", async () => {


        if (!(await ethereum._metamask.isUnlocked())) {
            $('#lblAmountError').html('MetaMask Is Locked, Please Unlock It & Reload The Page To Connect!');
            $("#lblAmountError").removeClass("d-none");
            return;
        }

          //----------------------------------------
          if ($("#user_address").val() == '') {
            $("#lblUser").text("Please select user!");
            $("#lblUser").removeClass("d-none");
            return;
        } else {
            $("#lblUser").addClass("d-none");
        }

          //----------------------------------------
          if ($("#NFT_id").val() == '') {
            $("#lblNFT_id").text("Please select NFT_id!");
            $("#lblNFT_id").removeClass("d-none");
            return;
        } else {
            $("#lblNFT_id").addClass("d-none");
        }


        web3 = new Web3(web3.currentProvider);
        var sAccount;
        let aAccounts = await web3.eth.getAccounts();
        sAccount = aAccounts[0];
        console.log(aAccounts);

        var oContract = new web3.eth.Contract(abi, mainContractAddress)

        let obj = {
            sId:  $("#NFT_id").val(),
            sTransactionHash: '',
            sTransactionStatus: 0,
            sWalletAddress: sAccount,
            user_address: $("#user_address").val(),
        };
        

        $('.fetchLoader').removeClass('d-none');
        console.log('--------------------------------obj', obj)
        await oContract.methods.reserveToken(obj.user_address, parseInt(obj.sId)).send({
            from: sAccount
        })
        .on('transactionHash', async (hash) => {
            $('.fetchLoader').addClass('d-none');
            obj.sTransactionHash = hash        
        // .then((receipt) => {
        //     console.log(receipt);
        //     obj.sTransactionHash = receipt.transactionHash
            reserveTokenAPI(obj);

            toastr["success"]("Transaction confirmes successfully.");
            setInterval(() => {
                location.reload();
            }, 1000);
        })
        .catch((error) => {
            $('.fetchLoader').addClass('d-none');

            if (error.code == 32603) {
                toastr["error"]("You're connected to wrong network!");
            }
            if (error.code == 4001) {
                toastr["error"]("You Denied Transaction Signature");
            }
        });

    })
    
});




function reserveTokenAPI(data) {
    $.ajax({
        type: "POST",
        url: "/api/v1/admin/reserveToken",
        data: data,
        headers: {
            'Authorization': token
        },
        success: function (result, status, xhr) {
            console.log(xhr);
            toastr["success"](xhr.responseJSON.message);
            setTimeout(function () {
                window.location.reload();
            }, 1000)
        },
        error: function (xhr, status, error) {
            toastr["error"](xhr.responseJSON.message);
            console.log(xhr);
        }
    });
}
