const mongoose = require('mongoose');

const reserveSchema = mongoose.Schema({
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
    user_address: {
        type: String
    },
    sId: {
        type: String
    },
});
// reserveSchema.set( 'toJSON', { getters: true } )
module.exports = mongoose.model('Reserve', reserveSchema);