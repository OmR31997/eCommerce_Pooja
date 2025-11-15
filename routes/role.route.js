import express from 'express';
import { delete_admin, get_admin, get_admin_dashboard, manage_permissions, manage_product, manage_roles, manage_vendor, update_admin_profile, update_super_admin_profile } from '../controllers/admin.controller.js';
import { authentication, authorizationAccess } from '../middlewares/auth.middleware.js';
import { clear_roles, create_roles, delete_role, update_roles } from '../controllers/role.controller.js';

const router = express.Router();

/* @description -> To create role
   @end-Point -> /api/role/create
   @methtod -> POST
*/
router.post('/create', create_roles);
router.post('/:id/update', update_roles);
router.post('/:id/delete', delete_role);
router.post('/clear', clear_roles);

export default router;