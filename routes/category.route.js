import express from 'express';
import { clear_Category, create_product_category, remove_category, search_category, update_category, view_categories, view_category_byId, view_category_bySlug, view_paginated_categories } from '../controllers/category.controller.js';
import { authentication, authorizationRoles } from '../middlewares/auth.middleware.js';
import { Upload } from '../middlewares/upload.middleware.js';

/** 
   * @swagger
   * tags: 
   *   -name: Category
   *   description: Product category management APIs
*/

const router = express.Router()

/* @description -> To a new category
   @end-Point -> /api/category/create
   @methtod -> POST
   @access -> Private (admin) 
*/
router.post('/create', authentication, authorizationRoles(['admin']), Upload('CTG-').single('imageUrl'), create_product_category);

router.post('/create/:parent/sub', authentication, authorizationRoles(['admin']), Upload('CTG-').single('imageUrl'), create_product_category);

/** 
   * @swagger
   * /v1/category/view:
   *   get:
   *     summary: Get all product categories
   *     tags: [Category]
   *     responses: 
   *       200: 
   *         description: List of all active categories.
*/
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
router.patch('/:id/update', authentication, authorizationRoles(['admin']), Upload('CTG-').single('imageUrl'), update_category)

/* @description -> To delete category by categoryId
   @end-Point -> /api/category/:id/delete
   @methtod -> DELETE 
*/
router.delete('/:id/delete', authentication, authorizationRoles(['admin']), Upload('CTG-').single('imageUrl'), remove_category);

/* @description -> To cleared categories
   @end-Point -> /api/category/clear
   @methtod -> DELETE 
*/
router.delete('/clear', authentication, authorizationRoles(['admin']), clear_Category);

export default router;
