const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    sWalletAddress: {
        type: String,
        unique: true,
        require: true
    },
    sUserName: {
        type: String,
        default: ""
    },
    sEmail: {
        type: String
    },
    oName: {
        sFirstname: String,
        sLastname: String
    },
    sRole: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    sCreated: {
        type: Date,
        default: Date.now
    },
    sStatus: String,
    sHash: String,
    sBio: String,
    sWebsite: String,
    sProfilePicUrl: String,
    sResetPasswordToken: String,
    sResetPasswordExpires: String,
    user_followings:[{
        type: mongoose.Schema.ObjectId
    }]
});
// userSchema.set( 'toJSON', { getters: true } )
module.exports = mongoose.model('User', userSchema);