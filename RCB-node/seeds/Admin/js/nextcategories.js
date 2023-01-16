console.log("File included");

$(document).ready(async function () {
  console.log("add next category event is called");

    //web3 = new Web3(web3.currentProvider);
    //var sAccount;
    //let aAccounts = await web3.eth.getAccounts();

    //sAccount = aAccounts[0];

    //if (sAccount == undefined || sAccount == null) {

    //    return;
    //}
   

    // Add Placeholder to the search box
   


    $("#btnCreateCat1").on("click", async () => {
        // $('#preloader').addClass(5000);
        // $('#main-wrapper').removeClass('show');

        console.log("start time is----->",$("#category_startTime").val())
        let dt = $("#category_startTime").val();
        dt=new Date(dt);
        console.log("dt is---->",dt);

    //const ct = new Date();
    //console.log("dt  is----->",dt.getTime());
    //console.log(" ct is----->",ct.getTime());

    //if (dt.getTime() < ct.getTime()) {
    //    console.log("true")
    //    $('#lblcategory_startTime').html('Start time should be greate than previos time!');
    //    $("#lblcategory_startTime").removeClass("d-none");
    //    return;
    //}
        
    //    if (!(await ethereum._metamask.isUnlocked())) {
    //        $('#lblAmountError').html('MetaMask Is Locked, Please Unlock It & Reload The Page To Connect!');
    //        $("#lblAmountError").removeClass("d-none");
    //        return;
    //    }


    //    window.ethereum.enable();
    //    web3 = new Web3(web3.currentProvider);
    //    var sAccount;
    //    let aAccounts = await web3.eth.getAccounts();
    //    sAccount = aAccounts[0];
    //    console.log(aAccounts);


        let obj = {
            starttime: dt,
         
        };
        //// 
        
        //nextCategory
        $.ajax({
            type: "POST",
            url: "/api/v1/admin/nextCategory",
            data: obj,
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
        //window.location.reload();

       

      
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
