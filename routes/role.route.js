import express from 'express';
import { clear_roles, create_roles, delete_role, get_roles, update_roles } from '../src/role/role.controller.js';
import { AuthAccess } from '../middlewares/auth.middleware.js';

const router = express.Router();

/* @description -> To read role
   @end-Point -> /api/role/view
   @methtod -> POST
   @access -> Private (super_admin/admin)
*/
router.get('/view', AuthAccess('Role', 'read'), get_roles);

/* @description -> To create role
   @end-Point -> /api/role/create
   @methtod -> POST
   @access -> Private (super_admin/admin)
*/
router.post('/create', AuthAccess('Role', 'create'), create_roles);

/* @description -> To update role
   @end-Point -> /api/role/:id/update
   @methtod -> PATCH
   @access -> Private (super_admin/admin/update)
*/
router.patch('/:roleId/update', AuthAccess('Role', 'update'), update_roles);

/* @description -> To delete role
   @end-Point -> /api/role/:id/delete
   @methtod -> DELETE
   @access -> Private (super_admin/admin)
*/
router.delete('/:id/delete', AuthAccess('Role', 'delete'), delete_role);

/* @description -> To clear role
   @end-Point -> /api/role/clear
   @methtod -> DELETE
   @access -> Private (super_admin/admin)
*/
router.delete('/clear', AuthAccess('Role', 'delete'), clear_roles);

export default router;