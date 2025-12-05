import express from 'express';
import { AuthAccess } from '../middlewares/auth.middleware.js';
import { clear_users, get_me, get_order_byId, get_orders_ByUser, get_user_byId, get_users, remove_user_profile, update_user_profile, users_filters, } from '../src/customer/user.controller.js';

const router = express.Router();

/* @description -> To get profile
   @end-Point -> /api/user/me
   @methtod -> GET
   @access -> Private (user) 
*/
router.get('/me', AuthAccess('User', 'read'), get_me);

/* @description -> To read all users records
   @end-Point -> /api/user/view
   @methtod -> GET
   @access -> Private (user_manager/admin/super_admin) 
*/
router.get('/view', AuthAccess('User', 'read'), get_users);

/* @description -> To get user record byId
   @end-Point -> /api/user/view/:id
   @methtod -> GET
   @access -> Private (user_manager/admin/super_admin) 
*/
router.get('/view/:id', AuthAccess('User', 'read'), get_user_byId);

/* @description -> To filteration
   @end-Point -> /api/user/filter
   @methtod -> GET 
   @access -> Private (admin/super_admin/user_manager) 
*/
router.get('/filter', AuthAccess('User', 'read'), users_filters);

/* @description -> To update own profile like: name, email, & phone etc. 
   @end-Point -> /api/user/:id/update
   @methtod -> PATCH
   @access -> Private (user/admin/super_admin/user_manager) 
*/
router.patch('/:id/update', AuthAccess('User', 'update'), update_user_profile);

/* @description -> To delete user record byId
   @end-Point -> /api/user/:id/delete
   @methtod -> DELETE
   @access -> Private (/admin/super_admin/user_manager) 
*/
router.delete('/:id/delete', AuthAccess('User', 'delete'), remove_user_profile);

/* @description -> To clear users
   @end-Point -> /api/vendor/clear
   @methtod -> DELETE
   @access -> Private (admin/super_admin/user_manager) 
*/
router.delete('/clear', AuthAccess('User', 'delete'), clear_users);

// ----------------------------------------------------------------------
// ORDER
/* @description -> To view product by productId which already created by own
   @end-Point -> /api/orders
   @methtod -> GET
   @access -> Private (vendor/vendor_manager/admin/super_admin) 
*/
router.get('/orders', AuthAccess('User', 'read'), get_orders_ByUser);

/* @description -> To view single product by orderId
   @end-Point -> /api/user/order/:orderId
   @methtod -> GET
   @access -> Private (user/user_manager/admin/super_admin) 
*/
router.get('/order/:orderId/', AuthAccess('User', 'read'), get_order_byId);

export default router;