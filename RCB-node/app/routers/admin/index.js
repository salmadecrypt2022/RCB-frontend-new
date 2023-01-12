const router = require('express').Router();
const adminController = require('./lib/controllers');
const adminMiddleware = require('./lib/middleware');


// Profile API
router.put('/updateProfile', adminMiddleware.verifyToken, adminController.updateProfile);

// NFT APIs

// User APIs
router.post('/users', adminMiddleware.verifyToken, adminController.users);
router.post('/categories', adminMiddleware.verifyToken, adminController.categoriesList);
router.post('/reserves', adminMiddleware.verifyToken, adminController.reserves);
router.post('/reserveToken', adminMiddleware.verifyToken, adminController.reserveToken);

router.post('/createCategory', adminMiddleware.verifyToken, adminController.createCategory);
router.get('/getCategory/:id', adminMiddleware.verifyToken, adminController.getCategoryById);

router.post('/updateCategory', adminMiddleware.verifyToken, adminController.updateCategory);

router.post('/usersInCategory', adminMiddleware.verifyToken, adminController.usersInCategory);
router.post('/allowUser', adminMiddleware.verifyToken, adminController.allowUser);

router.get('/getDashboardData', adminMiddleware.verifyToken, adminController.getDashboardData);

router.post('/toggleUserStatus', adminMiddleware.verifyToken, adminController.toggleUserStatus);
router.post('/toggleCategoryStatus', adminMiddleware.verifyToken, adminController.toggleCategoryStatus);


module.exports = router;