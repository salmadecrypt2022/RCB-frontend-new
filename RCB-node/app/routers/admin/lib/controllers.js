const fs = require('fs');
const mongoose = require('mongoose');

const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const {
    User,
    Category,
    Reserve,
    nextCategory
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

controllers.toggleCategoryStatus = async (req, res, next) => {
    try {
        if (!req.body.sObjectId) return res.reply(messages.not_found("Category ID"));

        if (!validators.isValidObjectID(req.body.sObjectId)) res.reply(messages.invalid("Category ID"));

        Category.findByIdAndUpdate(req.body.sObjectId, {
            category_status: 'active'
        },
            async(err, user) => {

                await Category.updateMany({_id:{$ne:mongoose.Types.ObjectId(req.body.sObjectId)}}, {$set:{
                    category_status: 'inactive'
                }})
                if (err) {
                    log.red(err);
                    return res.reply(messages.server_error());
                }
                if (!user) return res.reply(messages.not_found('User'));
                return res.reply(messages.updated('Category Status'));
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


controllers.reserves = async (req, res, next) => {
    try {
        // Per page limit
        var nLimit = parseInt(req.body.length);
        // From where to start
        var nOffset = parseInt(req.body.start);

        // Get total number of records
        let nTotalReserve = await Reserve.countDocuments({

        });


        let oSortingOrder = {};
        oSortingOrder[req.body.columns[parseInt(req.body.order[0].column)].data] = (req.body.order[0].dir == "asc") ? 1 : -1;

        let aReserves = await Reserve.aggregate([{
            "$sort": oSortingOrder
        },
        {
            "$match": {
                
            }
        },
        {
            "$limit": nOffset + nLimit
        },
        {
            "$skip": nOffset
        }
        ]);

        let nNumberOfRecordsInSearch = await Reserve.aggregate([{
            "$match": {
               
            }
        }]);

        return res.reply(messages.success(), {
            data: aReserves,
            draw: req.body.draw,
            "recordsTotal": nTotalReserve,
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



controllers.reserveToken = async (req, res, next) => {
    try {

        let createData = await Reserve.create(req.body);
        if (createData && createData != null) {

            return res.reply(messages.success(), {
                data: createData,
                message: 'Reserved successfully.'
            });
        }

    } catch (err) {
        log.error(err)
        return res.reply(messages.server_error());
    }
}

controllers.updateCategory = async (req, res, next) => {
    try {
       let upDateData =  await Category.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) },{$set:req.body});
        if (upDateData && upDateData != null) {

            return res.reply(messages.success(), {
                data: upDateData,
                message: 'Category updated successfully.'
            });
        }

    } catch (err) {
        log.error(err)
        return res.reply(messages.server_error());
    }
}
controllers.usersInCategory = async (req, res, next) => {
    try {
        // {}req.body
        let data = await User.find({
            "sRole": {
                $ne: "admin"
            }
        });
        if (data && data != null) {

            return res.reply(messages.success(), {
                data: data,
                message: 'Users listed successfully.'
            });
        }

    } catch (err) {
        log.error(err)
        return res.reply(messages.server_error());
    }
}


controllers.allowUser = async (req, res, next) => {
    try {
        // category_id:cat_id,
        // sTransactionHash: '',
        // sTransactionStatus: 0,
        // sWalletAddress: sAccount,
        // user_address: $("#user_address").val(),
        let { user_address, category_id ,_id} = req.body;
        let data = await Category.findOne({ _id: mongoose.Types.ObjectId(_id) });
        if (data && data != null) {
            let ary = [];

            if (data && data.users.length) {

                const regex = new RegExp(user_address, 'i');

                let matchedSites = data.users.filter((href) => href.match(regex));

                ary = data.users;
                if(!matchedSites.length){
                   ary.push(user_address);
                }
            }else{
                ary.push(user_address);
            }


            await Category.findOneAndUpdate({ _id: mongoose.Types.ObjectId(_id) },{$set:{users:ary}});
            return res.reply(messages.success(), {
                data: data,
                message: 'Users allowed successfully.'
            });
        } else {
            return res.reply(messages.server_error(), {
                data: {},
                message: 'Category not found.'
            });
        }

    } catch (err) {
        log.error(err)
        return res.reply(messages.server_error());
    }
}

controllers.getDashboardData = async (req, res) => {
    try {
        if (!req.userId) return res.reply(messages.unauthorized());

        let nTotalRegisterUsers = 0;

        nTotalRegisterUsers = await User.collection.countDocuments({
            sRole: 'user'
        });
        let data = await User.aggregate([{
                $match: {
                    sRole: 'user'
                }
            },
            {
                $group: {
                    _id: {
                        day: {
                            $dayOfMonth: "$sCreated"
                        },
                        month: {
                            $month: "$sCreated"
                        },
                        year: {
                            $year: "$sCreated"
                        }
                    },
                    count: {
                        $sum: 1
                    },
                    date: {
                        $first: "$sCreated"
                    },
                },
            },
            {
                $sort: {
                    date: -1
                }
            }
        ]);

   
        return res.reply(messages.success(), {
            nTotalRegisterUsers,
            data
        });
    } catch (error) {
        return res.reply(messages.server_error());
    }
};

controllers.getCategoryById = async (req, res, next) => {
    try {
       let upDateData =  await Category.findOne({ _id: mongoose.Types.ObjectId(req.params.id)});
        if (upDateData && upDateData != null) {

            return res.reply(messages.success(), {
                data: upDateData,
                message: 'Category get successfully.'
            });
        }else{

            return res.reply(messages.success(), {
                data: {},
                message: 'Category Not found.'
            });
        }

    } catch (err) {
        log.error(err)
        return res.reply(messages.server_error());
    }
}

controllers.nextCategoryData = async (req, res, next) => {
    try {

        let createData = await nextCategory.create(req.body);
        if (createData && createData != null) {

            return res.reply(messages.success(), {
                data: createData,
                message: 'next Category created successfully.'
            });
        }

    } catch (err) {
        log.error(err)
        return res.reply(messages.server_error());
    }
}

controllers.getNextCategoryDate = async (req, res, next) => {
    try {
       let upDateData =  await nextCategory.find().sort({ _id: -1 });
       console.log("next category date is---->",upDateData);
        if (upDateData && upDateData != null) {

            return res.reply(messages.success(), {
                data: upDateData,
                message: 'Category get successfully.'
            });
        }else{

            return res.reply(messages.success(), {
                data: {},
                message: 'Category Not found.'
            });
        }

    } catch (err) {
        log.error(err)
    }}
controllers.deleteCategory = async (req, res, next) => {
    try {
        if (!req.body.sObjectId) return res.reply(messages.not_found("Category ID"));
        if (!validators.isValidObjectID(req.body.sObjectId)) res.reply(messages.invalid("Category ID"));

        Category.findOneAndDelete(({ _id:req.body.sObjectId }), function (err, deleted) {
            if (err){
                log.red(err);
                return res.reply(messages.server_error());
            }
            else{
                return res.reply(messages.updated('Category Deleted'));
            }
         });
    } catch (error) {
        return res.reply(messages.server_error());
    }
}

module.exports = controllers;