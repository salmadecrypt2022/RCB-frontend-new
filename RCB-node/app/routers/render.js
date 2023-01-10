const router = require('express').Router();

const adminRenderRoute = require('./admin_render');

router.use('/a', adminRenderRoute);

module.exports = router;
