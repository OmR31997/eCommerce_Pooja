import express from 'express';
import { authentication, authorization } from '../middlewares/auth.middleware.js';
import { cancel_order, checkout, update_order_status, view_order_by_id, view_user_orders } from '../controllers/order.controller.js';

const router = express.Router();

/* @description -> User confirms order and pays after delivery
   @end-Point -> /api/order/checkout
   @methtod -> GET
   @access -> Private (user) 
*/
router.post('/checkout', authentication, authorization.CUSTOMER, checkout);

/* @description -> To view ordered items
   @end-Point -> /api/order/view
   @methtod -> GET
   @access -> Private (user) 
*/
router.get('/view', authentication, authorization.CUSTOMER, view_user_orders);

/* @description -> To view ordered item by orderId
   @end-Point -> /api/order/view/:id
   @methtod -> GET
   @access -> Private (user) 
*/
router.get('/view/:id', authentication, authorization.CUSTOMER, view_order_by_id);

/* @description -> To cancel the order
   @end-Point -> /api/order/:id/cancel
   @methtod -> PATCH
   @access -> Private (user) 
*/
router.patch('/:id/cancel', authentication, authorization.CUSTOMER, cancel_order);

/* @description -> To update orderStatus by orderId
   @end-Point -> /api/order/:id/status
   @methtod -> PATCH
   @access -> Private (user/vendor) 
*/
router.patch('/:id/status', authentication, authorization.CUSTOMER, update_order_status);

export default router;
