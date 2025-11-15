import express from 'express';
import { clear_Category, create_product_category, remove_category, search_category, update_category, view_categories, view_category_byId, view_category_bySlug } from '../controllers/category.controller.js';
import { authentication, authorizationAccess} from '../middlewares/auth.middleware.js';
import { Upload } from '../middlewares/upload.middleware.js';

const router = express.Router()

/* @description -> To a new category
   @end-Point -> /api/category/create
   @methtod -> POST
   @access -> Private (admin) 
*/
router.post('/create', authentication, authorizationAccess('Category', 'isCreate'), Upload('CTG-').single('imageUrl'), create_product_category);

/* @description -> To a create subcategory
   @end-Point -> /api/category/create/:parent/sub
   @methtod -> POST
   @access -> Private (admin) 
*/
router.post('/create/:parent/sub', authentication, authorizationAccess('Category', 'isCreate'), Upload('CTG-').single('imageUrl'), create_product_category);

/* @description -> To view categories
   @end-Point -> /api/category/view
   @methtod -> GET 
*/
router.get('/view', view_categories);

/* @description -> To view category by categoryId
   @end-Point -> /api/category/:id/view
   @methtod -> GET 
*/
router.get('/:id/view-id', view_category_byId);

/* @description -> To view category bySlug
   @end-Point -> /api/category/:slug/view-slug
   @methtod -> GET 
*/
router.get('/:slug/view-slug', view_category_bySlug);

/* @description -> To update category by categoryId
   @end-Point -> /api/category/:id/update
   @methtod -> PATCH 
*/
router.patch('/:id/update', authentication, authorizationAccess('Category', 'isUpdate'), Upload('CTG-').single('imageUrl'), update_category)

/* @description -> To delete category by categoryId
   @end-Point -> /api/category/:id/delete
   @methtod -> DELETE 
*/
router.delete('/:id/delete', authentication, authorizationAccess('Category', 'isDelete'), Upload('CTG-').single('imageUrl'), remove_category);

/* @description -> To cleared categories
   @end-Point -> /api/category/clear
   @methtod -> DELETE 
*/
router.delete('/clear', authentication, authorizationAccess('Category', 'isDelete'), clear_Category);

/* @description -> To search
   @end-Point -> /api/category/?find=
   @methtod -> GET 
*/
router.get('/', search_category);

export default router;
