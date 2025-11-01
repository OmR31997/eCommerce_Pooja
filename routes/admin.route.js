import express from 'express';
import { get_admin_dashboard, vendor_approval } from '../controllers/admin.controller.js';

const router = express.Router();

/* *Description -> To access admin dashboard data
   *End-Point -> /api/admin/dashboard
   *Methtod -> GET
*/
router.get('/dashboard', get_admin_dashboard);

/* *Description -> To give approval to vendor for sale
   *End-Point -> /api/admin/approval
   *Methtod -> POST
*/
router.post('/approval', vendor_approval);
export default router;