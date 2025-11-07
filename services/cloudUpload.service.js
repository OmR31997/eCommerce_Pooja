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

        return {
            secure_url: cloudRes.secure_url,
            public_url: cloudRes.public_id,
        };
    } catch (error) {
        if (fs.existsSync(filePath)) 
            fs.unlinkSync(filePath);
        
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
}

export const ToDeleteFromCloudStorage = async (directory, fileName) => {
    try {
        
        const public_id = `${directory}/${fileName.split('/').pop().split('.')[0]}`;
        await cloudinary.uploader.destroy(public_id); 

    } catch (error) {
        throw new Error(`Cloudinary delete error: ${error.message}`);
    }   
}