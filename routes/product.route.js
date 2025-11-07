import express from 'express';
import { create_product, manage_product_byVendor, rate_product, view_products, view_single_product, view_vendor_product, view_vendor_products, } from '../controllers/product.controller.js';
import { authentication, authorizationRoles } from '../middlewares/auth.middleware.js';
import { Upload } from '../middlewares/upload.middleware.js';
const router = express.Router();

/* @description -> To create a new product via vendor
   @end-Point -> /api/product/create
   @methtod -> POST
   @access -> Private (vendor) 
*/
router.post('/create', authentication, authorizationRoles(['vendor']), Upload('PRODUCT-').array('images', process.env.MAX_PRODUCT_IMAGES || 5), create_product);

/* @description -> To view products
   @end-Point -> /api/product/view
   @methtod -> POST
*/
router.get('/view', view_products);

/* @description -> To view products which is already created by own 
   @end-Point -> /api/product/vendor-view
   @methtod -> GET
   @access -> Private (vendor) 
*/
router.get('/vendor-view', authentication, authorizationRoles(['vendor']), view_vendor_products);

/* @description -> To view single product by _id/sku
   @end-Point -> /api/product/view/:id
   @methtod -> POST
*/
router.get('/view/:id', view_single_product);

/* @description -> To view product by productId which already created by own
   @end-Point -> /api/product/:id/vendor-view
   @methtod -> GET
   @access -> Private (vendor) 
*/
router.get('/:id/vendor-view', authentication, authorizationRoles(['vendor']), view_vendor_product);

/* @description -> To update product by productId
   @end-Point -> /api/product/:id
   @methtod -> PATCH
   @access -> Private (vendor) 
*/
router.patch('/:id', authentication, authorizationRoles(['vendor']), manage_product_byVendor);

/* @description -> To give rating to the product
   @end-Point -> /api/product/:id/rate
   @methtod -> PATCH
   @access -> Private (user) 
*/
router.patch('/:id/rate', authentication, authorizationRoles(['user']), rate_product);

export default router;