import express from 'express';
import { AuthAccess } from '../middlewares/auth.middleware.js';
import { cancel_order, checkout_before_payment, delete_order, download_reciept, get_order_by_id, get_orders, update_order }  from '../src/order/order.controller.js';
const router = express.Router();

// CREATE-------------------------------|
/* @description -> User confirms order and pays after delivery (alretanate to CreateOrder)
   @end-Point -> /api/order/checkout
   @methtod -> POST
   @access -> Private (user/admin/super_admin) 
*/
router.post('/checkout/cod',  AuthAccess('Order', 'create'), checkout_before_payment);

// READ---------------------------------|
/* @description -> To view ordered items
   @end-Point -> /api/order/view
   @methtod -> GET
   @access -> Private (user/vendor/admin/super_admin/order_manager) 
*/
router.get('/view',  AuthAccess('Order', 'read'), get_orders);

/* @description -> To view ordered item by orderId
   @end-Point -> /api/order/:orderId
   @methtod -> GET
   @access -> Private (user/vendor/vendor_manager/admin/super_admin) 
*/
router.get('/:orderId',  AuthAccess('Order', 'read'), get_order_by_id);

/* @description -> To download receipt
   @end-Point -> /api/order/:orderId/receipt/download
   @methtod -> GET
   @access -> Private (user/vendor/vendor_manager/admin/super_admin) 
*/
router.get('/:orderId/receipt/download', AuthAccess('Order', 'read'), download_reciept);


// UPDATE-------------------------------|
/* @description -> To update  by orderId
   @end-Point -> /api/order/:orderId/update
   @methtod -> PATCH
   @access -> Private (user/order_manager/admin/super_admin) 
*/
router.patch('/:orderId/update', AuthAccess('Order', 'update'), update_order);

/* @description -> To cancel the order
   @end-Point -> /api/order/:orderId/cancel
   @methtod -> DELETE
   @access -> Private (user/order/order_manager/admin/super_admin) 
*/
router.patch('/:orderId/cancel', AuthAccess('Order', 'update'), cancel_order);

// DELETE-------------------------------|
/* @description -> To delete order
   @end-Point -> /api/order/:orderId/delete
   @methtod -> DELETE
   @access -> Private (order_manager/admin/super_admin) 
*/
router.patch('/:orderId/delete', AuthAccess('Order', 'delete'), delete_order);

/* @description -> To clear orders
   @end-Point -> /api/order/clear
   @methtod -> DELETE
   @access -> Private (admin/super_admin) 
*/
router.patch('/clear', AuthAccess('Order', 'delete'), delete_order);


// /* @description -> To return the order
//    @end-Point -> /api/order/:pId/:orderId/return
//    @methtod -> PATCH
//    @access -> Private (user/order_manager/admin/super_admin) 
// */
// router.patch('/:orderId/return', AuthAccess('Order', 'update'), return_order);

/* @description -> To exchange the order
   @end-Point -> /api/order/:pId/:orderId/exhange
   @methtod -> PATCH          ||NEED SOME MODIFICATIONS||
   @access -> Private (user//order_manager/admin/super_admin) 
*/
// router.patch('/:pId/:orderId/exhange', AuthAccess('Order', 'update'), exchange_order);

export default router;
