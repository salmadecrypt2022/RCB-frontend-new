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
      const page = parseInt(req.body.page);
      const limit = parseInt(req.body.limit);
      const startIndex = (page - 1) * limit;
      let searchArray = [];
      searchArray['sWalletAddress'] = { $regex: new RegExp(req.body.sWalletAddress), $options: "i" };
      let searchObj = Object.assign({}, searchArray);
      let searchArrayCount = [];
      searchArrayCount['sWalletAddress'] = { $regex: new RegExp(req.body.sWalletAddress), $options: "i" };
      let searchObjCount = Object.assign({}, searchArrayCount);

      

      await Transaction.aggregate([
        {
            $lookup: {
                from: "categories",
                localField: "category_id",
                foreignField: "category_id",
                as: "CategoryData",
            },
        },
        { $match: searchObj },
        { $sort: { sCreated: -1 } },
        { $skip: startIndex },
        { $limit: limit },
    ]).exec(async function (e, recordsData) {
        console.log("Error ", e);
        let results = {};
        let count = await Transaction.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "category_id",
                    foreignField: "category_id",
                    as: "CategoryData",
                },
            },
            { $match: searchObjCount },
            {
                $count: "allRecords"
            }
        ]);
        results.count = count[0]?.allRecords;
        results.results = recordsData;
        console.log("Data Returned");
        return res.reply(messages.success("Transaction list successfully"), results);
      });
    } catch (error) {
      console.log("Error " + error);
      return res.reply(messages.server_error());
    }
  }
  controllers.listByUser = async (req, res, next) => {
    try {
        const page = parseInt(req.body.page);
        const limit = parseInt(req.body.limit);
        const startIndex = (page - 1) * limit;
        let searchArray = [];
        searchArray['sWalletAddress'] = { $regex: new RegExp(req.body.sWalletAddress), $options: "i" };
        let searchObj = Object.assign({}, searchArray);
        let searchArrayCount = [];
        searchArrayCount['sWalletAddress'] = { $regex: new RegExp(req.body.sWalletAddress), $options: "i" };
        let searchObjCount = Object.assign({}, searchArrayCount);
        await Transaction.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "category_id",
                    foreignField: "category_id",
                    as: "CategoryData",
                },
            },
            { $match: searchObj },
            { $sort: { sCreated: -1 } },
            { $skip: startIndex },
            { $limit: limit },
        ]).exec(async function (e, recordsData) {
            console.log("Error ", e);
            let count = await Transaction.aggregate([
                {
                    $lookup: {
                        from: "categories",
                        localField: "category_id",
                        foreignField: "category_id",
                        as: "CategoryData",
                    },
                },
                { $match: searchObjCount },
                {
                    $count: "allRecords"
                }
            ]);
            console.log("Data Returned");
            return res.reply(messages.success(), { 
                count: count[0]?.allRecords, 
                data: recordsData, 
                message: 'Transaction list successfully'
            });
        });
    } catch (error) {
        console.log("Error " + error);
        return res.reply(messages.server_error());
    }
}

module.exports = controllers;