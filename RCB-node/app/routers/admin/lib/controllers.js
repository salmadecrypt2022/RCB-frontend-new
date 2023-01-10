const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const {
    User,
    Category
} = require('../../../models');
const {
    nodemailer
} = require('../../../utils/index');
const validators = require("./validators");

const controllers = {};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, process.cwd() + '/nft');
    },
    filename: (req, file, callback) => {
        callback(null, new Date().getTime() + '_' + file.originalname);
    }
});
let oMulterObj = {
    storage: storage,
    limits: {
        fileSize: 15 * 1024 * 1024 // 15mb
    },
};

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const upload = multer(oMulterObj).single('userProfile');

controllers.updateProfile = async (req, res, next) => {

    try {
        if (!req.userId) return res.reply(messages.unauthorized());

        let oProfileDetails = {};

        await upload(req, res, async (erro) => {

            if (!req.body.sUserName) return res.reply(messages.not_found("User Name"));
            if (!req.body.sFirstname) return res.reply(messages.not_found("First Name"));
            if (!req.body.sLastname) return res.reply(messages.not_found("Last Name"));

            if (_.isUserName(req.body.sUserName)) return res.reply(messages.invalid("User Name"));
            if (_.isUserName(req.body.sFirstname)) return res.reply(messages.invalid("First Name"));
            if (_.isUserName(req.body.sLastname)) return res.reply(messages.invalid("Last Name"));

            oProfileDetails = {
                sUserName: req.body.sUserName,
                oName: {
                    sFirstname: req.body.sFirstname,
                    sLastname: req.body.sLastname
                },
            };
            // if (req.file != undefined) {

            //     await cloudinary.uploader.upload(req.file.path, {
            //         folder: "RCB/User_Profile"
            //     })
            //         .then(image => {
            //             oProfileDetails["sProfilePicUrl"] = image.url;
            //             fs.unlinkSync(req.file.path);
            //         })
            //         .catch(err => {
            //             if (err) return res.reply(messages.error("Image Upload Failed"));
            //         });
            // }
            User.findByIdAndUpdate(req.userId, oProfileDetails,
                (err, user) => {
                    if (err) return res.reply(messages.server_error());
                    if (!user) return res.reply(messages.not_found('User'));
                    req.session["admin_firstname"] = req.body.sFirstname;
                    return res.reply(messages.updated('Admin Profile'));
                });
        });
    } catch (error) {
        return res.reply(messages.server_error());
    }
}

controllers.users = async (req, res, next) => {
    try {
        // Per page limit
        var nLimit = parseInt(req.body.length);
        // From where to start
        var nOffset = parseInt(req.body.start);

        // Get total number of records
        let nTotalUsers = await User.countDocuments({
            "sRole": {
                $ne: "admin"
            }
        });

        var oSearchData = {
            $or: []
        };

        if (req.body.search.value != '') {

            var re = new RegExp(`.*${req.body.search.value}.*`, 'i');

            oSearchData['$or'].push({
                'sUserName': re
            });
        }

        if (!oSearchData['$or'].length) {
            delete oSearchData['$or'];
        }

        let oSortingOrder = {};
        oSortingOrder[req.body.columns[parseInt(req.body.order[0].column)].data] = (req.body.order[0].dir == "asc") ? 1 : -1;

        let aUsers = await User.aggregate([{
            "$sort": oSortingOrder
        },
        {
            "$match": {
                "$and": [{
                    "sRole": {
                        $eq: "user"
                    }
                }, oSearchData]
            }
        },
        {
            "$project": {
                sUserName: 1,
                sWalletAddress: 1,
                sStatus: 1
            }
        },
        {
            "$limit": nOffset + nLimit
        },
        {
            "$skip": nOffset
        }
        ]);

        let nNumberOfRecordsInSearch = await User.aggregate([{
            "$match": {
                "$and": [{
                    "sRole": {
                        $eq: "user"
                    }
                }, oSearchData]
            }
        }]);

        return res.reply(messages.success(), {
            data: aUsers,
            draw: req.body.draw,
            "recordsTotal": nTotalUsers,
            "recordsFiltered": nNumberOfRecordsInSearch.length
        });

    } catch (err) {
        log.error(err)
        return res.reply(messages.server_error());
    }
}

controllers.toggleUserStatus = async (req, res, next) => {
    try {
        if (!req.body.sObjectId) return res.reply(messages.not_found("User ID"));
        if (!req.body.sStatus) return res.reply(messages.not_found("Status"));

        if (!validators.isValidUserStatus(req.body.sStatus)) return res.reply(messages.invalid("Status"));
        if (!validators.isValidObjectID(req.body.sObjectId)) res.reply(messages.invalid("User ID"));

        User.findByIdAndUpdate(req.body.sObjectId, {
            sStatus: req.body.sStatus
        },
            (err, user) => {
                if (err) {
                    log.red(err);
                    return res.reply(messages.server_error());
                }
                if (!user) return res.reply(messages.not_found('User'));
                return res.reply(messages.updated('User Status'));
            });
    } catch (error) {
        return res.reply(messages.server_error());
    }
}





controllers.categoriesList = async (req, res, next) => {
    try {
        // Per page limit
        var nLimit = parseInt(req.body.length);
        // From where to start
        var nOffset = parseInt(req.body.start);

        // Get total number of records
        let nTotalCategory = await Category.countDocuments({
            // "sRole": {
            //     $ne: "admin"
            // }
        });

        var oSearchData = {
            $or: []
        };

        if (req.body.search.value != '') {

            var re = new RegExp(`.*${req.body.search.value}.*`, 'i');

            oSearchData['$or'].push({
                'sStatus': re
            });
        }

        if (!oSearchData['$or'].length) {
            delete oSearchData['$or'];
        }

        let oSortingOrder = {};
        oSortingOrder[req.body.columns[parseInt(req.body.order[0].column)].data] = (req.body.order[0].dir == "asc") ? 1 : -1;

        let aUsers = await Category.aggregate([{
            "$sort": oSortingOrder
        },
        {
            "$match": {
                "$and": [oSearchData]
            }
        },
        {
            "$limit": nOffset + nLimit
        },
        {
            "$skip": nOffset
        }
        ]);

        let nNumberOfRecordsInSearch = await Category.aggregate([{
            "$match": {
                "$and": [oSearchData]
            }
        }]);

        return res.reply(messages.success(), {
            data: aUsers,
            draw: req.body.draw,
            "recordsTotal": nTotalCategory,
            "recordsFiltered": nNumberOfRecordsInSearch.length
        });

    } catch (err) {
        log.error(err)
        return res.reply(messages.server_error());
    }
}





controllers.createCategory = async (req, res, next) => {
    try {

        let createData = await Category.create(req.body);
        if (createData && createData != null) {

            return res.reply(messages.success(), {
                data: createData,
                message: 'Category created successfully.'
            });
        }

    } catch (err) {
        log.error(err)
        return res.reply(messages.server_error());
    }
}
module.exports = controllers;