let cat_id = '';
let original_cat_id = '';
$(document).ready(async function () {

    web3 = new Web3(web3.currentProvider);
    var sAccount;
    let aAccounts = await web3.eth.getAccounts();

    sAccount = aAccounts[0];

    if (sAccount == undefined || sAccount == null) {

        return;
    }
    $('#userTable').DataTable({
        "responsive": true,
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "/api/v1/admin/categories",
            "type": "POST",
            headers: {
                'Authorization': token
            },
            dataFilter: function (data) {
                console.log('------data-------', data)
                var json = jQuery.parseJSON(data);
                console.log('------json-------', json)
                json.recordsTotal = json.data.recordsTotal;
                json.recordsFiltered = json.data.recordsFiltered;
                json.data = json.data.data;
                json.draw = json.data.draw;
                return JSON.stringify(json); // return JSON string
            }
        },
        "aoColumns": [{
            "mData": "maxPerAddress",
            render: function (mData, type, row) {
                return `<td>${(mData == undefined || mData == "") ? '-' : mData}</td>`;
            }
        },
        {
            mData: 'category_type',
            render: function (mData, type, row) {
                // var firstFive = mData.slice(0, 10);
                // var lastFive = mData.slice(mData.length - 8, mData.length);
                // return `<td>${firstFive}...${lastFive}</td>`;
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

            }
        },
        {
            "mData": "sStatus",
            render: function (mData, type, row) {
                return `<td>${(mData == undefined || mData == "") ? '-' : mData}</td>`;
            }
        },
        {
            "mData": "category_status",
            render: function (mData, type, row) {
                return `<td>${(mData == undefined || mData == "") ? '-' : mData}</td>`;
            }
        },
        {
            "mData": "sStatus",
            orderable: false,
            "render": function (data, type, row, meta) {

                if (row.sTransactionStatus && row.sTransactionStatus == 1) {

                    if (data == "active" && row.category_type == 'private') {
                        return `
                                <button id="btnBlockUser" name="blocked" title="Block" onclick="toggleStatus($(this))" objId='${row._id}' class="btn btn-danger btn-xs"><i class="fa fa-ban"></i></button>
                                <button id="btnBlockUser" name="deactivated" title="Allow User" onclick="AllowUser($(this))" objId='${row._id}' original_id='${row.category_id}' class="btn btn-danger btn-xs"><i class="fa fa-plus"></i></button>
                                <button name="View" title="View" onclick="getCategoryById($(this))" objId='${row._id}' class="btn btn-danger btn-xs"><i class="fa fa-eye"></i></button>
                                &nbsp;&nbsp;&nbsp;<button name="Update" title="Update" onclick="getCategoryByIdUpdate($(this))" objId='${row._id}' class="btn btn-danger btn-xs"><i class="fa fa-pencil"></i></button>&nbsp;&nbsp;&nbsp;<button name="Delete" title="Delete" onclick="deleteCategory($(this))" objId='${row._id}' class="btn btn-danger btn-xs"><i class="fa fa-trash"></i></button>
                                `;
                    }
                    return `<button id="btnBlockUser" name="blocked" title="Block" onclick="toggleStatus($(this))" objId='${row._id}' class="btn btn-danger btn-xs"><i class="fa fa-ban"></i></button>&nbsp;&nbsp;&nbsp;<button name="Update" title="Update" onclick="getCategoryByIdUpdate($(this))" objId='${row._id}' class="btn btn-danger btn-xs"><i class="fa fa-pencil"></i></button>&nbsp;&nbsp;&nbsp;<button name="Delete" title="Delete" onclick="deleteCategory($(this))" objId='${row._id}' class="btn btn-danger btn-xs"><i class="fa fa-trash"></i></button>`;
                } else {
                    return 'Transaction is not mined.'
                }
            }
        }
        ],
        "columnDefs": [{
            "searchable": true,
            "orderable": true,
        }],
        "iDisplayLength": 10
    });

    // Add Placeholder to the search box
    $("#userTable_filter > label > input[type=search]").attr("placeholder", "Keyword");


    $("#btnCreateCat").on("click", async () => {
        // $('#preloader').addClass(5000);
        // $('#main-wrapper').removeClass('show');

        console.log("start time is----->", $("#category_startTime").val())
        let dt = $("#category_startTime").val();
        dt = new Date(dt);

        const ct = new Date();
        console.log("dt  is----->", dt.getTime());
        console.log(" ct is----->", ct.getTime());

        if (dt.getTime() < ct.getTime()) {
            console.log("true")
            $('#lblcategory_startTime').html('Start time should be greate than previos time!');
            $("#lblcategory_startTime").removeClass("d-none");
            return;
        }

        if (!(await ethereum._metamask.isUnlocked())) {
            $('#lblAmountError').html('MetaMask Is Locked, Please Unlock It & Reload The Page To Connect!');
            $("#lblAmountError").removeClass("d-none");
            return;
        }


        // if (isNaN($("#starttime").val())) {
        //     $("#lblstatrt").text("Starttime Should be Numeric seconds Only!");
        //     $("#lblstatrt").removeClass("d-none");
        //     return;
        // } else {
        //     $("#lblstatrt").addClass("d-none");
        // }
        // if (isNaN($("#endtime").val())) {
        //     $("#lblEndtime").text("Endtime Should be Numeric seconds Only!");
        //     $("#lblEndtime").removeClass("d-none");
        //     return;
        // } else {
        //     $("#lblEndtime").addClass("d-none");
        // }
        if (isNaN($("#maxPerAddress").val())) {
            $("#lblMaxPerAddress").text("Max per address Should be Numeric seconds Only!");
            $("#lblMaxPerAddress").removeClass("d-none");
            return;
        } else {
            $("#lblMaxPerAddress").addClass("d-none");
        }
        if (isNaN($("#categoryTokencap").val())) {
            $("#lblCategoryTokencap").text("Totalsupply Should be Numeric seconds Only!");
            $("#lblCategoryTokencap").removeClass("d-none");
            return;
        } else {
            $("#lblCategoryTokencap").addClass("d-none");
        }


        if (isNaN($("#sPrice").val())) {
            $("#lblPrice").text("Price Should be Numeric amount Only!");
            $("#lblPrice").removeClass("d-none");
            return;
        } else {
            $("#lblPrice").addClass("d-none");
        }
        //----------------------------------------
        if ($("#sStatus").val() == '') {
            $("#lblStatus").text("Please select status!");
            $("#lblStatus").removeClass("d-none");
            return;
        } else {
            $("#lblStatus").addClass("d-none");
        }
        if ($("#category_name").val() == '') {
            $("#lblCategoryName").text("Please Enter category name!");
            $("#lblCategoryName").removeClass("d-none");
            return;
        } else {
            $("#lblCategoryName").addClass("d-none");
        }

        // if ($("#starttime").val() <= 0) {
        //     $("#lblstatrt").text("Please Enter Value greater than 0");
        //     $("#lblstatrt").removeClass("d-none");
        //     return;
        // } else {
        //     $("#lblstatrt").addClass("d-none");
        // }
        // if ($("#endtime").val() <= 0) {
        //     $("#lblEndtime").text("Please Enter Value greater than 0");
        //     $("#lblEndtime").removeClass("d-none");
        //     return;
        // } else {
        //     $("#lblEndtime").addClass("d-none");
        // }
        if ($("#maxPerAddress").val() <= 0) {
            $("#lblMaxPerAddress").text("Please Enter Value greater than 0");
            $("#lblMaxPerAddress").removeClass("d-none");
            return;
        } else {
            $("#lblMaxPerAddress").addClass("d-none");
        }
        if ($("#categoryTokencap").val() <= 0) {
            $("#lblCategoryTokencap").text("Please Enter Value greater than 0");
            $("#lblCategoryTokencap").removeClass("d-none");
            return;
        } else {
            $("#lblCategoryTokencap").addClass("d-none");
        }
        //category_startTime
        if ($("#sPrice").val() <= 0) {
            $("#lblPrice").text("Please Enter Value greater than 0");
            $("#lblPrice").removeClass("d-none");
            return;
        } else {
            $("#lblPrice").addClass("d-none");
        }
        // if ($("#redeemPoints").val() > $("#txtRedeemablePoints").text()) {
        //     $("#lblAmountError").text("You Don't Have That Much Points to Redeem!");
        //     $("#lblAmountError").removeClass("d-none");
        //     return;
        // }
        window.ethereum.enable();
        web3 = new Web3(web3.currentProvider);
        var sAccount;
        let aAccounts = await web3.eth.getAccounts();
        sAccount = aAccounts[0];
        console.log(aAccounts);

        // if (window.localStorage.getItem("sWalletAddress") != sAccount) {
        //     toastr["error"]('Please connect with valid wallet address.');
        //     return;
        // }
        let d = new Date();
        d = d.getTime();
        d = d / 1000;
        var oContract = new web3.eth.Contract(abi, mainContractAddress)

        let obj = {
            starttime: dt.getTime(),
            endtime: 1920002931,
            maxPerAddress: $("#maxPerAddress").val(),
            categoryTokencap: $("#categoryTokencap").val(),
            category_type: $("#category_type").val(),

            category_name: $("#category_name").val(),

            sStatus: $("#sStatus").val(),
            sTransactionHash: '',
            sTransactionStatus: 0,
            sWalletAddress: sAccount,
            sPrice: $("#sPrice").val(),
        };
        // 

        console.log('--------------------------------obj', obj)
        await oContract.methods.addCategory(obj.starttime, obj.endtime, obj.maxPerAddress, obj.categoryTokencap, obj.category_type == 'public' ? false : true, obj.sStatus == 'active' ? true : false, Web3.utils.toWei($("#sPrice").val(), 'ether')).send({
            from: sAccount
        })
            .on('transactionHash', async (hash) => {
                obj.sTransactionHash = hash
                console.log(hash);

                createCategory(obj);
                // let oDataToPass = {
                //   nNFTId: returnData._id,
                //   sTransactionHash: hash
                // };
                // const that = this;
                // console.log(oDataToPass);

                // await this.apiService.setTransactionHash(oDataToPass).subscribe(async (transData) => {

                //   if (transData && transData['data']) {
                //     that.toaster.success('NFT created successfully. it will be Reflected Once Transaction is mined.','Success!');
                //     // that.router.navigate(['/marketplace']);

                //     // that.onClickRefresh();
                //   } else {
                //     this.toaster.success(transData['message'],'Success!');
                //   }
                // })
            }).catch(function (error) {
                // $('#preloader').fadeOut(500);
                console.log(error);
                if (error.code == 32603) {
                    toastr["error"]("You're connected to wrong network!");
                }
                if (error.code == 4001) {
                    toastr["error"]("You Denied Transaction Signature");
                }
            });

        // .then((receipt) => {
        //     console.log(receipt);
        //     toastr["success"]("Redeemed Points Successfully!");
        //     setInterval(() => {
        //         location.reload();
        //     }, 1000);
        // }).catch((error) => {
        //     console.log(error);
        //     if (error.code == 4001)
        //         toastr["error"]("You Denied Transaction Request!");
        //     else
        //         toastr["error"]("Something Went Wrong!");
        //     $("#btnRedeem").html("Redeem").prop("disabled", false);
        // });
    })
    $("#btnAllow").on("click", async () => {

        if (!(await ethereum._metamask.isUnlocked())) {
            $('#lblUser').html('MetaMask Is Locked, Please Unlock It & Reload The Page To Connect!');
            $("#lblUser").removeClass("d-none");
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


        window.ethereum.enable();
        web3 = new Web3(web3.currentProvider);
        var sAccount;
        let aAccounts = await web3.eth.getAccounts();
        sAccount = aAccounts[0];
        console.log(aAccounts);

        var oContract = new web3.eth.Contract(abi, mainContractAddress)

        let obj = {
            _id: cat_id,
            category_id: original_cat_id,
            sTransactionHash: '',
            sTransactionStatus: 0,
            sWalletAddress: sAccount,
            user_address: $("#user_address").val(),
        };
        // 

        console.log('--------------------------------obj', obj);

        $('.fetchLoader').removeClass('d-none');

        await oContract.methods.allowAddressToMint(obj.user_address, parseInt(original_cat_id)).send({
            from: sAccount
        }).then((receipt) => {
            $('.fetchLoader').addClass('d-none');
            console.log(receipt);
            obj.sTransactionHash = receipt.transactionHash
            AllowUserAPI(obj);
            toastr["success"]("Address Allowed successfully.");
            // setInterval(() => {
            //     location.reload();
            // }, 1000);
        }).catch((error) => {
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


function createCategory(data) {
    $.ajax({
        type: "POST",
        url: "/api/v1/admin/createCategory",
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

function AllowUser(btn) {
    console.log(btn.attr("objId"));
    cat_id = btn.attr("objId")
    original_cat_id = btn.attr("original_id")

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
                    $('#allowUser').modal('show');
                }, 1000)

            }

        },
        error: function (xhr, status, error) {
            toastr["error"](xhr.responseJSON.message);
            console.log(xhr);
        }
    });

}

function AllowUserAPI(data) {
    $.ajax({
        type: "POST",
        url: "/api/v1/admin/allowUser",
        data: data,
        headers: {
            'Authorization': token
        },
        success: function (result, status, xhr) {
            console.log(xhr);
            toastr["success"](xhr.responseJSON.message);
            // setTimeout(function () {
            //     window.location.reload();
            // }, 1000)
        },
        error: function (xhr, status, error) {
            toastr["error"](xhr.responseJSON.message);
            console.log(xhr);
        }
    });
}


function toggleStatus(btn) {
    console.log(btn.attr("objId"));
    console.log(btn.attr("name"));
    // toggleUserStatus

    let oOptions = {
        sObjectId: btn.attr("objId"),
    }

    $.ajax({
        type: "POST",
        url: "/api/v1/admin/toggleCategoryStatus",
        data: oOptions,
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




function getCategoryById(btn) {
    console.log(btn.attr("objId"));
    let cat_obj_id = btn.attr("objId")

    $.ajax({
        type: "GET",
        url: "/api/v1/admin/getCategory/" + cat_obj_id,
        data: {},
        headers: {
            'Authorization': token
        },
        beforeSend: function () {
            console.log("Sending data....");
            $('#loadingUsers').removeClass('d-none');
            $('#bodyOfCAT').addClass('d-none');
            $('#categoryGet').modal('show');
        },
        success: function (result, status, xhr) {
            // console.log(xhr);
            // toastr["success"](xhr.responseJSON.message);
            console.log('-------- xhr.responseJSON.data[data]-----', xhr.responseJSON.data['data']);

            if (xhr.responseJSON.data && xhr.responseJSON.data['data']) {



                let d = xhr.responseJSON.data['data'].users;
                let newMSG = "<ol type=\"1\" class='whitelisted__list'>";
                for (i = 0; i < d.length; i++) {
                    newMSG = newMSG + "<li style='list-style:auto !important;'>" + d[i] + "</li>";
                }
                newMSG += '</ol>';

                if (!d || !d.length) {
                    newMSG = "<p>There are no Whitelisted users in this category.</p>"
                }

                setTimeout(function () {

                    $('#bodyOfCAT').html(newMSG);
                    $('#loadingUsers').addClass('d-none');
                    $('#bodyOfCAT').removeClass('d-none');
                }, 1000)

            }

        },
        error: function (xhr, status, error) {
            toastr["error"](xhr.responseJSON.message);
            console.log(xhr);
        }
    });

}


function getCategoryByIdUpdate(btn) {
    console.log(btn.attr("objId"));
    let cat_obj_id = btn.attr("objId")

    $.ajax({
        type: "GET",
        url: "/api/v1/admin/getCategory/" + cat_obj_id,
        data: {},
        headers: {
            'Authorization': token
        },
        beforeSend: function () {
            console.log("Sending data....");
            $('#loadingUsers').removeClass('d-none');
            $('#bodyOfCAT').addClass('d-none');
            $('#UpdateCat').modal('show');
        },
        success: function (result, status, xhr) {

            console.log('-------- xhr.responseJSON.data[data]-----', xhr.responseJSON.data['data']);

            if (xhr.responseJSON.data && xhr.responseJSON.data['data']) {

                console.log("Category Data is ", xhr.responseJSON.data['data'])

                let categoryData = xhr.responseJSON.data['data'];

                var date = new Date(categoryData.starttime/1);
                var year = date.getFullYear();
                var month = ''+date.getMonth() + 1;
                var day = ''+date.getDate();
                if (month.length < 2) 
                    month = '0' + month;
    
                if (day.length < 2) 
                    day = '0' + day;

                let hour = ''+date.getHours();
                let minutes = ''+date.getMinutes();
                if (hour.length < 2) 
                    hour = '0' + hour;
    
                if (minutes.length < 2) 
                    minutes = '0' + minutes;

                let startDate = [year, month, day].join('-');
                let startTime = [hour, minutes].join(':');
                let startDateTime = [startDate, startTime].join('T');
                $("#categoryIDUpdate").val(categoryData._id);
                $("#categoryIDContractUpdate").val(categoryData.category_id);
                $("#maxPerAddressUpdate").val(categoryData.maxPerAddress)
                $("#categoryTokencapUpdate").val(parseInt(categoryData.categoryTokencap))
                $("#category_nameUpdate").val(categoryData.category_name)
                $("#category_startTimeUpdate").val(startDateTime)
                $("#sStatusUpdate").val(categoryData.sStatus).change();
                $("#category_typeUpdate").val(categoryData.category_type).change();
                $("#sPriceUpdate").val(categoryData.sPrice)

            }

        },
        error: function (xhr, status, error) {
            toastr["error"](xhr.responseJSON.message);
            console.log(xhr);
        }
    });
}

$("#btnUpdateCat").on("click", async () => {
    console.log("Button clicked");
    let dt = $("#category_startTimeUpdate").val();
    dt = new Date(dt);
    const ct = new Date();
    if (dt.getTime() < ct.getTime()) {
        console.log("true")
        $('#lblcategory_startTimeUpdate').html('Start time should be greate than previos time!');
        $("#lblcategory_startTimeUpdate").removeClass("d-none");
        return;
    }
    if (!(await ethereum._metamask.isUnlocked())) {
        $('#lblAmountErrorUpdate').html('MetaMask Is Locked, Please Unlock It & Reload The Page To Connect!');
        $("#lblAmountErrorUpdate").removeClass("d-none");
        return;
    }
    if (isNaN($("#maxPerAddressUpdate").val())) {
        $("#lblMaxPerAddressUpdate").text("Max per address Should be Numeric seconds Only!");
        $("#lblMaxPerAddressUpdate").removeClass("d-none");
        return;
    } else {
        $("#lblMaxPerAddressUpdate").addClass("d-none");
    }
    if (isNaN($("#categoryTokencapUpdate").val())) {
        $("#lblCategoryTokencapUpdate").text("Totalsupply Should be Numeric seconds Only!");
        $("#lblCategoryTokencapUpdate").removeClass("d-none");
        return;
    } else {
        $("#lblCategoryTokencapUpdate").addClass("d-none");
    }
    if (isNaN($("#sPriceUpdate").val())) {
        $("#lblPriceUpdate").text("Price Should be Numeric amount Only!");
        $("#lblPriceUpdate").removeClass("d-none");
        return;
    } else {
        $("#lblPriceUpdate").addClass("d-none");
    }
    //----------------------------------------
    if ($("#sStatusUpdate").val() == '') {
        $("#lblStatusUpdate").text("Please select status!");
        $("#lblStatusUpdate").removeClass("d-none");
        return;
    } else {
        $("#lblStatusUpdate").addClass("d-none");
    }
    if ($("#category_nameUpdate").val() == '') {
        $("#lblCategoryNameUpdate").text("Please Enter category name!");
        $("#lblCategoryNameUpdate").removeClass("d-none");
        return;
    } else {
        $("#lblCategoryNameUpdate").addClass("d-none");
    }
    if ($("#maxPerAddressUpdate").val() <= 0) {
        $("#lblMaxPerAddressUpdate").text("Please Enter Value greater than 0");
        $("#lblMaxPerAddressUpdate").removeClass("d-none");
        return;
    } else {
        $("#lblMaxPerAddressUpdate").addClass("d-none");
    }
    if ($("#categoryTokencapUpdate").val() <= 0) {
        $("#lblCategoryTokencapUpdate").text("Please Enter Value greater than 0");
        $("#lblCategoryTokencapUpdate").removeClass("d-none");
        return;
    } else {
        $("#lblCategoryTokencapUpdate").addClass("d-none");
    }
    if ($("#sPriceUpdate").val() <= 0) {
        $("#lblPriceUpdate").text("Please Enter Value greater than 0");
        $("#lblPriceUpdate").removeClass("d-none");
        return;
    } else {
        $("#lblPriceUpdate").addClass("d-none");
    }
    
    window.ethereum.enable();
    web3 = new Web3(web3.currentProvider);
    var sAccount;
    let aAccounts = await web3.eth.getAccounts();
    sAccount = aAccounts[0];
    console.log(aAccounts);
    let d = new Date();
    d = d.getTime();
    d = d / 1000;
    var oContract = new web3.eth.Contract(abi, mainContractAddress)

    let obj = {
        categoryId_DB: $("#categoryIDUpdate").val(),
        categoryId: $("#categoryIDContractUpdate").val(),
        starttime: dt.getTime(),
        endtime: 1920002931,
        maxPerAddress: $("#maxPerAddressUpdate").val(),
        categoryTokencap: $("#categoryTokencapUpdate").val(),
        category_type: $("#category_typeUpdate").val(),
        category_name: $("#category_nameUpdate").val(),
        sStatus: $("#sStatusUpdate").val(),
        sTransactionHash: '',
        sTransactionStatus: 0,
        sWalletAddress: sAccount,
        sPrice: $("#sPriceUpdate").val(),
    };

    let objDB = {
        _id: $("#categoryIDUpdate").val(),
        starttime: dt.getTime(),
        endtime: 1920002931,
        maxPerAddress: $("#maxPerAddressUpdate").val(),
        categoryTokencap: $("#categoryTokencapUpdate").val(),
        category_type: $("#category_typeUpdate").val(),
        category_name: $("#category_nameUpdate").val(),
        sStatus: $("#sStatusUpdate").val(),
        sTransactionHash: '',
        sTransactionStatus: 0,
        sWalletAddress: sAccount,
        sPrice: $("#sPriceUpdate").val(),
    };
    // 
    console.log('--------------------------------obj', obj)
    await oContract.methods.updateCategory(obj.categoryId, obj.starttime, obj.endtime, obj.maxPerAddress, obj.categoryTokencap, obj.category_type == 'public' ? false : true, obj.sStatus == 'active' ? true : false, Web3.utils.toWei($("#sPriceUpdate").val(), 'ether')).send({
        from: sAccount
    })
    .on('transactionHash', async (hash) => {
        objDB.sTransactionHash = hash
        console.log(hash);
        updateCategory(objDB);
    }).catch(function (error) {
        console.log(error);
        if (error.code == 32603) {
            toastr["error"]("You're connected to wrong network!");
        }
        if (error.code == 4001) {
            toastr["error"]("You Denied Transaction Signature");
        }
    });
})

function updateCategory(data) {
    $.ajax({
        type: "POST",
        url: "/api/v1/admin/updateCategory",
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

function deleteCategory(btn) {
    console.log(btn.attr("objId"));
    console.log(btn.attr("name"));

    var result = confirm("Want to delete this Category?");
    if (result) {
        let oOptions = { sObjectId: btn.attr("objId"), }
        $.ajax({
            type: "POST",
            url: "/api/v1/admin/deleteCategory",
            data: oOptions,
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
}