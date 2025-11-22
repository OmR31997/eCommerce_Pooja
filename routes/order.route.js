import express from 'express';
import { cancel_order, checkout, update_order_status, view_order_by_id, view_user_orders } from '../controllers/order.controller.js';
import { AuthAccess } from '../middlewares/auth.middleware.js';

const router = express.Router();

/* @description -> User confirms order and pays after delivery (alretanate to CreateOrder)
   @end-Point -> /api/order/checkout
   @methtod -> POST
   @access -> Private (user/admin/super_admin/order_manager) 
*/
router.post('/checkout',  AuthAccess('Order', 'create'), checkout);

/* @description -> To view ordered items
   @end-Point -> /api/order/view
   @methtod -> GET
   @access -> Private (user/vendor/admin/super_admin/order_manager) 
*/
router.get('/view',  AuthAccess('Order', 'read'), view_user_orders);

/* @description -> To view ordered item by orderId
   @end-Point -> /api/order/view/:id
   @methtod -> GET
   @access -> Private (user/vendor/vendor_manager/admin/super_admin) 
*/
router.get('/view/:id',  AuthAccess('Order', 'read'), view_order_by_id);

/* @description -> To update orderStatus by orderId
   @end-Point -> /api/order/:id/status
   @methtod -> PATCH
   @access -> Private (user/order_manager/admin/super_admin) 
*/
router.patch('/:id/status', AuthAccess('Order', 'update'), update_order_status);

/* @description -> To cancel the order
   @end-Point -> /api/order/:id/cancel
   @methtod -> PATCH
   @access -> Private (user/order/order_manager/admin/super_admin) 
*/
router.patch('/:id/cancel', AuthAccess('Permission', 'delete'), cancel_order);

export default router;
