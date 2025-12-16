import express from 'express';
import { AuthAccess } from '../middlewares/auth.middleware.js';
import { clear_all_permissions, create_permissions, delete_permission, get_permission_by_id, get_permissions, update_permission } from '../src/permission/permission.controller.js';

const router = express.Router();
// READ------------------------|
/* @description -> To get permission details
   @end-Point -> /api/permission/view
   @methtod -> GET
*/
router.get('/view', AuthAccess('Permission', 'read'), get_permissions);

/* @description -> To get permission details
   @end-Point -> /api/permission/:permissionId
   @methtod -> GET
*/
router.get('/:permissionId', AuthAccess('Permission', 'read'), get_permission_by_id);

// CREATE------------------------|
/* @description -> To create role
   @end-Point -> /api/permission/create
   @methtod -> POST
*/
router.post('/create', AuthAccess('Permission', 'create'), create_permissions);

// UPDATE------------------------|
/* @description -> To update permission
   @end-Point -> /api/permission/:id/update
   @methtod -> PATCH
*/
router.patch('/:permissionId/update',  AuthAccess('Permission', 'update'), update_permission);

// DELETE------------------------|
/* @description -> To delete permission
   @end-Point -> /api/permission/:id/delete
   @methtod -> DELETE
*/
router.delete('/:permissionId/delete', AuthAccess('Permission', 'delete'), delete_permission);

/* @description -> To clear permissions
   @end-Point -> /api/permission/clead
   @methtod -> DELETE
*/
router.delete('/clear', AuthAccess('Permission', 'delete'), clear_all_permissions);

export default router;