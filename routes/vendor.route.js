import express from 'express';
import { authentication, authorization} from '../middlewares/auth.middleware.js';
import { create_vendor } from '../controllers/vendor.controller.js';

const router = express.Router();

router.post('/create', authentication, authorization.CUSTOMER, create_vendor);

export default router;