import express from 'express';
import { Upload } from '../middlewares/upload.middleware.js';
import { clear_staff, create_staff, get_me, read_staff_byId, read_staffs, remove_staff, update_staff, } from '../controllers/staff.controller.js';
import { authentication, authorizationAccess } from '../middlewares/auth.middleware.js';

const router = express.Router();

/* @description -> To get profile
   @end-Point -> /api/staff/me
   @methtod -> POST
   @access -> Private (staffId===req.user.id) 
*/
router.post('/me', authentication, authorizationAccess('Staff', 'isRead'), get_me);

/* @description -> To create new staff
   @end-Point -> /api/staff/create
   @methtod -> POST
   @access -> Private (super_admin/admin/user) 
*/
router.post('/create', authentication, authorizationAccess('Staff', 'isCreate'), create_staff);

/* @description -> To read all staff records
   @end-Point -> /api/staff/view
   @methtod -> GET
   @access -> Private (super_admin/admin/user) 
*/
router.get('/view', authentication, authorizationAccess('Staff', 'isRead'), read_staffs);

/* @description -> To read all staff records
   @end-Point -> /api/staff/view/:id
   @methtod -> GET
   @access -> Private (super_admin/admin/staff) 
*/
router.get('/view/:id', authentication, authorizationAccess('Staff', 'isRead'), read_staff_byId);

/* @description -> To update profile like: name, email, & phone etc. 
   @end-Point -> /api/staff/:id/update
   @methtod -> PATCH
   @access -> Private (super_admin/admin/staff) 
*/
router.patch('/:id/update', authentication, authorizationAccess('Staff', 'isUpdate', { allowSelf: true }), update_staff);

/* @description -> To delete staff record byId
   @end-Point -> /api/staff/:id/delete
   @methtod -> DELETE
   @access -> Private (super_admin/admin/staff) 
*/
router.delete('/:id/delete', authentication, authorizationAccess('Staff', 'isDelete'), remove_staff);

/* @description -> To clear users
   @end-Point -> /api/staff/clear
   @methtod -> DELETE
   @access -> Private (super_admin) 
*/
router.delete('/:id/clear', authentication, authorizationAccess('Staff', 'isDelete'), clear_staff);

export default router;
