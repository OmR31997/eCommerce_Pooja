import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadPath = path.join('public', 'uploads');

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, uploadPath)
    },
    filename: (req, file, callBack) => {
        const uniqueName = Date.now() + file.originalname + path.extname(file.originalname);
        callBack(null, uniqueName);
    }
});

export const upload = multer({ storage, limits: { fieldSize: 2 * 1024 * 1024 } });