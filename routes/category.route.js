import express from 'express';
import { create_product_category, view_categories } from '../controllers/category.controller.js';
import { authentication, authorization } from '../middlewares/auth.middleware.js';

const router = express.Router()

/* *Description -> To a new category
   *End-Point -> /api/category/create
   *Methtod -> GET
*/
router.post('/create', authentication, authorization.ADMIN, create_product_category);

/* *Description -> To view categories
   *End-Point -> /api/category/view
   *Methtod -> GET
*/
router.get('/view', view_categories);

export default router;