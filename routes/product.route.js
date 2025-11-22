import express from 'express';
import { create_product, product_filters, rate_product, update_product, view_product_byId, view_products, view_vendor_product, view_vendor_products, } from '../controllers/product.controller.js';
import { Upload } from '../middlewares/upload.middleware.js';
import { AuthAccess, Authentication } from '../middlewares/auth.middleware.js';

const router = express.Router();
const MAX_PRODUCT_IMAGES = parseInt(process.env.MAX_PRODUCT_IMAGES) || 5;

/* @description -> To create a new product via vendor
   @end-Point -> /api/product/create
   @methtod -> POST
   @access -> Private (vendor) 
*/
router.post('/create', AuthAccess('Product', 'create'),
   Upload('PRODUCT-').array('images', MAX_PRODUCT_IMAGES),
   create_product);

/* @description -> To view products
   @end-Point -> /api/product/view
   @methtod -> GET
   @access -> Private (vendor/admin/super_admin/vendor_manager) 
*/
router.get('/view', view_products);

/* @description -> To view products which is already created by own 
   @end-Point -> /api/product/vendor-view
   @methtod -> GET
   @access -> Private (vendor/vendor_manager/admin/super_admin) 
*/
router.get('/secure-view', Authentication, AuthAccess('Product', 'read'), view_vendor_products);

/* @description -> To view single product by _id/sku
   @end-Point -> /api/product/view/:id
   @methtod -> GET
*/
router.get('/view/:id', Authentication, AuthAccess('Product', 'read'), view_product_byId);

/* @description -> To view product by productId which already created by own
   @end-Point -> /api/product/:id/vendor-view
   @methtod -> GET
   @access -> Private (vendor/vendor_manager/admin/super_admin) 
*/
router.get('/:id/vendor-view', Authentication, AuthAccess('Product', 'read'), view_vendor_product);

/* @description -> To update product by productId
   @end-Point -> /api/product/:id/update
   @methtod -> PATCH
   @access -> Private (vendor/vendor_manager/admin/super_admin) 
*/
router.patch('/:id/update', Authentication, AuthAccess('Product', 'update'), update_product);

/* @description -> To delete product by productId
   @end-Point -> /api/product/:id/delet
   @methtod -> DELETE
   @access -> Private (vendor/vendor_manager/admin/super_admin) 
*/
router.delete('/:id/delete', Authentication, AuthAccess('Product', 'delete'), update_product);

/* @description -> To give rating to the product
   @end-Point -> /api/product/:id/rate
   @methtod -> PATCH
   @access -> Private (user) 
*/
router.patch('/:id/rate', Authentication, AuthAccess('Product', 'update'), rate_product);

/* @description -> To give rating to the product
   @end-Point -> /api/product/filter?
   @methtod -> GET
   @access -> Public 
*/
router.get('/filter', Authentication, AuthAccess('Product', 'read'), product_filters);

export default router;