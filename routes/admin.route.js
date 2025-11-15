import express from 'express';
import { delete_admin, get_admin, get_admin_dashboard, manage_permissions, manage_product, manage_roles, manage_vendor, update_admin_profile, update_super_admin_profile } from '../controllers/admin.controller.js';
import { authentication, authorizationAccess } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/view', authentication, authorizationAccess('Admin', 'isRead'), get_admin);

router.patch('/update', authentication, authorizationAccess('Admin', 'isUpdate'), update_admin_profile);

router.patch('/update/super_admin', authentication, authorizationAccess('Admin', 'isUpdate'), update_super_admin_profile);

router.delete('/:id/delete', authentication, authorizationAccess('Admin', 'isUpdate'), delete_admin);

router.patch('/:id/manage-permission', authentication, authorizationAccess('Permission', 'isUpdate'), manage_permissions);

router.patch('/:id/manage-roles', authentication, authorizationAccess('Role', 'isUpdate'), manage_roles);

/* @description -> To access admin dashboard data
   @end-Point -> /api/admin/dashboard
   @methtod -> GET
   @access -> Private (admin) 
*/
router.get('/dashboard', authentication, authorizationAccess('Admin', 'isRead'), get_admin_dashboard);

/* @description -> To give approval to vendor for sale
   @end-Point -> /api/admin/:id/vendor-approval
   @methtod -> POST
   @access -> Private (admin) 
*/
router.patch('/:id/vendor-approval', authentication, authorizationAccess('Vendor', 'isUpdate'), manage_vendor);

/* @description -> To set the status of the product
   @end-Point -> /api/admin/:id/product-approval            
   @methtod -> POST
   @access -> Private (admin) 
   @id -> sku/_id
*/
router.patch('/:id/product-approval', authentication, authorizationAccess('Product', 'isUpdate'), manage_product)

export default router;