import express from 'express';
import { get_order_returns, request_return, update_return } from '../src/return/return.controller.js';
import { AuthAccess } from '../middlewares/auth.middleware.js';
const router = express.Router();

/* @description -> To set the status of the staff
   @end-Point -> /api/return/:returnId         
   @methtod -> PATCH
   @access -> Private (admin/staff) 
   @id -> _id
*/
router.post('/create', AuthAccess('Return', 'create'), request_return);

router.get('/view/', AuthAccess('Return', 'read'), get_order_returns);

/* @description -> To set the status of the staff
   @end-Point -> /api/return/:returnId         
   @methtod -> PATCH
   @access -> Private (admin/staff) 
   @id -> _id
*/
router.get('/:returnId/', AuthAccess('Return', 'read'), get_order_returns);

/* @description -> To set the status of the staff
   @end-Point -> /api/return/:orderId/:returnId         
   @methtod -> PATCH
   @access -> Private (admin/staff) 
   @id -> _id
*/
router.patch('/:orderId/:returnId/return', AuthAccess('Return', 'update'), update_return);

export default router;