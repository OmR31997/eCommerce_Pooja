import express from 'express';
import { authentication, authorization} from '../middlewares/auth.middleware.js';
import { confirm_otp, get_vendor_dashboard, vendor_signup } from '../controllers/vendor.controller.js';

const router = express.Router();

/* *Description -> To sign-up as vendor
   *End-Point -> /api/vendor/sign-up
   *Methtod -> POST
*/
router.post('/sign-up', authentication, authorization.CUSTOMER, vendor_signup);

/* *Description -> To confirm-otp and update in vendor & user records
   *End-Point -> /api/vendor/confirm-otp
   *Methtod -> POST
*/
router.post('/confirm-otp', authentication, authorization.CUSTOMER, confirm_otp);

/* *Description -> To view dashboard data of vendor 
   *End-Point -> /api/vendor/dashboard
   *Methtod -> GET
*/
router.get('/dashboard', authentication, authorization.VENDOR, get_vendor_dashboard);

export default router;