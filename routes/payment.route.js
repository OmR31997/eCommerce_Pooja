import express from 'express';
import { AuthAccess } from '../middlewares/auth.middleware.js';
import { confirm_payment, start_payment } from '../src/payment/payment.controller.js';

const router = express.Router();

/* @description -> Payment initiate using Razorpay 
   @end-Point -> /api/payment/pay
   @methtod -> POST
   @access -> Private (user) 
*/
router.post('/pay', AuthAccess('Payment', 'create'), start_payment);

/* @description -> Payment verification
   @end-Point -> /api/payment/verify
   @methtod -> POST
   @access -> Private (user) 
*/
router.post('/verify', AuthAccess('Payment', 'create'), confirm_payment);

export default router;
