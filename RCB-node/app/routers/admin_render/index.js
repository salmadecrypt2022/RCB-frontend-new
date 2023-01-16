const router = require('express').Router();
const adminRenderController = require('./lib/controller');
const adminRenderMiddleware = require('./lib/middleware');

router.get('/signin', adminRenderMiddleware.checkAuth, adminRenderController.signin);
router.get('/forgotPassword', adminRenderMiddleware.checkAuth, adminRenderController.forgotPassword);
router.get('/dashboard', adminRenderMiddleware.checkAuthAdmin, adminRenderController.dashboard);
router.get('/profile', adminRenderMiddleware.checkAuthAdmin, adminRenderController.profile);
router.get('/users', adminRenderMiddleware.checkAuthAdmin, adminRenderController.users);
router.get('/categories', adminRenderMiddleware.checkAuthAdmin, adminRenderController.categories);
router.get('/nextcategories', adminRenderMiddleware.checkAuthAdmin, adminRenderController.nextCategories);
router.get('/reserves', adminRenderMiddleware.checkAuthAdmin, adminRenderController.reserves);

module.exports = router;