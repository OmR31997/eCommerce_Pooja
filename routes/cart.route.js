import express from 'express';
import { AuthAccess } from "../middlewares/auth.middleware.js";
import { add_to_cart, buy_now, checkout_shipping, delete_cart, delete_item_from_cart, get_cart_by_id, get_carts } from '../src/cart/cart.controller.js';
const router = express.Router();

// CREATE | UPDATE---------------------------------|

/* @description -> to add cart 
   @end-Point -> /api/cart/add-to-cart
   @methtod -> POST
   @access -> Private (user) 
*/
router.post('/buy-now', AuthAccess('Cart', 'create'), buy_now);

/* @description -> update cart for shipping 
//    @end-Point -> /api/cart/shipping
//    @methtod -> PATCH
//    @access -> Private (user/admin/super_admin) 
// */
router.patch('/shipping', AuthAccess('Cart', 'update'), checkout_shipping);

/* @description -> to add cart 
   @end-Point -> /api/cart/add-to-cart
   @methtod -> POST
   @access -> Private (user) 
*/
router.post('/add-to-cart', AuthAccess('Cart', 'create'), add_to_cart);

// READ-----------------------------------|
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
router.get('/:cartId/view-id', AuthAccess('Cart', 'read'), get_cart_by_id);

// DELETE---------------------------------|
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