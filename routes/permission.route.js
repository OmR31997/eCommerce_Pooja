import express from 'express';
import { AuthAccess } from '../middlewares/auth.middleware.js';
import { clear_all_permissions, create_permissions, delete_permission, get_permissions, update_permission } from '../controllers/permission.controller.js';

const router = express.Router();

/* @description -> To create role
   @end-Point -> /api/permission/create
   @methtod -> POST
*/
router.post('/create', AuthAccess('Permission', 'create'), create_permissions);

/* @description -> To get permission details
   @end-Point -> /api/permission/view
   @methtod -> GET
*/
router.get('/view', AuthAccess('Permission', 'read'), get_permissions);

/* @description -> To update permission
   @end-Point -> /api/permission/:id/update
   @methtod -> PATCH
*/
router.patch('/:id/update',  AuthAccess('Permission', 'update'), update_permission);

/* @description -> To delete permission
   @end-Point -> /api/permission/:id/delete
   @methtod -> DELETE
*/
router.delete('/:id/delete', AuthAccess('Permission', 'delete'), delete_permission);

/* @description -> To clear permissions
   @end-Point -> /api/permission/clead
   @methtod -> DELETE
*/
router.delete('/clear', AuthAccess('Permission', 'delete'), clear_all_permissions);

export default router;