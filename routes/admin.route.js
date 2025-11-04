import express from 'express';
import { get_admin_dashboard, product_approval, vendor_approval } from '../controllers/admin.controller.js';

const router = express.Router();

/* @description -> To access admin dashboard data
   @end-Point -> /api/admin/dashboard
   @methtod -> GET
   @access -> Private (admin) 
*/
router.get('/dashboard', get_admin_dashboard);

/* @description -> To give approval to vendor for sale
   @end-Point -> /api/admin/vendor-approval
   @methtod -> POST
   @access -> Private (admin) 
*/
router.post('/vendor-approval', vendor_approval);

/* @description -> To give approval to the product
   @end-Point -> /api/admin/product-approval
   @methtod -> POST
   @access -> Private (admin) 
*/
router.post('/product-approval', product_approval);

export default router;