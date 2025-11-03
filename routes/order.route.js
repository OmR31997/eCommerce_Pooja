import express from 'express';
import { authentication, authorization } from '../middlewares/auth.middleware.js';
import { cancel_order, checkout, update_order_status, view_order_by_id, view_user_orders } from '../controllers/order.controller.js';

const router = express.Router();

router.post('/checkout', authentication, authorization.CUSTOMER, checkout);

router.get('/view', authentication, authorization.CUSTOMER, view_user_orders);

router.get('/view/:id', authentication, authorization.CUSTOMER, view_order_by_id);

router.put('/:id/cancel', authentication, authorization.CUSTOMER, cancel_order);

router.patch('/:id/status', authentication, authorization.CUSTOMER, update_order_status);

export default router;
