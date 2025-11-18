import express from 'express';
import { authentication, authorizationAccess } from '../middlewares/auth.middleware.js';
import { add_to_cart, clear_cart, delete_to_cart, get_cart_item_byId, remove_cart_item, view_cart } from '../controllers/cart.controller.js';

const router = express.Router();

/* @description -> to add cart 
   @end-Point -> /api/cart
   @methtod -> POST
   @access -> Private (user) 
*/
router.post('/add-to-cart', authentication, authorizationAccess('Cart', 'isCreate'), add_to_cart);

/* @description -> to view carted items 
   @end-Point -> /api/cart/view
   @methtod -> GET
   @access -> Private (user/) 
*/
router.get('/view', authentication, authorizationAccess('Cart', "isRead") ,view_cart);

/* @description -> to view carted items 
   @end-Point -> /api/cart/:id/view-id
   @methtod -> GET
   @access -> Private (/user/admin/super_admin/staff) 
*/
router.get('/:id/view-id', get_cart_item_byId);

/* @description -> to decrement quantity of item from the cart  
   @end-Point -> /:id/delete-to-cart
   @methtod -> DELETE
   @access -> Private (user) 
*/
router.delete('/:id/delete-to-cart', authentication, authorizationAccess('Cart', 'isDelete'), delete_to_cart);

/* @description -> to remove item from the carted items 
   @end-Point -> /api/cart/item/:id
   @methtod -> DELETE
   @access -> Private (user) 
*/
router.delete('/item/:id', authentication, authorizationAccess('Cart', 'isDelete'), remove_cart_item);

/* @description -> to clear cart items 
   @end-Point -> /api/cart/clear
   @methtod -> DELETE
   @access -> Private (user) 
*/
router.delete('/clear', authentication, authorizationAccess('Cart', 'isDelete'), clear_cart);

export default router