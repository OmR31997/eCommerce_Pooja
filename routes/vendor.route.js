import express from 'express';
import { authentication, authorization} from '../middlewares/auth.middleware.js';
import { confirm_otp, get_vendor_dashboard, vendor_signup } from '../controllers/vendor.controller.js';

const router = express.Router();

/* @description -> To sign-up as vendor
   @end-Point -> /api/vendor/sign-up
   @methtod -> POST
   @access -> Private (user) 
*/
router.post('/sign-up', authentication, authorization.CUSTOMER, vendor_signup);

/* @description -> To confirm-otp and update in vendor & user records
   @end-Point -> /api/vendor/confirm-otp
   @methtod -> POST
   @access -> Private (user) 
*/
router.post('/confirm-otp', authentication, authorization.CUSTOMER, confirm_otp);

/* @description -> To view dashboard data of vendor 
   @end-Point -> /api/vendor/dashboard
   @methtod -> GET
   @access -> Private (vendor) 
*/
router.get('/dashboard', authentication, authorization.VENDOR, get_vendor_dashboard);

export default router;