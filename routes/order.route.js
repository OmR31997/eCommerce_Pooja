import express from 'express';
import { authentication, authorizationAccess,  } from '../middlewares/auth.middleware.js';
import { cancel_order, checkout, update_order_status, view_order_by_id, view_user_orders } from '../controllers/order.controller.js';

const router = express.Router();

/* @description -> User confirms order and pays after delivery (alretanate to CreateOrder)
   @end-Point -> /api/order/checkout
   @methtod -> POST
   @access -> Private (user/admin/super_admin/manage_order) 
*/
router.post('/checkout', checkout);

/* @description -> To view ordered items
   @end-Point -> /api/order/view
   @methtod -> GET
   @access -> Private (user/vendor/admin/super_admin/manage_order) 
*/
router.get('/view', authentication, authorizationAccess('Order', 'isRead'), view_user_orders);

/* @description -> To view ordered item by orderId
   @end-Point -> /api/order/view/:id
   @methtod -> GET
   @access -> Private (user/vendor) 
*/
router.get('/view/:id', authentication, authorizationAccess('Order', 'isRead'), view_order_by_id);

/* @description -> To update orderStatus by orderId
   @end-Point -> /api/order/:id/status
   @methtod -> PATCH
   @access -> Private (user/vendor) 
*/
router.patch('/:id/status', authentication, authorizationAccess('Order', 'isUpdate'), update_order_status);

/* @description -> To cancel the order
   @end-Point -> /api/order/:id/cancel
   @methtod -> PATCH
   @access -> Private (user) 
*/
router.patch('/:id/cancel', authentication, authorizationAccess('Order', 'isUpdate'), cancel_order);

export default router;
