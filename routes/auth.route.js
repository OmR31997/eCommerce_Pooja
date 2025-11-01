import express from 'express';
import { confirm_signIn_otp, forgot_password, reset_password, send_otp, sign_in, sign_up } from '../controllers/auth.controller.js';

const router = express.Router();

/* *Description -> To generate otp
   *End-Point -> /api/auth/send-otp
   *Methtod -> POST
*/
router.post('/send-otp', send_otp);

/* *Description -> To create new user
   *End-Point -> /api/auth/sign-up
   *Methtod -> POST
*/
router.post('/sign-up', sign_up);

/* *Description -> Sign Credential 
   *End-Point -> /api/auth/sign-in
   *Methtod -> POST
*/
router.post('/sign-in', sign_in);

/* *Description -> OTP Confirmation 
   *End-Point -> /api/auth/confirm-otp-signIn
   *Methtod -> POST
*/
router.post('/confirm-otp-signIn', confirm_signIn_otp);

/* *Description -> to update password if forgotten 
   *End-Point -> /api/auth/forgot-password
   *Methtod -> POST
*/
router.post('/forgot-password', forgot_password);

/* *Description -> to update password, verify the otp or token 
   *End-Point -> /api/auth/reset-password
   *Methtod -> POST
*/
router.post('/reset-password', reset_password);

export default router;