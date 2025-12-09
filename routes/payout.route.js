import express from 'express';
import { get_payout_status, initiate_vendor_payout } from '../src/payout/payout.controller.js';
import { AuthAccess } from '../middlewares/auth.middleware.js';

const router = express.Router();

/* @description -> Payment initiate using Razorpay 
   @end-Point -> /api/vendor/init
   @methtod -> POST
   @access -> Private (user) 
*/
router.post('/init', AuthAccess('Payout', 'create'), initiate_vendor_payout);

/* @description -> Payment initiate using Razorpay 
   @end-Point -> /api/vendor//vendor/status
   @methtod -> POST
   @access -> Private (user) 
*/
router.get('/status', AuthAccess('Payout', 'read'), get_payout_status);

export default router;