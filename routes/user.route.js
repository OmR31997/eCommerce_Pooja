import express from 'express';
import { authentication, authorizationAccess, filterRestrictedStaffFields } from '../middlewares/auth.middleware.js';
import { clear_users, customer_filters, get_user_byId, get_users, remove_user_profile, update_user_profile, } from '../controllers/user.controller.js';

const router = express.Router();

/* @description -> To read all users records
   @end-Point -> /api/vendor/view
   @methtod -> GET
   @access -> Private (admin/user) 
*/
router.get('/view', authentication, authorizationAccess('User', 'isRead'), get_users);

/* @description -> To get user record byId
   @end-Point -> /api/vendor/view/:id
   @methtod -> GET
   @access -> Private (admin) 
*/
router.get('/view/:id', authentication, authorizationAccess('User', 'isRead'), get_user_byId);

/* @description -> To update own profile like: name, email, & phone etc. 
   @end-Point -> /api/user/profile/update
   @methtod -> PATCH
   @access -> Private (user) 
*/
router.patch('/:id/update', authentication, filterRestrictedStaffFields, authorizationAccess('User', 'isUpdate'), update_user_profile);

/* @description -> To delete user record byId
   @end-Point -> /api/user/:id/delete
   @methtod -> DELETE
   @access -> Private (user/admin) 
*/
router.delete('/:id/delete', authentication, authorizationAccess('User', 'isDelete'), remove_user_profile);

/* @description -> To clear users
   @end-Point -> /api/vendor/clear
   @methtod -> DELETE
   @access -> Private (admin) 
*/
router.delete('/clear', authentication, authorizationAccess('User', 'isDelete'), clear_users);

/* @description -> To filteration
   @end-Point -> /api/user/filter
   @methtod -> GET 
*/
router.get('/filter', authentication, authorizationAccess('User', 'isRead'), customer_filters);

export default router;