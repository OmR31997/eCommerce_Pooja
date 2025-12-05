import express from 'express';
import { get_payout_status, initiate_vendor_payout } from '../src/payout/payout.controller.js';

const router = express.Router();

/* @description -> Payment initiate using Razorpay 
   @end-Point -> /api/vendor/init
   @methtod -> POST
   @access -> Private (user) 
*/
router.post('/vendor/init', initiate_vendor_payout);

/* @description -> Payment initiate using Razorpay 
   @end-Point -> /api/vendor//vendor/status
   @methtod -> POST
   @access -> Private (user) 
*/
router.post('/vendor/status', get_payout_status);
export default router;