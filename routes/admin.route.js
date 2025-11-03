import express from 'express';
import { get_admin_dashboard, product_approval, vendor_approval } from '../controllers/admin.controller.js';

const router = express.Router();

/* *Description -> To access admin dashboard data
   *End-Point -> /api/admin/dashboard
   *Methtod -> GET
*/
router.get('/dashboard', get_admin_dashboard);

/* *Description -> To give approval to vendor for sale
   *End-Point -> /api/admin/vendor-approval
   *Methtod -> POST
*/
router.post('/vendor-approval', vendor_approval);

/* *Description -> To give approval to the product
   *End-Point -> /api/admin/product-approval
   *Methtod -> POST
*/
router.post('/product-approval', product_approval);

export default router;