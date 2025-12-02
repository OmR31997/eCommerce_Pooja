import express from 'express';
import { create_backup, download_backup, restore_backup } from '../controllers/backup.controller.js';

const router = express.Router();

/* @description -> To create backup
   @end-Point -> /api/backup/create
   @methtod -> POST
   @access -> (super_admin)
*/
router.get('/create', create_backup);

/* @description -> To restore
   @end-Point -> /api/backup/restore
   @methtod -> POST
   @access -> (super_admin)
*/
router.post('/restore', restore_backup);

/* @description -> To dowload backup in the form of excel
   @end-Point -> /api/backup/download
   @methtod -> POST
   @access -> (super_admin)
*/
router.get('/download', download_backup);

export default router;