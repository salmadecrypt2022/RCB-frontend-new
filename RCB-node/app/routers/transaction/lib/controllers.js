const {
    Transaction
} = require('../../../models');
const controllers = {};


controllers.create = async (req, res, next) => {
    try {

        let createData = await Transaction.create(req.body);
        if (createData && createData != null) {

            return res.reply(messages.success(), {
                data: createData,
                message: 'Transaction created successfully.'
            });
        }


    } catch (err) {
        log.error(err)
        return res.reply(messages.server_error());
    }
}




controllers.listByUser = async (req, res, next) => {
    try {

        // Per page limit
        var nLimit = parseInt(req.body.length);
        // From where to start
        var nOffset = parseInt(req.body.start);

        let query = [
            {
                "$sort": { sCreated: -1 }
            },
            {
                "$match": {
                    sWalletAddress: { $regex: new RegExp(req.body.sWalletAddress), $options: "i" },
                }
            },
            {
                "$limit": nOffset + nLimit
            },
            {
                "$skip": nOffset
            }
        ];
        console.log('-------------------query', query)

        let aUserTrans = await Transaction.aggregate(query);

        let nNumberOfRecordsInSearch = await Transaction.aggregate([{
            "$match": {
                sWalletAddress: { $regex: new RegExp(req.body.sWalletAddress), $options: "i" },
            }
        }]);

        return res.reply(messages.success(), {
            data: aUserTrans,
            "recordsTotal": nNumberOfRecordsInSearch.length,
            message: 'Transaction list successfully.'
        });

        // let createData = await Transaction.find({});
        // if (createData && createData != null) {

        //     return res.reply(messages.success(), {
        //         data: createData,
        //         message: 'Transaction list successfully.'
        //     });
        // }
    } catch (err) {
        log.error(err)
        return res.reply(messages.server_error());
    }
}



module.exports = controllers;