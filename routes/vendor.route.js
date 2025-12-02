import express from 'express';
import { clear_vendors, confirm_otp, get_me, get_order_byId, get_orders_ByVendor, get_product_by_pId, get_product_bySku, get_products_ByVendor, get_vendor_byId, get_vendors, remove_vendor_profile, update_vendor_profile, vendor_filters} from '../controllers/vendor.controller.js';
import { Upload } from '../middlewares/upload.middleware.js';
import { AuthAccess } from '../middlewares/auth.middleware.js';

const router = express.Router();

/* @description -> To confirm-otp and update in vendor & user records
   @end-Point -> /api/vendor/confirm-otp
   @methtod -> POST
   @access -> Private (user) 
*/
router.post('/confirm-otp', AuthAccess('Vendor', 'create'), Upload('LOGO-').single('logoUrl'), confirm_otp);

/* @description -> To get profile
   @end-Point -> /api/user/me
   @methtod -> GET
   @access -> Private (vendor) 
*/
router.get('/me', AuthAccess('Vendor', 'read'), get_me);

/* @description -> To read all vendors records
   @end-Point -> /api/vendor/view
   @methtod -> GET
   @access -> Private (admin) 
*/
router.get('/view', AuthAccess('Vendor', 'read'), get_vendors);

/* @description -> To get vedor record byId
   @end-Point -> /api/vendor/view/:id
   @methtod -> GET
   @access -> Private (admin) 
*/
router.get('/view/:id', AuthAccess('Vendor', 'read'), get_vendor_byId);

/* @description -> To update vedor record byId
   @end-Point -> /api/vendor/view/:id
   @methtod -> PATCH
   @access -> Private (vendor/admin) 
*/
const MAX_VENDOR_DOCUMENTS = parseInt(process.env.MAX_VENDOR_DOCUMENTS) ?? 5;
router.patch('/:id/update', AuthAccess('Vendor', 'update'),
   Upload('VEND-').fields([
      { name: 'logoUrl', maxCount: 1 },
      { name: 'documents', maxCount: MAX_VENDOR_DOCUMENTS }
   ]), update_vendor_profile);

/* @description -> To delete vendor record byId
   @end-Point -> /api/vendor/:id/delete
   @methtod -> DELETE
   @access -> Private (vendor/admin) 
*/
router.delete('/:id/delete', AuthAccess('Vendor', 'delete'), remove_vendor_profile);

/* @description -> To clear vendors
   @end-Point -> /api/vendor/clear
   @methtod -> DELETE
   @access -> Private (admin) 
*/
router.delete('/clear', AuthAccess('Vendor', 'delete'), clear_vendors);

/* @description -> To filter
   @end-Point -> /api/vendor/filter
   @methtod -> GET 
*/
router.get('/filters', AuthAccess('Vendor', 'read'), vendor_filters);

//---------------------------------------------PRODUCT--------------------------------------------------|

/* @description -> To view product by productId which already created by own
   @end-Point -> /api/products
   @methtod -> GET
   @access -> Private (vendor/vendor_manager/admin/super_admin) 
*/
router.get('/products', AuthAccess('Vendor', 'read'), get_products_ByVendor);

/* @description -> To view single product by _id/sku
   @end-Point -> /api/vendor/product/view/:id
   @methtod -> GET
   @access -> Private (vendor/vendor_manager/admin/super_admin) 
*/
router.get('/product/:pId/', AuthAccess('Vendor', 'read'), get_product_by_pId);

/* @description -> To view single product bySku
   @end-Point -> /api/vendor/product/view/:sku
   @methtod -> GET
   @access -> Private (vendor/vendor_manager/admin/super_admin) 
*/
router.get('/product/via-sku/:sku', AuthAccess('Vendor', 'read'), get_product_bySku);

// ----------------------------------------------ORDER--------------------------------------------------|

/* @description -> To view product by productId which already created by own
   @end-Point -> /api/orders
   @methtod -> GET
   @access -> Private (vendor/vendor_manager/admin/super_admin) 
*/
router.get('/orders', AuthAccess('Vendor', 'read'), get_orders_ByVendor);

/* @description -> To view single product by orderId
   @end-Point -> /api/vendor/order/:orderId
   @methtod -> GET
   @access -> Private (vendor/vendor_manager/admin/super_admin) 
*/
router.get('/order/:orderId/', AuthAccess('Vendor', 'read'), get_order_byId);

export default router;