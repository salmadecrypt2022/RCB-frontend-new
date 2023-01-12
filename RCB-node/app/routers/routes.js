const router = require('express').Router();

const authRoute = require('./auth');
const userRoute = require('./user');
const adminRoute = require('./admin');
const transactionRoute = require('./transaction');



router.use('/auth', authRoute);
router.use('/user', userRoute);
router.use('/admin', adminRoute);
router.use('/transaction', transactionRoute);


module.exports = router;
