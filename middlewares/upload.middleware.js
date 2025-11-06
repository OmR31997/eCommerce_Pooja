import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { GenerateUniqueFileName } from '../utils/fileHelper.js';

const uploadPath = path.join('public', 'uploads');

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

export const Upload = (prefix = '') => {
    const storage = multer.diskStorage({
        destination: (req, file, callBack) => callBack(null, uploadPath),

        filename: (req, file, callBack) => {
            callBack(null, GenerateUniqueFileName(prefix, file.originalname));
        }
    });

    return multer({
        storage
    });
}