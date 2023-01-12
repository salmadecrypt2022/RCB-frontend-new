const router = require('express').Router();
const transactionController = require('./lib/controllers');
const transactionMiddleware = require('./lib/middleware');


router.post("/create", transactionController.create);
router.post('/listByUser', transactionController.listByUser);


module.exports = router;