import express from 'express';
import { AuthAccess } from '../middlewares/auth.middleware.js';
import { cancel_order, checkout_before_payment, download_reciept, exchange_order, get_order_by_orderId, get_orders, return_order }  from '../src/order/order.controller.js';
const router = express.Router();

/* @description -> User confirms order and pays after delivery (alretanate to CreateOrder)
   @end-Point -> /api/order/checkout
   @methtod -> POST
   @access -> Private (user/admin/super_admin/order_manager) 
*/
router.post('/checkout/cod',  AuthAccess('Order', 'create'), checkout_before_payment);

/* @description -> To view ordered items
   @end-Point -> /api/order/view
   @methtod -> GET
   @access -> Private (user/vendor/admin/super_admin/order_manager) 
*/
router.get('/view',  AuthAccess('Order', 'read'), get_orders);

/* @description -> To view ordered item by orderId
   @end-Point -> /api/order/view/:id
   @methtod -> GET
   @access -> Private (user/vendor/vendor_manager/admin/super_admin) 
*/
router.get('/view/:orderId',  AuthAccess('Order', 'read'), get_order_by_orderId);

/* @description -> To update orderStatus by orderId
   @end-Point -> /api/order/:id/status
   @methtod -> PATCH
   @access -> Private (user/order_manager/admin/super_admin) 
*/
// router.patch('/:id/status', AuthAccess('Order', 'update'), update_order);

/* @description -> To cancel the order
   @end-Point -> /api/order/:id/cancel
   @methtod -> DELETE
   @access -> Private (user/order/order_manager/admin/super_admin) 
*/
router.patch('/:orderId/cancel', AuthAccess('Order', 'update'), cancel_order);

/* @description -> To return the order
   @end-Point -> /api/order/:pId/:orderId/return
   @methtod -> PATCH
   @access -> Private (user/order_manager/admin/super_admin) 
*/
router.patch('/:orderId/return', AuthAccess('Order', 'update'), return_order);

/* @description -> To exchange the order
   @end-Point -> /api/order/:pId/:orderId/exhange
   @methtod -> PATCH
   @access -> Private (user//order_manager/admin/super_admin) 
*/
router.patch('/:pId/:orderId/exhange', AuthAccess('Order', 'update'), exchange_order);

router.get('/:orderId/receipt/download', AuthAccess('Order', 'read'), download_reciept);

export default router;
