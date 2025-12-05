import express from 'express';
import { AuthAccess } from '../middlewares/auth.middleware.js';
import { get_user_notification, mark_read_notification } from '../src/notification/notification.controller.js';
const router = express.Router();

router.get('/all', AuthAccess('Admin', 'read'), get_user_notification);

router.patch('/:id/read', AuthAccess('Admin', 'read'), mark_read_notification);

export default router;