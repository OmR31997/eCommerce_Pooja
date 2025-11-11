import express from 'express';
import { authentication, authorizationRoles } from '../middlewares/auth.middleware.js';
import { clear_users, get_user_byId, get_users, remove_user_profile, search_users, update_user_profile, } from '../controllers/user.controller.js';

const router = express.Router();

/* @description -> To read all users records
   @end-Point -> /api/vendor/view
   @methtod -> GET
   @access -> Private (admin/user) 
*/
router.get('/view', authentication, authorizationRoles(['admin']), get_users);

/* @description -> To get user record byId
   @end-Point -> /api/vendor/view/:id
   @methtod -> GET
   @access -> Private (admin) 
*/
router.get('/view/:id', authentication, authorizationRoles(['admin', 'user']), get_user_byId);

/* @description -> To update own profile like: name, email, & phone etc. 
   @end-Point -> /api/user/profile/update
   @methtod -> PATCH
   @access -> Private (user) 
*/
router.patch('/:id/update', authentication, authorizationRoles(['user', 'admin']), update_user_profile);

/* @description -> To delete user record byId
   @end-Point -> /api/user/:id/delete
   @methtod -> DELETE
   @access -> Private (user/admin) 
*/
router.delete('/:id/delete', authentication, authorizationRoles(['vendor', 'admin']), remove_user_profile);

/* @description -> To clear users
   @end-Point -> /api/vendor/clear
   @methtod -> DELETE
   @access -> Private (admin) 
*/
router.delete('/clear', authentication, authorizationRoles(['admin']), clear_users);

/* @description -> To search
   @end-Point -> /api/user/?find=
   @methtod -> GET 
*/
router.get('/', search_users);

export default router;