import express from 'express';
import { create_product, view_products, view_single_product } from '../controllers/product.controller.js';
import { authentication, authorization } from '../middlewares/auth.middleware.js';

const router = express.Router();

/* *Description -> To create a new product via vendor
   *End-Point -> /api/product/create
   *Methtod -> POST
*/
router.post('/create', authentication, authorization.VENDOR, create_product);

/* *Description -> To view products
   *End-Point -> /api/product/view
   *Methtod -> POST
*/
router.get('/view', view_products);

/* *Description -> To view single product
   *End-Point -> /api/product/view/:slug
   *Methtod -> POST
*/
router.get('/view/:sku', view_single_product);

export default router;