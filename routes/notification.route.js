import express from 'express';
import { AuthAccess } from '../middlewares/auth.middleware.js';
import { get_all_notifications, get_notification_by_id, get_notifications, mark_read_notification } from '../src/notification/notification.controller.js';

const router = express.Router();

/* @description -> To get notification
   @end-Point -> /api/notificcation
   @methtod -> GET
   @access -> (user/vendor/admin/super_admin) 
*/
router.get('/', get_notifications);

/* @description -> To get overall notification
   @end-Point -> /api/notification/:notifyId/read
   @methtod -> GET
   @access -> (user/vendor/admin/super_admin) 
*/
router.get('/:notifyId/read', AuthAccess('Admin', 'read'), get_notification_by_id);

/* @description -> To get overall notification
   @end-Point -> /api/notification/all
   @methtod -> GET
   @access -> (user/vendor/admin/super_admin) 
*/
router.get('/all', AuthAccess('Admin', 'read'), get_all_notifications);

/* @description -> To get overall notification
   @end-Point -> /api/notification/:notifyId/read
   @methtod -> GET
   @access -> (user/vendor/admin/super_admin) 
*/
router.patch('/:notifyId/mark', AuthAccess('Admin', 'update'), mark_read_notification);

export default router;