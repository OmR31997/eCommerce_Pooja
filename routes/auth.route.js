import express from 'express';
import { change_passoword, confirm_signIn_otp, forgot_password, google_Callback, refresh_token, reset_password, send_otp, sign_in, sign_in_withGoogle, sign_out, sign_out_all_devices, sign_up, test_protected } from '../controllers/auth.controller.js';
import { Authentication } from '../middlewares/auth.middleware.js';
const router = express.Router();

router.get('/protected', Authentication, test_protected);

router.post('/refresh-token', refresh_token);

router.post('/logged-out', sign_out);

router.post('/logged-out-from-all-device', sign_out_all_devices);

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

/* @description -> Change passwor
   @end-Point -> /api/auth/change-password
   @methtod -> PATCH
*/
router.patch('/change-password', Authentication, change_passoword);

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