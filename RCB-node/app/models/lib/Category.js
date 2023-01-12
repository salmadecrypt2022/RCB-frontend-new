const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    starttime: {
        type: String,
    },
    endtime: {
        type: String,
        default: ""
    },
    maxPerAddress: {
        type: String
    },
    categoryTokencap: {
        type: String
    },
    category_type: {
        type: String,
        enum: ['private', 'public'],
        default: 'public'
    },
    sCreated: {
        type: Date,
        default: Date.now
    },
    sStatus: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
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
    category_id: {
        type: Number,
        default: 0
    },
    category_status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    },
    category_name: {
        type: String,
    },
    sWalletAddress: {
        type: String
    },
    sPrice: {
        type: String
    },
    users:[{ type: String}]
});
// categorySchema.set( 'toJSON', { getters: true } )
module.exports = mongoose.model('Category', categorySchema);