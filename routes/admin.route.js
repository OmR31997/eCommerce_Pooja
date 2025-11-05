import express from 'express';
import { get_admin_dashboard, manage_vendor } from '../controllers/admin.controller.js';
import { authentication, authorizationRoles } from '../middlewares/auth.middleware.js';

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
router.post('/:id/vendor-approval', authentication, authorizationRoles(['admin']), manage_vendor);

export default router;