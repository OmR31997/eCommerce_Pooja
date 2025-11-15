import express from 'express';
import { clear_all_permissions, create_permissions, delete_permission, update_permission } from '../controllers/permission.controller.js';

const router = express.Router();

/* @description -> To create role
   @end-Point -> /api/role/create
   @methtod -> POST
*/
router.post('/create', create_permissions);
router.post('/:id/update', update_permission);
router.post('/:id/delete', delete_permission);
router.post('/clear', clear_all_permissions);


export default router;