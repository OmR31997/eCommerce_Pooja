import express from 'express';
import { create_user } from '../controllers/user.controller.js';

const router = express.Router();

/* *Description -> To create new user
   *End-Point -> /api/user/create
   *Methtod -> POST
*/
router.post('/create', create_user);

export default router;