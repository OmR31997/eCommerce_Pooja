import express from 'express';
import { create_admin, delete_admin, get_admin_by_id, get_admins, get_me, manage_product, manage_refund, manage_staff, manage_user, manage_vendor, update_profile } from '../src/admin/admin.controller.js';
import { AuthAccess } from '../middlewares/auth.middleware.js';


const router = express.Router();

// READ------------------------|
/* @description -> To get profile
   @end-Point -> /api/admin/me
   @methtod -> GET
   @access -> Private (adminId===req.user.id) 
*/
router.get('/me', AuthAccess('Admin', 'read'), get_me);

/* @description -> To view admin list via super_admin & admin only own profile
   @end-Point -> /api/admin/view
   @methtod -> GET
*/
router.get('/view', AuthAccess('Admin', 'read'), get_admins);

/* @description -> To view admin list via super_admin & admin only own profile
   @end-Point -> /api/admin/:id
   @methtod -> GET
*/
router.get('/:id', AuthAccess('Admin', 'read'), get_admin_by_id);

// CREATE---------------------|
/* @description -> To create sub admin
   @end-Point -> /api/admin/create
   @methtod -> POST
*/
router.post('/create', AuthAccess('Admin', 'create'), create_admin);

// UPDATE---------------------|
/* @description -> To update profile
   @end-Point -> /api/admin/update
   @methtod -> PATCH
*/
router.patch('/update', AuthAccess('Admin', 'update'), update_profile);

/* @description -> To set the status of the staff
   @end-Point -> /api/admin/:id/staff-approval            
   @methtod -> PATCH
   @access -> Private (admin) 
   @id -> _id
*/
router.patch('/:staffId/staff-approval', AuthAccess('Admin', 'update'), manage_staff);

/* @description -> To give approval to vendor for sale
   @end-Point -> /api/admin/:id/vendor-approval
   @methtod -> POST
   @access -> Private (admin) 
*/
router.patch('/:vendorId/vendor-approval', AuthAccess('Admin', 'update'), manage_vendor);

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
router.patch('/:userId/user-manage', AuthAccess('Admin', 'update'), manage_user);

/* @description -> To set the status of the staff
   @end-Point -> /api/admin/:refundId/refund     
   @methtod -> PATCH
   @access -> Private (admin) 
   @id -> _id
*/
router.patch('/:returnId/refund', AuthAccess('Admin', 'update'), manage_refund);

// DELETE---------------------|
/* @description -> To delete sub-admin
   @end-Point -> /api/admin/delete
   @methtod -> DELETE
*/
router.delete('/:id/delete', AuthAccess('Admin', 'delete'), delete_admin);

export default router;