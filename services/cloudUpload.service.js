import cloudinary from '../config/cloudStotrage.config.js';
import fs from 'fs';

export const ToSaveCloudStorage = async (filePath, directoryPath, uniqueName) => {
    try {
        const cloudRes = await cloudinary.uploader.upload(
            filePath, {
            folder: directoryPath,
            public_id: uniqueName,
            resource_type: 'auto',
        });
        
        // Delete local temp file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return cloudRes.secure_url;
    } catch (error) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
}