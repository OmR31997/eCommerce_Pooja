import express from 'express';
import { create_product_category, view_categories } from '../controllers/category.controller.js';
import { authentication, authorization } from '../middlewares/auth.middleware.js';

const router = express.Router()

/* @description -> To a new category
   @end-Point -> /api/category/create
   @methtod -> POST
   @access -> Private (admin) 
*/
router.post('/create', authentication, authorization.ADMIN, create_product_category);

/* @description -> To view categories
   @end-Point -> /api/category/view
   @methtod -> GET 
*/
router.get('/view', view_categories);

export default router;