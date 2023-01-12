const fs = require('fs');
const pinataSDK = require('@pinata/sdk');
const multer = require('multer');
const mongoose = require('mongoose');
const pinata = pinataSDK(process.env.PINATAAPIKEY, process.env.PINATASECRETAPIKEY);
const {
    User, Category, Subscribe
} = require('../../../models');
const _ = require('../../../../globals/lib/helper');

const validators = require("./validators");
const controllers = {};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, process.cwd() + '/usersImages');
    },
    filename: (req, file, callback) => {
        callback(null, new Date().getTime() + '_' + file.originalname);
    }
});
let fileFilter = function (req, file, cb) {
    var allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb({
            success: false,
            message: 'Invalid file type! Only JPG, JPEG & PNG image files are allowed.'
        }, false);
    }
};

let oMulterObj = {
    storage: storage,
    limits: {
        fileSize: 8 * 1024 * 1024 // 8mb
    },
    fileFilter: fileFilter
};

controllers.profile = (req, res) => {
    try {
        if (!req.userId) {
            return res.reply(messages.unauthorized());
        }
        User.findOne({
            _id: req.userId
        }, {
            oName: 1,
            sUserName: 1,
            sCreated: 1,
            sEmail: 1,
            sWalletAddress: 1,
            sProfilePicUrl: 1,
            sWebsite: 1,
            sBio: 1
        }, (err, user) => {
            if (err) return res.reply(messages.server_error());
            if (!user) return res.reply(messages.not_found('User'));
            return res.reply(messages.no_prefix('User Details'), user);
        });
    } catch (error) {
        return res.reply(messages.server_error());
    }
};

const upload = multer(oMulterObj).single('userProfile');

controllers.updateProfile = async (req, res, next) => {
    try {
        if (!req.userId) return res.reply(messages.unauthorized());

        // File upload
        let oProfileDetails = {};

        await upload(req, res, async (error) => {

            if (error) return res.reply(messages.bad_request(error.message));

            if (!req.body.sUserName) return res.reply(messages.not_found("Username"));
            // if (!req.body.sFirstname) return res.reply(messages.not_found("First Name"));
            // if (!req.body.sLastname) return res.reply(messages.not_found("Last Name"));

            // if (!validators.isValidString(req.body.sFirstname) || !validators.isValidName(req.body.sFirstname)) return res.reply(messages.invalid("First Name"));
            // if (!validators.isValidString(req.body.sLastname) || !validators.isValidName(req.body.sLastname)) return res.reply(messages.invalid("Last Name"));
            if (!validators.isValidString(req.body.sUserName));

            // if (req.body.sWebsite.trim() != "") {
            //     if (req.body.sWebsite.trim().length > 2083)
            //         return res.reply(messages.invalid("Website"));

            //     const reWebsite = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
            //     if (!reWebsite.test(req.body.sWebsite.trim()))
            //         return res.reply(messages.invalid("Website"));
            // }

            if (req.body.sBio.trim() != "")
                if (req.body.sBio.trim().length > 1000)
                    return res.reply(messages.invalid("Bio"));

            await User.findOne({
                sUserName: req.body.sUserName
            }, async (err, user) => {
                if (err) return res.reply(messages.server_error());
                if (user)
                    if (user._id != req.userId)
                        return res.reply(messages.already_exists("User with Username '" + req.body.sUserName + "'"));

                oProfileDetails = {
                    sUserName: req.body.sUserName,
                    // oName: {
                    //     sFirstname: req.body.sFirstname,
                    //     sLastname: req.body.sLastname
                    // },
                    sWebsite: req.body.sWebsite,
                    sBio: req.body.sBio,
                    sEmail: req.body.sEmail,
                }
                if (req.file != undefined) {
                    const aAllowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
                    log.green(req.file.mimetype);
                    if (!aAllowedMimes.includes(req.file.mimetype)) {
                        return res.reply(messages.invalid("File Type"));
                    }
                    const oOptions = {
                        pinataMetadata: {
                            name: req.file.originalname,
                        },
                        pinataOptions: {
                            cidVersion: 0
                        }
                    };

                    const readableStreamForFile = fs.createReadStream(req.file.path);

                    await pinata.pinFileToIPFS(readableStreamForFile, oOptions).then(async (result) => {
                        oProfileDetails["sProfilePicUrl"] = result.IpfsHash;
                        fs.unlinkSync(req.file.path)

                    }).catch((err) => {
                        //handle error here
                        return res.reply(messages.error("From Pinata"));
                    });
                }
                await User.findByIdAndUpdate(req.userId, oProfileDetails,
                    (err, user) => {
                        if (err) return res.reply(messages.server_error());
                        if (!user) return res.reply(messages.not_found('User'));
                        req.session["name"] = req.body.sFirstname;
                        return res.reply(messages.updated('User Details'));
                    });

            });

        })
    } catch (error) {
        return res.reply(messages.server_error());
    }
}

controllers.getUserProfilewithNfts = async (req, res) => {
    try {

        if (!req.body.userId) {
            return res.reply(messages.unauthorized());
        }
        User.findOne({
            _id: req.body.userId
        }, {
            oName: 1,
            sUserName: 1,
            sCreated: 1,
            sEmail: 1,
            sWalletAddress: 1,
            sProfilePicUrl: 1,
            sWebsite: 1,
            sBio: 1
        }, (err, user) => {
            if (err) return res.reply(messages.server_error());
            if (!user) return res.reply(messages.not_found('User'));

            return res.reply(messages.no_prefix('User Details'), user);
        });

    } catch (error) {
        log.red(error)
        return res.reply(messages.server_error());
    }
}

controllers.getAllUserDetails = async (req, res) => {
    try {

        var nLimit = parseInt(req.body.length);
        var nOffset = parseInt(req.body.start);

        let aggQuery = [];
        if (!req.userId) {

            aggQuery = [{
                '$sort': {
                    'sCreated': -1
                }
            }, {
                '$project': {
                    sWalletAddress: 1,
                    sUserName: 1,
                    sEmail: 1,
                    oName: 1,
                    sRole: 1,
                    sCreated: 1,
                    sStatus: 1,
                    sHash: 1,
                    sBio: 1,
                    sWebsite: 1,
                    sProfilePicUrl: 1,
                    aCollaborators: 1,
                    sResetPasswordToken: 1,
                    sResetPasswordExpires: 1,
                    is_user_following: 'false',
                    user_followings: 1,
                    user_followings_size: {
                        $cond: {
                            if: {
                                $isArray: "$user_followings"
                            },
                            then: {
                                $size: "$user_followings"
                            },
                            else: 0
                        }
                    }
                }
            }, {
                '$facet': {
                    'users': [{
                        "$skip": nOffset
                    }, {
                        "$limit": nLimit
                    }],
                    'totalCount': [{
                        '$count': 'count'
                    }]
                }
            }];

        } else {
            aggQuery = [{
                $match: {
                    _id: { $ne: mongoose.Types.ObjectId(req.userId) }
                }
            }, {
                '$sort': {
                    'sCreated': -1
                }
            }, {
                $project: {
                    sWalletAddress: 1,
                    sUserName: 1,
                    sEmail: 1,
                    oName: 1,
                    sRole: 1,
                    sCreated: 1,
                    sStatus: 1,
                    sHash: 1,
                    sBio: 1,
                    sWebsite: 1,
                    sProfilePicUrl: 1,
                    aCollaborators: 1,
                    sResetPasswordToken: 1,
                    sResetPasswordExpires: 1,
                    user_followings: {
                        "$size": {
                            "$filter": {
                                "input": "$user_followings",
                                "as": "user_followings",
                                "cond": {
                                    $eq: ["$$user_followings", mongoose.Types.ObjectId(req.userId)]
                                }
                            }
                        }
                    },
                    user_followings_size: {
                        $cond: {
                            if: {
                                $isArray: "$user_followings"
                            },
                            then: {
                                $size: "$user_followings"
                            },
                            else: 0
                        }
                    }
                }
            }, {
                $project: {
                    sWalletAddress: 1,
                    sUserName: 1,
                    sEmail: 1,
                    oName: 1,
                    sRole: 1,
                    sCreated: 1,
                    sStatus: 1,
                    sHash: 1,
                    sBio: 1,
                    sWebsite: 1,
                    sProfilePicUrl: 1,
                    aCollaborators: 1,
                    sResetPasswordToken: 1,
                    sResetPasswordExpires: 1,
                    is_user_following: {
                        $cond: {
                            if: {
                                $gte: ["$user_followings", 1]
                            },
                            then: 'true',
                            else: 'false'
                        }
                    },
                    user_followings_size: 1
                }
            }, {
                '$facet': {
                    'users': [{
                        "$skip": +nOffset
                    }, {
                        "$limit": +nLimit
                    }],
                    'totalCount': [{
                        '$count': 'count'
                    }]
                }
            }];
        }
        let data = await User.aggregate(aggQuery).catch((er) => {
            console.log('-----------------------err', er)
        })

        let iFiltered = data[0].users.length;
        if (data[0].totalCount[0] == undefined) {
            return res.reply(messages.success('Data'), {
                data: 0,
                "draw": req.body.draw,
                "recordsTotal": 0,
                "recordsFiltered": iFiltered,
            });
        } else {
            return res.reply(messages.no_prefix('User Details'), {
                data: data[0].users,
                "draw": req.body.draw,
                "recordsTotal": data[0].totalCount[0].count,
                "recordsFiltered": iFiltered,
            });
        }

    } catch (error) {
        log.red(error)
        return res.reply(messages.server_error());
    }
}


controllers.followUser = async (req, res) => {
    try {
        if (!req.userId) return res.reply(messages.unauthorized());

        let {
            id
        } = req.body;

        return User.findOne({ _id: mongoose.Types.ObjectId(id) }).then(async (userData) => {
            if (userData && userData != null) {
                let followMAINarray = [];
                followMAINarray = userData.user_followings;

                let flag = '';

                let followARY = userData.user_followings && userData.user_followings.length ? userData.user_followings.filter((v) => v.toString() == req.userId.toString()) : [];

                if (followARY && followARY.length) {
                    flag = 'dislike';
                    var index = followMAINarray.indexOf(followARY[0]);
                    if (index != -1) {
                        followMAINarray.splice(index, 1);
                    }
                } else {
                    flag = 'like';
                    followMAINarray.push(mongoose.Types.ObjectId(req.userId))
                }

                await User.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(id) }, { $set: { user_followings: followMAINarray } }).then((user) => {

                    // if (err) return res.reply(messages.server_error());

                    if (flag == 'like') {
                        return res.reply(messages.updated('User followed successfully.'));
                    } else {
                        return res.reply(messages.updated('User unfollowed successfully.'));
                    }

                });


            } else {
                return res.reply(messages.bad_request('User not found.'));
            }
        })

    } catch (error) {
        log.red(error)
        return res.reply(messages.server_error());
    }
}


controllers.getCategoryByActive = async (req, res, next) => {
    try {
        let findData = await Category.findOne({ category_status: 'active' });
        if (findData && findData != null) {
            // starttime: "1645728216"
            // endtime: "1920002931"
            let currentDate = new Date().getTime();
            currentDate = parseInt(currentDate) / 1000;
            currentDate = parseInt(currentDate);
            findData = findData.toObject();

            let start_date = parseInt(findData.starttime);
            let end_date = parseInt(findData.endtime);

            if (start_date < currentDate && end_date > currentDate) {
                findData.status = "ongoing";
              } else {
                if (start_date > currentDate) {
                  findData.status = "upcoming";
                }
                if (currentDate > end_date) {
                  findData.status = "completed";
                }
              }

              

            return res.reply(messages.success(), {
                data: findData,
                message: 'Category finded successfully.'
            });
        }else{
            return res.reply(messages.success(), {
                data:{},
                message: 'Category finded successfully.'
            });
        }

    } catch (err) {
        log.error(err)
        return res.reply(messages.server_error());
    }
}



controllers.subscribe = async (req, res, next) => {
    try {
        let findData = await Subscribe.find(req.body);
        if (findData.length) {
            return res.reply(messages.success(), {
                data: {},
                message: 'You already subscribed.',
                code:400
            });
        }
        let createData = await Subscribe.create(req.body);
        if (createData && createData != null && createData != undefined) {
            return res.reply(messages.success(), {
                data: createData,
                message: 'Subscribed successfully.',
                code:200
            });
        } else {

            return res.reply(messages.server_error(), {
                data: {},
                message: 'Internal server err.',
                code:404
            });
        }


    } catch (err) {
        log.error(err)
        return res.reply(messages.server_error());
    }
}


module.exports = controllers;