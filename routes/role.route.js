import express from 'express';
import { clear_roles, create_roles, delete_role, get_roles, update_roles } from '../controllers/role.controller.js';

const router = express.Router();

router.get('/view', get_roles);

/* @description -> To create role
   @end-Point -> /api/role/create
   @methtod -> POST
*/
router.post('/create', create_roles);
router.patch('/:id/update', update_roles);
router.delete('/:id/delete', delete_role);
router.delete('/clear', clear_roles);

export default router;