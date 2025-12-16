import express from 'express';
import { clear_categories, create_category, create_sub_category, delete_category, get_categories, get_category_by_id, get_category_by_slug, update_category } from '../src/category/category.controller.js';
import { Upload } from '../middlewares/upload.middleware.js';
import { AuthAccess } from '../middlewares/auth.middleware.js';

const router = express.Router()

// CREATE------------------------|
/* @description -> To a new category
   @end-Point -> /api/category/create
   @methtod -> POST
   @access -> Private (admin/super_admin) 
*/
router.post('/create', AuthAccess('Category', 'create'),
   Upload('CTG-').single('imageUrl'),
   create_category);

/* @description -> To a create subcategory
   @end-Point -> /api/category/create/:parent/sub
   @methtod -> POST
   @access -> Private (admin) 
*/
router.post('/create/:parent/sub', AuthAccess('Category', 'create'),
   Upload('CTG-').single('imageUrl'),
   create_sub_category);

// READ--------------------------|
/* @description -> To view categories
   @end-Point -> /api/category/view
   @methtod -> GET
   @access -> (admin/super_admin) 
*/
router.get('/view', AuthAccess('Category', 'read'), get_categories);

/* @description -> To view category by categoryId
   @end-Point -> /api/category/:id/view
   @methtod -> GET 
*/
router.get('/:categoryId/view-id', AuthAccess('Category', 'read'), get_category_by_id);

/* @description -> To view category bySlug
   @end-Point -> /api/category/:slug/view-slug
   @methtod -> GET 
*/
router.get('/:slug/view-slug', AuthAccess('Category', 'read'), get_category_by_slug);

/* @description -> To search
   @end-Point -> /api/category/?find=
   @methtod -> GET 
*/
router.get('/filter', AuthAccess('Category', 'read'), get_categories);

// UPDATE------------------------|
/* @description -> To update category by categoryId
   @end-Point -> /api/category/:id/update
   @methtod -> PATCH 
*/
router.patch('/:categoryId/update', AuthAccess('Category', 'update'),
   Upload('CTG-').single('imageUrl'),
   update_category)

// DELETE------------------------|
/* @description -> To delete category by categoryId
   @end-Point -> /api/category/:id/delete
   @methtod -> DELETE 
*/
router.delete('/:categoryId/delete', AuthAccess('Category', 'delete'),
   Upload('CTG-').single('imageUrl'),
   delete_category);

/* @description -> To cleared categories
   @end-Point -> /api/category/clear
   @methtod -> DELETE 
*/
router.delete('/clear', AuthAccess('Category', 'delete'), clear_categories);

export default router;