import express from 'express';
import { create_product, delete_product, product_filters, public_product, public_products, rating_product, secured_product, secured_products, stock_product, update_product } from '../src/product/product.controller.js';
import { Upload } from '../middlewares/upload.middleware.js';
import { AuthAccess, Authentication } from '../middlewares/auth.middleware.js';

const router = express.Router();
const MAX_PRODUCT_IMAGES = parseInt(process.env.MAX_PRODUCT_IMAGES) || 5;

// READ-----------------|

// PRIVATE
/* @description -> To get secured products
   @end-Point -> /api/product/all-secured
   @methtod -> GET
   @access -> (admin, super_admin, product_manager(staff), user) 
*/
router.get('/all-secured', Authentication, AuthAccess('Product', 'read'), secured_products);

/* @description -> To get single product byProductId 
   @end-Point -> /api/product/via-product-pId/:pId
   @methtod -> GET
   @access -> (admin, super_admin, product_manager(staff)) 
*/
router.get('/secured-via-pId/:pId', Authentication, AuthAccess('Product', 'read'), secured_product);

/* @description -> To get single product bySku
   @end-Point -> /api/product/via-product-sku/:sku
   @methtod -> GET
   @access -> (admin, super_admin, product_manager(staff)) 
*/
router.get('/secured-via-sku/:sku', Authentication, AuthAccess('Product', 'read'), secured_product);

// PUBLIC
/* @description -> To view products
   @end-Point -> /api/product/view
   @methtod -> GET
*/
router.get('/all-public', public_products);

/* @description -> To view products
   @end-Point -> /api/product/:pId/public-via-pId
   @methtod -> GET
*/
router.get('/:pId/public-via-pId', public_product);

/* @description -> To view products
   @end-Point -> /api/product/:sku/secured-via-sku
   @methtod -> GET
*/
router.get('/:sku/secured-via-sku', public_product);

/* @description -> To give rating to the product
   @end-Point -> /api/product/filter?
   @methtod -> GET
   @access -> Public 
*/
router.get('/filter', Authentication, AuthAccess('Product', 'read'), product_filters);

// CREATE----------------|
/* @description -> To create a new product via vendor
   @end-Point -> /api/product/create
   @methtod -> POST
   @access -> Private (vendor) 
*/
router.post('/create', Authentication, AuthAccess('Product', 'create'),
   Upload('PROD-').array('images', MAX_PRODUCT_IMAGES),
   create_product);

// UPDATE----------------|
/* @description -> To update product by productId
   @end-Point -> /api/product/:id/update
   @methtod -> PATCH
   @access -> Private (vendor/vendor_manager/admin/super_admin) 
*/
router.patch('/:pId/update', Authentication, AuthAccess('Product', 'update'), update_product);

/* @description -> To give rating to the product
   @end-Point -> /api/product/:id/rating
   @methtod -> PATCH
   @access -> Private (user) 
*/
router.patch('/:pId/rating', Authentication, AuthAccess('Product', 'update'), rating_product);

/* @description -> To give rating to the product
   @end-Point -> /api/product/:id/stock
   @methtod -> PATCH
   @access -> Private (user) 
*/
router.patch('/:pId/stock', Authentication, AuthAccess('Product', 'update'), stock_product);

// DELETE----------------|
/* @description -> To delete product by productId
   @end-Point -> /api/product/:id/delet
   @methtod -> DELETE
   @access -> Private (vendor/vendor_manager/admin/super_admin) 
*/
router.delete('/:pId/delete', Authentication, AuthAccess('Product', 'delete'), delete_product);


export default router;