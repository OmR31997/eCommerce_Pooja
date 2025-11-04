import express from 'express';
import { create_product, view_products, view_single_product, } from '../controllers/product.controller.js';
import { authentication, authorization } from '../middlewares/auth.middleware.js';

const router = express.Router();

/* @description -> To create a new product via vendor
   @end-Point -> /api/product/create
   @methtod -> POST
   @access -> Private (vendor/admin) 
*/
router.post('/create', authentication, authorization.VENDOR, create_product);

/* @description -> To view products
   @end-Point -> /api/product/view
   @methtod -> POST
*/
router.get('/view', view_products);

/* @description -> To view single product by id/sku
   @end-Point -> /api/product/view/:id
   @methtod -> POST
*/
router.get('/view/:id', view_single_product);

export default router;