import express from 'express';
import { get_admin_dashboard, manage_product, manage_vendor } from '../controllers/admin.controller.js';
import { authentication, authorizationRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

/* @description -> To access admin dashboard data
   @end-Point -> /api/admin/dashboard
   @methtod -> GET
   @access -> Private (admin) 
*/
router.get('/dashboard', get_admin_dashboard);

/* @description -> To give approval to vendor for sale
   @end-Point -> /api/admin/:id/vendor-approval
   @methtod -> POST
   @access -> Private (admin) 
*/
router.patch('/:id/vendor-approval', authentication, authorizationRoles(['admin']), manage_vendor);

/* @description -> To set the status of the product
   @end-Point -> /api/admin/:id/product-approval            
   @methtod -> POST
   @access -> Private (admin) 
   @id -> sku/_id
*/
router.patch('/:id/product-approval', authentication, authorizationRoles(['admin']), manage_product)

export default router;