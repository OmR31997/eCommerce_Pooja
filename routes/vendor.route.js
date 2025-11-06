import express from 'express';
import { authentication, authorization, authorizationRoles} from '../middlewares/auth.middleware.js';
import { confirm_otp, get_dashboard, update_profile, vendor_signup } from '../controllers/vendor.controller.js';
import { Upload } from '../middlewares/upload.middleware.js';
const router = express.Router();

/* @description -> To sign-up as vendor
   @end-Point -> /api/vendor/sign-up
   @methtod -> POST
   @access -> Private (user) 
*/
router.post('/sign-up', authentication, authorizationRoles(['user']), vendor_signup);

/* @description -> To confirm-otp and update in vendor & user records
   @end-Point -> /api/vendor/confirm-otp
   @methtod -> POST
   @access -> Private (user) 
*/
router.post('/confirm-otp', authentication, authorizationRoles(['user']), Upload('LOGO-').single('logoUrl'), confirm_otp);

/* @description -> To view dashboard data of vendor 
   @end-Point -> /api/vendor/dashboard
   @methtod -> GET
   @access -> Private (vendor) 
*/
router.get('/dashboard', authentication, authorizationRoles(['vendor']), get_dashboard);

router.patch('/:id', authentication, authorizationRoles(['vendor']), update_profile);

export default router;