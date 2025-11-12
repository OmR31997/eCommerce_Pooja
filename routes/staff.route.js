import express from 'express';
import { Upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post('/profile', Upload('PROFILE').single('profilePic'), (req, res) => {
  res.status(200).json({
    message: 'File uploaded successfully!',
    file: req.file?.path,
    name: req.body?.staffName,
  });
});

export default router;
