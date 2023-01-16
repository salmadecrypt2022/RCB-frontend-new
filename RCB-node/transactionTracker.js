const Web3 = require("web3");
const mongoose = require('mongoose');
const config = require("dotenv").config();
const {
   Category, Transaction,Reserve
} = require("./app/models");

// TODO: Change the URL to MainNet URL
var web3 = new Web3(process.env.NETWORK_RPC_URL);

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
};
mongoose
    .connect(process.env.DB_URL, options)
    .then(() => console.log('Database connected'))
    .catch((error) => {
        throw error;
    });

// let receipt = web3.eth.getTransactionReceipt().then((receipt) => {
//     console.log(receipt);
//     let oTokenCounterEvent = web3.eth.abi.decodeLog([{
//         type: 'uint256',
//         name: 'tokenID'
//     }], (receipt.logs[2] === undefined) ? receipt.logs[1].data : receipt.logs[2].data);
//     console.log(oTokenCounterEvent);
// });

async function categoryChecker() {

    try {
        //console.log("Checking for pending Mints 1...");
        let aCategories = await Category.find({
            sTransactionStatus: 0
        });
       
        for (let index = 0; index < aCategories.length; index++) {
            try {
              
                let receipt = await web3.eth.getTransactionReceipt(aCategories[index].sTransactionHash);
               
                if (receipt === null)
                    return;
                    console.log('---------receipt for category-----------------',receipt)
                if (receipt.status === true) {
                    let oTokenCounterEvent = web3.eth.abi.decodeLog([{
                        type: 'uint256',
                        name: 'id'
                    }], receipt.logs[0].data); // log[1] for ERC1155 and log[2] for ERC721
                    console.log('---------oTokenCounterEvent-----------------',oTokenCounterEvent)

                    await Category.findByIdAndUpdate(aCategories[index]._id, {
                        sTransactionStatus: 1,
                        category_id:oTokenCounterEvent.id
                    });
                } else if (receipt.status === false) {
                    await Category.findByIdAndUpdate(aCategories[index]._id, {
                        sTransactionStatus: -1
                    });
                }
            } catch (error) {
                console.log(error);
            }
        }
    } catch (error) {
        console.log(error);
    }
}

async function transactionChecker() {

    try {
        //console.log("Checking for pending Mints 2...");
        let aTransactions = await Transaction.find({
            sTransactionStatus: 0
        });
        for (let index = 0; index < aTransactions.length; index++) {
            try {
                let receipt = await web3.eth.getTransactionReceipt(aTransactions[index].sTransactionHash);
                if (receipt === null)
                    return;
                    console.log('---------receipt-----------------',receipt)
                if (receipt.status === true) {
                    let oTokenCounterEvent = web3.eth.abi.decodeLog([{
                        type: 'uint256',
                        name: 'id'
                    }], receipt.logs[0].data); // log[1] for ERC1155 and log[2] for ERC721
                    console.log('---------true-----------------',oTokenCounterEvent)
                    // msg.sender, _categoryId, _quantity
                    await Transaction.findByIdAndUpdate(aTransactions[index]._id, {
                        sTransactionStatus: 1,
                     
                    });
                } else if (receipt.status === false) {
                    console.log('---------false-----------------',)

                    await Transaction.findByIdAndUpdate(aTransactions[index]._id, {
                        sTransactionStatus: -1
                    });
                }
            } catch (error) {
                console.log(error);
            }
        }
    } catch (error) {
        console.log(error);
    }
}


async function reserveChecker() {

    try {
        //console.log("Checking for pending Mints 3...");
        let aReserves = await Reserve.find({
            sTransactionStatus: 0
        });
        for (let index = 0; index < aReserves.length; index++) {
            try {
                let receipt = await web3.eth.getTransactionReceipt(aReserves[index].sTransactionHash);
                if (receipt === null)
                    return;
                    console.log('---------receipt-----------------',receipt)
                if (receipt.status === true) {
                    let oTokenCounterEvent = web3.eth.abi.decodeLog([{
                        type: 'uint256',
                        name: '_tokenID'
                    }], receipt.logs[0].data); // log[1] for ERC1155 and log[2] for ERC721
                    console.log('---------true-----------------',oTokenCounterEvent)
                    // msg.sender, _categoryId, _quantity
                    await Reserve.findByIdAndUpdate(aReserves[index]._id, {
                        sTransactionStatus: 1,
                        sId:oTokenCounterEvent._tokenID,
                    });
                } else if (receipt.status === false) {
                    console.log('---------false-----------------',)

                    await Reserve.findByIdAndUpdate(aReserves[index]._id, {
                        sTransactionStatus: -1
                    });
                }
            } catch (error) {
                console.log(error);
            }
        }
    } catch (error) {
        console.log(error);
    }
}


 setInterval(() => {
 categoryChecker();
 transactionChecker();
 reserveChecker();

 }, 7000);
