import cloudinary from '../config/cloudStotrage.config.js';
import fs from 'fs';
import crypto from 'crypto';
import { ENV } from '../config/env.config.js';
import { ToDeleteLocalFilesParallel } from './fileHelper.js';

export const ToSaveCloudStorage_H = async (file, folder, uniqueName) => {
    if (!file) throw new Error('File is missing');

    const options = {
        folder,
        public_id: uniqueName,
        resource_type: 'auto',
    }

    // Prod -> memoryStorage -> upload.stream

    if (file.buffer) {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(options, (error, res) => {
                if (error) {
                    return reject(new Error(`Cloudinary upload failed: ${error.message}`));
                }

                resolve({ secure_url: res.secure_url, public_id: res.public_id });
            });

            stream.end(file.buffer);
        });
    }

    // DEV -> diskStorage -> upload via path
    if (file.path) {
        const res = await cloudinary.uploader.upload(file.path, options);

        // Delete local file after upload
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

        return { secure_url: res.secure_url, public_id: res.public_id };
    }

    throw new Error('Invalid file object (missing buffer and path)');
};

export const ToDeleteFromCloudStorage_H = async (public_id) => {
    if (public_id) return;

    try {
        return await cloudinary.uploader.destroy(public_id);
    } catch (error) {
        console.error(`Cloudinary delete error: ${error.message}`);
    }
}

export const ToSaveCloudStorage = async (file, directoryPath, uniqueName) => {
    if (!file) throw new Error('File is missing');

    const options = {
        folder: directoryPath,
        public_id: uniqueName,
        resource_type: 'auto',
    }

    // Prod -> memoryStorage -> upload.stream

    if (file.buffer) {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(options, (error, res) => {
                if (error) {
                    return reject(new Error(`Cloudinary upload failed: ${error.message}`));
                }

                resolve({ secure_url: res.secure_url, public_id: res.public_id });
            });

            stream.end(file.buffer);
        });
    }

    // DEV -> diskStorage -> upload via path
    if (file.path) {
        const res = await cloudinary.uploader.upload(file.path, options);

        // Delete local file after upload
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

        return { secure_url: res.secure_url, public_id: res.public_id };
    }

    throw new Error('Invalid file object (missing buffer and path)');
};

export const ToDeleteFromCloudStorage = async (public_id) => {
    if (public_id) return;

    try {
        return await cloudinary.uploader.destroy(public_id);
    } catch (error) {
        console.error(`Cloudinary delete error: ${error.message}`);
    }
}

export const ToUploadParallel = async (files, directory, prefix) => {

    if (ENV.IS_DEV) 
        return files.map(file => ({ secure_url: file.path }));

    return Promise.all(files.map(file => ToSaveCloudStorage(
        file, 
        directory, 
        `${prefix}-${crypto.randomBytes(12).toString('hex')}`
    )))
}

export const ToDeleteFilesParallel = async (files) => {
    if (!files || !Array.isArray(files)) return;

    if (ENV.IS_DEV)
        return await ToDeleteLocalFilesParallel(files);

    return Promise.all(files.map(file => file?.public_id ? ToDeleteFromCloudStorage(file.public_id) : null));
}