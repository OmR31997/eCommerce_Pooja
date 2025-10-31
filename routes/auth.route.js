import express from 'express';
import { forgor_password, reset_password, send_otp, sign_in, sign_up } from '../controllers/auth.controller.js';

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

router.post('/forgot-password', forgor_password);

router.post('/reset-password', reset_password);

export default router;