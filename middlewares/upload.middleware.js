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
        // 1762347960546Screenshot 2025-08-24 095918.png.png FROM MULTER
        console.log(uniqueName, 'FROM MULTER')
        callBack(null, uniqueName);
    }
});

export const Upload = multer({ storage, limits: { fieldSize: 2 * 1024 * 1024 } });