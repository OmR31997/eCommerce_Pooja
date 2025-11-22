import express from 'express';
import { AuthAccess } from '../middlewares/auth.middleware.js';
import { create_payment_order, verify_payment } from '../controllers/payment.controller.js';

const router = express.Router();

/* @description -> First hit this - For User pays immediately using Razorpay 
   @end-Point -> /api/payment/create
   @methtod -> POST
   @access -> Private (user) 
*/
router.post('/create',  AuthAccess('Order', 'create'), create_payment_order);

/* @description -> After /create-order hit this - For verify payment
   @end-Point -> /api/payment/verify
   @methtod -> POST
   @access -> Private (user) 
*/
router.post('/verify',  AuthAccess('Order', 'create'), verify_payment);

export default router;
