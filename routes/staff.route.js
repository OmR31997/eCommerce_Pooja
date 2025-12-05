import express from 'express';
import { Upload } from '../middlewares/upload.middleware.js';
import { clear_staff, create_staff, get_me, read_staff_byId, read_staffs, remove_staff, update_staff, } from '../src/staff/staff.controller.js';
import { AuthAccess } from '../middlewares/auth.middleware.js';

const router = express.Router();

/* @description -> To get profile
   @end-Point -> /api/staff/me
   @methtod -> POST
   @access -> Private (staff) 
*/
router.get('/me', AuthAccess('Staff', 'read'), get_me);

/* @description -> To create new staff
   @end-Point -> /api/staff/create
   @methtod -> POST
   @access -> Private (super_admin/admin/staff_manager) 
*/
router.post('/create', AuthAccess('Staff', 'create'), create_staff);

/* @description -> To read all staff records
   @end-Point -> /api/staff/view
   @methtod -> GET
   @access -> Private (super_admin/admin/staff_manager) 
*/
router.get('/view', AuthAccess('Staff', 'read'), read_staffs);

/* @description -> To read all staff records
   @end-Point -> /api/staff/view/:id
   @methtod -> GET
   @access -> Private (super_admin/admin/staff_manager) 
*/
router.get('/view/:id', AuthAccess('Staff', 'read'), read_staff_byId);

/* @description -> To update profile like: name, email, & phone etc. 
   @end-Point -> /api/staff/:id/update
   @methtod -> PATCH
   @access -> Private (super_admin/admin/staff) 
*/
router.patch('/:id/update', AuthAccess('Staff', 'update'), update_staff);

/* @description -> To delete staff record byId
   @end-Point -> /api/staff/:id/delete
   @methtod -> DELETE
   @access -> Private (super_admin/admin/staff) 
*/
router.delete('/:id/delete', AuthAccess('Staff', 'delete'), remove_staff);

/* @description -> To clear users
   @end-Point -> /api/staff/clear
   @methtod -> DELETE
   @access -> Private (super_admin) 
*/
router.delete('/:id/clear', AuthAccess('Staff', 'delete'), clear_staff);

export default router;
