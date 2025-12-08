import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ENV } from '../config/env.config.js';
import { GenerateUniqueFileName_H } from '../utils/helper.js';

const uploadPath = path.join('public', 'uploads');

if (!ENV.IS_DEV && !fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

export const Upload = (prefix = '') => {
    
    // Memory storage for cloud upload
    if(ENV.IS_PROD) {
        return multer({
            storage: multer.memoryStorage(),
            fileFilter: (req, file, callBack) => {
                if(["documents", "logoUrl", "images", "profilePic"].includes(file.fieldname)) {
                    callBack(null, true);
                }
                else {
                    callBack(new Error('Invalid field name'));
                }   
            }
        });
    }

    // Disk storage for DEV
    const storage = multer.diskStorage({
        destination: (req, file, callBack) => {
            callBack(null, uploadPath)
        },

        filename: (req, file, callBack) => {
            callBack(null, GenerateUniqueFileName_H(prefix, file.originalname));
        }
    });

    return multer({
        storage,
        fileFilter: (req, file, callBack) => {
            if(["documents", "logoUrl", "images", "profilePic"].includes(file.fieldname)) {
                callBack(null, true);
            }
            else {
                callBack(new Error("Invalid field name"));
            }
        }
    });
}