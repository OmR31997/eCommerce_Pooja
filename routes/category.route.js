import express from 'express';
import { create_product_category, update_category, view_categories } from '../controllers/category.controller.js';
import { authentication, authorizationRoles } from '../middlewares/auth.middleware.js';
import { Upload } from '../middlewares/upload.middleware.js';
const router = express.Router()

/* @description -> To a new category
   @end-Point -> /api/category/create
   @methtod -> POST
   @access -> Private (admin) 
*/
router.post('/create', authentication, authorizationRoles(['admin']), Upload('CTG-').single('imageUrl'), create_product_category);

/* @description -> To view categories
   @end-Point -> /api/category/view
   @methtod -> GET 
*/
router.get('/view', view_categories);

/* @description -> To view categories
   @end-Point -> /api/category/update
   @methtod -> PATCH 
*/
router.patch('/:id/update', authentication, authorizationRoles(['admin']), Upload('CTG-').single('imageUrl'), update_category)

export default router;