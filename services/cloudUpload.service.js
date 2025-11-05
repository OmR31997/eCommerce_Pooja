import cloudinary from '../config/cloudStotrage.config.js';
import fs from 'fs';

export const ToSaveCloudStorage = async (filePath, directoryPath) => {
    const uniqueName = `LOGO_${Date.now()-Math.floor(Math.random() * 1000)}`;

    // LOGO_1762347984046 FROM-SERVICE
    console.log(uniqueName, 'FROM-SERVICE')
    const cloudRes = await cloudinary.uploader.upload(filePath, {folder: directoryPath, public_id: uniqueName});

    return cloudRes.secure_url;
}