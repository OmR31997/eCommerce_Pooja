import express from 'express';
import { account_manager_dashboard, admin_dashboard, order_manager_dashboard, product_manager_dashboard, staff_manager_dashboard, super_admin_dashboard, user_manager_dashboard, vendor_dashboard, vendor_manager_dashboard } from '../controllers/dashboard.controller.js';
import { AuthAccess } from '../middlewares/auth.middleware.js';

const router = express.Router();

/* @description -> To get dashboard of super_admin
   @end-Point -> /api/dashboard/overview
   @methtod -> GET
   @access -> Private (super_admin) 
*/
router.get('/super-admin/overview', AuthAccess('Admin', 'read'), super_admin_dashboard);

/* @description -> To get dashboard of admin
   @end-Point -> /api/dashboard/super-admin/overview
   @methtod -> GET
   @access -> Private (admin) 
*/
router.get('/admin/overview', AuthAccess('Admin', 'read'), admin_dashboard);

/* @description -> To get dashboard of vendor
   @end-Point -> /api/dashboard/vedor/overview
   @methtod -> GET
   @access -> Private (vendor)
*/
router.get('/vendor/overview', AuthAccess('Vendor', 'read'), admin_dashboard);

/* @description -> To get dashboard of staff_manager
   @end-Point -> /api/dashboard/staff-manager
   @methtod -> GET
   @access -> Private (staff-manager) 
*/
router.get('/staff-manager', AuthAccess('Staff', 'read'), staff_manager_dashboard);

/* @description -> To get dashboard of vendor-manager
   @end-Point -> /api/dashboard/vendor-manager
   @methtod -> GET
   @access -> Private (vendor-manager) 
*/
router.get('/vendor-manager', AuthAccess('Vendor', 'read', { staffOnlyAllow: true }), vendor_manager_dashboard);

/* @description -> To get dashboard of user_manager
   @end-Point -> /api/dashboard/user-manager
   @methtod -> GET
   @access -> Private (user-manager) 
*/
router.get('/user-manager', AuthAccess('User', 'read'), user_manager_dashboard);

/* @description -> To get dashboard of product-manager
   @end-Point -> /api/dashboard/product-manager
   @methtod -> GET
   @access -> Private (product-manager) 
*/
router.get('/product-manager', AuthAccess('Product', 'read'), product_manager_dashboard);

/* @description -> To get dashboard of order-manager
   @end-Point -> /api/dashboard/order-manager
   @methtod -> GET
   @access -> Private (order-manager) 
*/
router.get('/order-manager', AuthAccess('Order', 'read'), order_manager_dashboard);

/* @description -> To get dashboard of account_manager
   @end-Point -> /api/dashboard/account-manager
   @methtod -> GET
   @access -> Private (account-manager) 
*/
router.get('/account-manager', AuthAccess('Account', 'read'), account_manager_dashboard);


export default router