import express from 'express';
import { authentication, authorization } from '../middlewares/auth.middleware.js';
import { add_to_cart, clear_cart, remove_cart_item, view_cart } from '../controllers/cart.controller.js';

const router = express.Router();

/* *Description -> to add cart 
   *End-Point -> /api/cart
   *Methtod -> POST
*/
router.post('/add-to-cart', authentication, authorization.CUSTOMER, add_to_cart);

/* *Description -> to view carted items 
   *End-Point -> /api/cart
   *Methtod -> GET
*/
router.get('/view', authentication, authorization.CUSTOMER, view_cart);

/* *Description -> to remove item from the carted items 
   *End-Point -> /api/cart/item/:id
   *Methtod -> DELETE
*/
router.delete('/item/:sku', authentication, authorization.CUSTOMER, remove_cart_item);

/* *Description -> to clear cart items 
   *End-Point -> /api/cart/clear
   *Methtod -> DELETE
*/
router.delete('/clear', authentication, authorization.CUSTOMER, clear_cart);

export default router