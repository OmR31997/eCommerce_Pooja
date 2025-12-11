import { chat_message } from '../src/chat/chat-controller.js';
import express from 'express';
import { Authentication } from '../middlewares/auth.middleware.js';
const router = express.Router();

router.post('/', Authentication, chat_message);

export default router