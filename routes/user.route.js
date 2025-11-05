import express from 'express';
import { authentication, authorization, authorizationRoles } from '../middlewares/auth.middleware.js';
import { update_profile } from '../controllers/user.controller.js';

const router = express.Router();

/* @description -> To update own profile like: name, email, & phone etc. 
   @end-Point -> /api/user/profile/update
   @methtod -> PATCH
   @access -> Private (user/admin/user) 
*/
router.patch('/profile/update', authentication, authorizationRoles(['user', 'vendor']), update_profile);

export default router;