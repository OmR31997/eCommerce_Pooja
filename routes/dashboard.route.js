import express from 'express';
import { account_manager_dashboard, admin_dashboard, order_manager_dashboard, product_manager_dashboard, staff_manager_dashboard, super_admin_dashboard, user_manager_dashboard, vendor_dashboard, vendor_manager_dashboard } from '../controllers/dashboard.controller.js';
import { authentication, authorizationRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/super-admin-overview', super_admin_dashboard);

router.get('/admin-overview', admin_dashboard);

router.get('/staff-manager', authentication,  staff_manager_dashboard);
router.get('/user-manager', authentication,  user_manager_dashboard);
router.get('/vendor-manager', authentication,  vendor_manager_dashboard);
router.get('/product-manager', authentication,  product_manager_dashboard);
router.get('/order-manager', authentication,  order_manager_dashboard);
router.get('/account-manager', authentication,  account_manager_dashboard);

router.get('/vendor-overview', authentication, vendor_dashboard);

export default router