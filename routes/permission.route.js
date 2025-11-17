import express from 'express';
import { clear_all_permissions, create_permissions, delete_permission, get_permissions, update_permission } from '../controllers/permission.controller.js';

const router = express.Router();

/* @description -> To create role
   @end-Point -> /api/role/create
   @methtod -> POST
*/
router.post('/create', create_permissions);
router.get('/view', get_permissions);
router.patch('/:id/update', update_permission);
router.delete('/:id/delete', delete_permission);
router.delete('/clear', clear_all_permissions);


export default router;