import express from 'express';
import { create_product_category } from '../controllers/category.controller.js';

const router = express.Router()

/* *Description -> To a new category
   *End-Point -> /api/category/create
   *Methtod -> GET
*/
router.post('/create', create_product_category);

export default router;