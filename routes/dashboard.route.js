import express from 'express';
import { adminDashboard, vendorDashboard } from '../controllers/dashboard.controller.js';
import { authentication, authorizationRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/admin-overview', adminDashboard);

// router.get('/admin/sales', '');

router.get('/vendor-overview', authentication, vendorDashboard);

// router.get('/admin/sales', '');

// router.get('/staff/overview', '');

export default router