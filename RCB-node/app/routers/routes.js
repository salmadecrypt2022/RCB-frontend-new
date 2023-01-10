const router = require('express').Router();

const authRoute = require('./auth');
const userRoute = require('./user');
const adminRoute = require('./admin');

router.use('/auth', authRoute);
router.use('/user', userRoute);
router.use('/admin', adminRoute);


module.exports = router;
