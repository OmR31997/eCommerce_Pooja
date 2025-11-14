import express from 'express';
import { authentication, authorizationRoles } from '../middlewares/auth.middleware.js';
import { add_to_cart, clear_cart, remove_cart_item, view_cart } from '../controllers/cart.controller.js';

const router = express.Router();

/* @description -> to add cart 
   @end-Point -> /api/cart
   @methtod -> POST
   @access -> Private (user) 
*/
router.post('/add-to-cart', authentication, authorizationRoles(['user']), add_to_cart);

/* @description -> to view carted items 
   @end-Point -> /api/cart
   @methtod -> GET
   @access -> Private (user/) 
*/
router.get('/view', authentication, authorizationRoles(['user']), view_cart);

/* @description -> to remove item from the carted items 
   @end-Point -> /api/cart/item/:id
   @methtod -> DELETE
   @access -> Private (user) 
*/
router.delete('/item/:id', authentication, authorizationRoles(['user']), remove_cart_item);

/* @description -> to clear cart items 
   @end-Point -> /api/cart/clear
   @methtod -> DELETE
   @access -> Private (user) 
*/
router.delete('/clear', authentication, authorizationRoles(['user']), clear_cart);

export default router