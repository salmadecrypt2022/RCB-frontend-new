let token = window.localStorage.getItem('Authorization');
// $("#loggedInUserName").text();
let bIsValidAccountSelected = true;
let bIsValidNetworkSelected = true;

// To set duration for auto logout
let flushDuration = (localStorage.getItem("flushDuration") != null) ? localStorage.getItem("flushDuration") : 0;

if (flushDuration > 0) {
    setTimeout(() => {
        logout();
    }, flushDuration);

    setInterval(() => {
        flushDuration -= 1000;
    }, 1000);
}

window.onbeforeunload = function () {
    localStorage.setItem("flushDuration", flushDuration);
}

$(async () => {
    await loadRedeemablePoints();
});

try {
    window.ethereum.on('accountsChanged', function (accounts) {
        window.localStorage.setItem('sWalletAddress', accounts[0]);
        console.log("1111")
        location.reload();
    });
    window.ethereum.on('chainChanged', function () {
        location.reload();
    });
} catch (error) {
    if (!window.ethereum) {
        bIsValidAccountSelected = false;
        // Display Error message in Redeem Points Model
        $("#lblAmountError").text("No Ethereum Client Fount");
        $("#lblAmountError").removeClass("d-none");
        // Disable Redeem points field and Redeem Button
        $("#redeemPoints").prop("disabled", true);
        $("#btnRedeem").prop("disabled", true);
        bIsValidAccountSelected = false;
        bIsValidNetworkSelected = false;
    }
    console.log(error);
}

function logout() {
    $.ajax({
        type: "POST",
        url: "/api/v1/auth/logout",
        headers: {
            'Authorization': token
        },
        success: function (result, status, xhr) {
            toastr["success"](xhr.responseJSON.message);
            setTimeout(function () {
                window.localStorage.removeItem('Authorization');
                window.localStorage.removeItem('sWalletAddress');
                window.location.href = '/a/signin';
            }, 500)
        },
        error: function (xhr, status, error) {
            console.log('====================================');
            console.log(xhr);
            console.log('====================================');
            toastr["error"](xhr.responseJSON.message);
            return false;
        }
    });
}

$('#logout').on('click', logout);

async function loadRedeemablePoints() {

    if (!(await ethereum._metamask.isUnlocked())) {

        // Display Error message in Redeem Points Model
        $("#lblTokenURI").text("MetaMask Is Locked, Please Unlock It & Reload The Page To Connect!");
        $("#lblTokenURI").removeClass("d-none");
        // Disable Redeem points field and Redeem Button
        $("#redeemPoints").prop("disabled", true);
        $("#btnRedeem").prop("disabled", true);
        return;
    }

    const provider = window['ethereum'];
    var network = provider.networkVersion;
    if (network != 80001 && network != 137) {
        console.log('---------------------------network---111',)

        let sNetworkName;
        switch (network) {
            case "80001":
                sNetworkName = "Mumbai Testnet";
                break;
            case "137":
                sNetworkName = "Matic Mainnet";
                break;

            default:
                sNetworkName = "Unknown";
        }
        bIsValidNetworkSelected = false;
        // Display Error message in Redeem Points Model
        $("#lblTokenURI").text("Wrong Network Selected!");
        $("#lblTokenURI").removeClass("d-none");
        // Disable Redeem points field and Redeem Button
        $("#tokenURI").prop("disabled", true);
        $("#btnRedeem").prop("disabled", true);
        return;
    }

    web3 = new Web3(web3.currentProvider);
    var sAccount;
    let aAccounts = await web3.eth.getAccounts();
    sAccount = aAccounts[0];
    if (sAccount != undefined || sAccount != null) {

        if (window.localStorage.getItem("sWalletAddress") != sAccount) {
            bIsValidAccountSelected = false;
            // Display Error message in Redeem Points Model
            $("#lblTokenURI").text("Please connect metamast wallet first.");
            $("#lblTokenURI").removeClass("d-none");
            // Disable Redeem points field and Redeem Button
            $("#tokenURI").prop("disabled", true);
            $("#btnRedeem").prop("disabled", true);
            return;
        }
        // var oContract = new web3.eth.Contract(abi, mainContractAddress)

        // let URI = await oContract.methods.baseURI().call({
        //     from: sAccount
        // });

        // console.log(URI);

        // $("#txtRedeemablePoints").text(URI);
    } else {
        toastr["error"]("Please connect with metamask.");
        window.ethereum.enable();
    }

}


$("#ConnectWallet").on("click", async () => {
    if (!window.ethereum) {
        toastr["error"]("No Ethereum Client Found.");
        return;
    }

    if (!(await ethereum._metamask.isUnlocked())) {
        toastr["error"]('MetaMask Is Locked, Please Unlock It & Reload The Page To Connect!');
        return;
    }
    window.ethereum.enable();
})

$("#btnRedeem").on("click", async () => {
    if (!(await ethereum._metamask.isUnlocked())) {
        $('#lblTokenURI').html('MetaMask Is Locked, Please Unlock It & Reload The Page To Connect!');
        $("#lblTokenURI").removeClass("d-none");
        return;
    }

    if ($("#tokenURI").val() == '') {
        $("#lblTokenURI").text("Please Enter base URI!");
        $("#lblTokenURI").removeClass("d-none");
        return;
    }


    if (!bIsValidAccountSelected) {
        toastr["error"]("You've selected Wrong Address in MetaMask! Please Select Your Address.");
        return;
    }
    if (!bIsValidNetworkSelected) {
        toastr["error"]('<strong>Attention!</strong> Please connect MetaMask on <b>BSC TestNet</b> You are on ' + sNetworkName + '.');
        return;
    }

    $("#lblAmountError").addClass("d-none");
    $("#btnRedeem").html("<div class='spinner-border spinner-border-sm'></div>").prop("disabled", true);

    web3 = new Web3(web3.currentProvider);
    var sAccount;
    let aAccounts = await web3.eth.getAccounts();
    sAccount = aAccounts[0];
    var oContract = new web3.eth.Contract(abi, mainContractAddress)

    await oContract.methods.setBaseURILink($("#tokenURI").val()).send({
        from: sAccount
    }).then((receipt) => {
        console.log(receipt);
        toastr["success"]("base URI set Successfully!");
        setInterval(() => {
            location.reload();
        }, 1000);
    }).catch((error) => {
        console.log(error);
        if (error.code == 4001)
            toastr["error"]("You Denied Transaction Request!");
        else
            toastr["error"]("Something Went Wrong!");
    });
});