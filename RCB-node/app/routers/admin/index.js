const router = require('express').Router();
const adminController = require('./lib/controllers');
const adminMiddleware = require('./lib/middleware');


// Profile API
router.put('/updateProfile', adminMiddleware.verifyToken, adminController.updateProfile);

// NFT APIs

// User APIs
router.post('/users', adminMiddleware.verifyToken, adminController.users);
router.post('/categories', adminMiddleware.verifyToken, adminController.categoriesList);
router.post('/createCategory', adminMiddleware.verifyToken, adminController.createCategory);

router.post('/toggleUserStatus', adminMiddleware.verifyToken, adminController.toggleUserStatus);


module.exports = router;