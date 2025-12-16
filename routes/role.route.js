import express from 'express';
import { AuthAccess } from '../middlewares/auth.middleware.js';
import { clear_all_roles, create_role, delete_role, get_role_by_id, get_roles, update_role } from '../src/role/role.controller.js';

const router = express.Router();

// READ------------------------|
/* @description -> To read role
   @end-Point -> /api/role/view
   @methtod -> POST
   @access -> Private (super_admin/admin)
*/
router.get('/view', AuthAccess('Role', 'read'), get_roles);

/* @description -> To read role
   @end-Point -> /api/role/:roleId
   @methtod -> POST
   @access -> Private (super_admin/admin)
*/
router.get('/:roleId', AuthAccess('Role', 'read'), get_role_by_id);

// CREATE------------------------|
/* @description -> To create role
   @end-Point -> /api/role/create
   @methtod -> POST
   @access -> Private (super_admin/admin)
*/
router.post('/create', AuthAccess('Role', 'create'), create_role);

// UPDATE------------------------|
/* @description -> To update role
   @end-Point -> /api/role/:id/update
   @methtod -> PATCH
   @access -> Private (super_admin/admin/update)
*/
router.patch('/:roleId/update', AuthAccess('Role', 'update'), update_role);

// DELETE------------------------|
/* @description -> To delete role
   @end-Point -> /api/role/:id/delete
   @methtod -> DELETE
   @access -> Private (super_admin/admin)
*/
router.delete('/:roleId/delete', AuthAccess('Role', 'delete'), delete_role);

/* @description -> To clear role
   @end-Point -> /api/role/clear
   @methtod -> DELETE
   @access -> Private (super_admin/admin)
*/
router.delete('/clear', AuthAccess('Role', 'delete'), clear_all_roles);

export default router;