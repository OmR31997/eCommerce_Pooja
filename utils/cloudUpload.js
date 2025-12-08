import cloudinary from '../config/cloudStotrage.config.js';
import fs from 'fs';
import crypto from 'crypto';
import { ENV } from '../config/env.config.js';

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
    if (!public_id) return;

    try {
        const response = await cloudinary.uploader.destroy(public_id);
        if(response.result !== "ok" && response.result !== "not found") {

            // Cloud return "not found" if file already missing
            throw new Error(`Failed to delete file with public_id: ${public_id}`);
        }
        return response;
    } catch (error) {
        console.error(`Cloudinary delete error: ${error.message}`);
        throw error;    //propagate the error to handle rollback properly
    }
}

// PARALLEL
// export const ToUploadParallel_H = async (files, folder, prefix) => {

//     if (ENV.IS_PROD) {
//         return Promise.all(files.map(file => ToSaveCloudStorage_H(
//             file,
//             folder,
//             `${prefix}-${crypto.randomBytes(12).toString('hex')}`
//         )))
//     }

//     if (!ENV.IS_PROD) {
//         return files.map(file => ({ secure_url: file.path, public_id: null }));
//     }

// }

// export const ToDeleteFilesParallel_H = async (files) => {
//     if (!files || !Array.isArray(files)) return;

//     if (ENV.IS_DEV)
//         return await ToDeleteLocalFilesParallel(files);

//     return Promise.all(files.map(file => file?.public_id ? ToDeleteFromCloudStorage(file.public_id) : null));
// }