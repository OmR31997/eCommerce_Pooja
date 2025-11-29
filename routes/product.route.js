import express from 'express';
import { create_product, product_filters, public_product_byId, public_products, rate_product, secured_product_by_pId, secured_product_by_sku, secured_products, update_product } from '../controllers/product.controller.js';
import { Upload } from '../middlewares/upload.middleware.js';
import { AuthAccess, Authentication } from '../middlewares/auth.middleware.js';

const router = express.Router();
const MAX_PRODUCT_IMAGES = parseInt(process.env.MAX_PRODUCT_IMAGES) || 5;

/* @description -> To create a new product via vendor
   @end-Point -> /api/product/create
   @methtod -> POST
   @access -> Private (vendor) 
*/
router.post('/create', Authentication, AuthAccess('Product', 'create'),
   Upload('PROD-').array('images', MAX_PRODUCT_IMAGES),
   create_product);

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

router.get('/all-secured', Authentication, AuthAccess('Product', 'read'), secured_products);

/* @description -> To get single product byProductId 
   @end-Point -> /api/product/via-product-pId/:pId
   @methtod -> GET
   @access -> (admin, super_admin, product_manager(staff)) 
*/
router.get('/via-product-id/:pId', Authentication, AuthAccess('Product', 'read'), secured_product_by_pId);

/* @description -> To get single product bySku
   @end-Point -> /api/product/via-product-sku/:sku
   @methtod -> GET
   @access -> (admin, super_admin, product_manager(staff)) 
*/
router.get('/via-product-sku/:sku', Authentication, AuthAccess('Product', 'read'), secured_product_by_sku);

//-----------------------------------------------------------------------------------------------------

// PUBLIC

/* @description -> To view products
   @end-Point -> /api/product/view
   @methtod -> GET
*/
router.get('/view', public_products);

router.get('/:id', public_product_byId);

export default router;