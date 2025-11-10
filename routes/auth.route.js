import express from 'express';
import { confirm_signIn_otp, forgot_password, google_Callback, reset_password, send_otp, sign_in, sign_in_withGoogle, sign_up } from '../controllers/auth.controller.js';

const router = express.Router();

/* @description -> To generate otp
   @end-Point -> /api/auth/send-otp
   @methtod -> POST
*/
router.post('/send-otp', send_otp);

/* @description -> To create new user
   @end-Point -> /api/auth/sign-up
   @methtod -> POST
*/
router.post('/sign-up', sign_up);

/* @description -> Sign Credential 
   @end-Point -> /api/auth/sign-in
   @methtod -> POST
*/
router.post('/sign-in', sign_in);

/* @description -> OTP Confirmation 
   @end-Point -> /api/auth/confirm-otp-signIn
   @methtod -> POST
*/
router.post('/confirm-otp-signIn', confirm_signIn_otp);

/* @description -> Step-1: Redirect user to Google login
   @end-Point -> /api/auth/google
   @methtod -> GET
*/
router.get('/google', sign_in_withGoogle);

/* @description -> Step-2: Handle callback from Google
   @end-Point -> /api/auth/google/callBack
   @methtod -> GET
*/
router.get('/google/callback', google_Callback);

/* @description -> to update password if forgotten 
   @end-Point -> /api/auth/forgot-password
   @methtod -> POST
*/
router.post('/forgot-password', forgot_password);

/* @description -> to update password, verify the otp or token 
   @end-Point -> /api/auth/reset-password
   @methtod -> POST
*/
router.post('/reset-password', reset_password);

export default router;