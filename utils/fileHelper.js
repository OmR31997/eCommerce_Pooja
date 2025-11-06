import fs from 'fs';
import path from 'path';

export const GenerateUniqueFileName = (prefix = '', originalname='') => {
    if(process.env.NODE_ENV !=='development')
        return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`
    else
    {
        const ext = path.extname(originalname);
        return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}${ext}`;
    }
}

export const ValidateImageFileType = (mimetype, allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']) => {
    return allowedTypes.includes(mimetype);
}

export const ValidateFileSize = (size, maxSizeMB = 2) => {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return size <= maxBytes;
}

export const DeleteLocalFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        throw new Error(`Error deleting file:`, error.message);
    }
}