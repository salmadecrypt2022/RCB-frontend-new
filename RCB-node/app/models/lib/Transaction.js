const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    quantity: {
        type: String,
    },
    category_id: {
        type: String,
        default: ""
    },
    sCreated: {
        type: Date,
        default: Date.now
    },
    sTransactionHash: {
        type: String
    },
    sTransactionStatus: {
        type: Number,
        default: -99,
        // -99: Transaction not submitted to Blockchain
        // -1:  Transaction Failed
        //  0:  Pending
        //  1:  Mined
        enum: [-99, -1, 0, 1]
    },
    sWalletAddress: {
        type: String
    },
    sPrice: {
        type: String
    },
});
// transactionSchema.set( 'toJSON', { getters: true } )
module.exports = mongoose.model('Transaction', transactionSchema);