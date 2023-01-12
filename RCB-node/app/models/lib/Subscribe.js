const mongoose = require('mongoose');

const subscribeSchema = mongoose.Schema({
    sCreated: {
        type: Date,
        default: Date.now
    },
    sEmail: {
        type: String,
        unique: true 
    },
});
module.exports = mongoose.model('Subscribe', subscribeSchema);