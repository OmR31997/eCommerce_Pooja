import express from 'express';
import { AuthAccess } from '../middlewares/auth.middleware.js';

import { add_to_cart, checkout_shipping, delete_cart, delete_item_from_cart, get_cart_by_cartId, get_cart_by_productId, get_carts } from '../src/cart/cart.controller.js';
const router = express.Router();

/* @description -> to add cart 
   @end-Point -> /api/cart
   @methtod -> POST
   @access -> Private (user) 
*/
// router.post('/add-to-cart', AuthAccess('Cart', 'create'), add_to_cart);

/* @description -> to view carted items 
   @end-Point -> /api/cart/view
   @methtod -> GET
   @access -> Private (user/) 
*/
// router.get('/view', AuthAccess('Cart', 'read'), view_cart);

/* @description -> to view carted items 
   @end-Point -> /api/cart/:id/view-id
   @methtod -> GET
   @access -> Private (/user/admin/super_admin/staff) 
*/
// router.get('/:id/view-id', AuthAccess('Cart', 'read'), get_cart_item_byId);

/* @description -> to decrement quantity of item from the cart  
   @end-Point -> /:id/delete-to-cart
   @methtod -> DELETE
   @access -> Private (user) 
*/
// router.delete('/:id/delete-to-cart', AuthAccess('Cart', 'delete'), delete_to_cart);

/* @description -> to remove item from the carted items 
   @end-Point -> /api/cart/item/:id
   @methtod -> DELETE
   @access -> Private (user) 
*/
// router.delete('/item/:id', AuthAccess('Cart', 'delete'), remove_cart_item);

/* @description -> to clear cart items 
   @end-Point -> /api/cart/clear
   @methtod -> DELETE
   @access -> Private (user) 
*/
// router.delete('/clear', AuthAccess('Cart', 'delete'), clear_cart);

// NEW STRUCTURE  
/* @description -> to add cart 
   @end-Point -> /api/cart/add-to-cart
   @methtod -> POST
   @access -> Private (user) 
*/
router.post('/add-to-cart', AuthAccess('Cart', 'create'), add_to_cart);

/* @description -> update cart for shipping 
   @end-Point -> /api/cart/shipping
   @methtod -> PATCH
   @access -> Private (user/admin/super_admin) 
*/
router.patch('/shipping', AuthAccess('Cart', 'update'), checkout_shipping);

/* @description -> to view carted items 
   @end-Point -> /api/cart/view
   @methtod -> GET
   @access -> Private (user/) 
*/
router.get('/view', AuthAccess('Cart', 'read'), get_carts);

/* @description -> to view carted items 
   @end-Point -> /api/cart/:cartId/view-id
   @methtod -> GET
   @access -> Private (/user/admin/super_admin/staff) 
*/
router.get('/:cartId/view-id', AuthAccess('Cart', 'read'), get_cart_by_cartId);

/* @description -> to view carted items 
   @end-Point -> /api/cart/:cartId/:productId/view-ids
   @methtod -> GET
   @access -> Private (/user/admin/super_admin/staff) 
*/
router.get('/:cartId/:pId/view-id', AuthAccess('Cart', 'read'), get_cart_by_productId);

/* @description -> to decrement quantity of item from the cart  
   @end-Point -> /:cartId/:productId/delete-to-cart
   @methtod -> DELETE
   @access -> Private (user) 
*/
router.delete('/:cartId/:pId/delete-item-cart', AuthAccess('Cart', 'delete'), delete_item_from_cart);

/* @description -> to remove item from the carted items 
   @end-Point -> /api/cart/:cartId/delete
   @methtod -> DELETE
   @access -> Private (user) 
*/
router.delete('/:cartId/delete', AuthAccess('Cart', 'delete'), delete_cart);

export default router