import express from 'express';
import { create_admin, delete_admin, get_admin, manage_permission, manage_product, manage_staff, manage_user, manage_vendor, update_profile } from '../controllers/admin.controller.js';
import { AuthAccess } from '../middlewares/auth.middleware.js';

const router = express.Router();

/* @description -> To create sub admin
   @end-Point -> /api/admin/create
   @methtod -> POST
*/
router.post('/create', AuthAccess('Admin', 'create'), create_admin);

/* @description -> To get profile
   @end-Point -> /api/admin/me
   @methtod -> GET
   @access -> Private (adminId===req.user.id) 
*/
router.get('/me', AuthAccess('Admin', 'read'), get_admin);

/* @description -> To view admin list via super_admin & admin only own profile
   @end-Point -> /api/admin/view
   @methtod -> GET
*/
router.get('/view', AuthAccess('Admin', 'read'), get_admin);

/* @description -> To update profile
   @end-Point -> /api/admin/update
   @methtod -> PATCH
*/
router.patch('/update', AuthAccess('Admin', 'update'), update_profile);

/* @description -> To delete sub-admin
   @end-Point -> /api/admin/delete
   @methtod -> DELETE
*/
router.delete('/:id/delete', AuthAccess('Admin', 'delete'), delete_admin);

/* @description -> To set the status of the staff
   @end-Point -> /api/admin/:id/staff-approval            
   @methtod -> PATCH
   @access -> Private (admin) 
   @id -> _id
*/
router.patch('/:id/staff-approval', AuthAccess('Admin', 'update'), manage_staff);

/* @description -> To give approval to vendor for sale
   @end-Point -> /api/admin/:id/vendor-approval
   @methtod -> POST
   @access -> Private (admin) 
*/
router.patch('/:id/vendor-approval', AuthAccess('Admin', 'update'), manage_vendor);

/* @description -> To set the status of the product
   @end-Point -> /api/admin/:id/product-approval            
   @methtod -> PATCH
   @access -> Private (admin) 
   @id -> _id
*/
router.patch('/:pId/product-approval', AuthAccess('Admin', 'update'), manage_product);

/* @description -> To set the status of the staff
   @end-Point -> /api/admin/:id/staff-approval            
   @methtod -> POST
   @access -> Private (admin) 
   @id -> _id
*/
router.patch('/:id/user-manage', AuthAccess('Admin', 'update'), manage_user);

/* @description -> To set the status of the permission
   @end-Point -> /api/admin/:id/permission-manage            
   @methtod -> PATCH
   @access -> Private (admin) 
   @id -> _id
*/
router.patch('/:permissionId/permission-manage', AuthAccess('Admin', 'update'), manage_permission);

export default router;