import express from 'express';
import { create_backup, download_backup, restore_backup } from '../controllers/backup.controller.js';

const router = express.Router();
/* @description -> To take backup
   @end-Point -> /api/admin/backup
   @methtod -> POST
   @access -> (super_admin)
*/
router.get('/create', create_backup);
router.post('/restore', restore_backup);
router.get('/download', download_backup);

export default router;