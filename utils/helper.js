import { ENV } from '../config/env.config.js';
import { User } from '../src/customer/user.model.js';
import { Product } from '../src/product/product.model.js';
import crypto from 'crypto';
import { DeleteLocalFile_H, ValidateFiles_H } from './fileHelper.js';
import { ToDeleteFromCloudStorage_H, ToSaveCloudStorage_H } from './cloudUpload.js';

export const ErrorHandle_H = (error) => {

    if (error.name === 'CastError') {
        throw {
            status: 400,
            message: `Invalid ID format for field '${error.path}'`,
        }
    }

    if (error.name === 'ValidationError') {
        const errors = {};
        Object.keys(error.errors).forEach(key => {
            errors[key] = error.errors[key].message
        });

        throw { status: 400, errors, message: 'Validation failed' };
    }

    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        throw { status: 409, message: `${field} already exists` };
    }
}

export const FindProductFail_H = async (keyVal, select) => {

    const product = await Product.findOne(keyVal).select(select);

    if (!product) {
        const formatSet = Object.entries(keyVal)
            .map(([key, val]) => `${key}: ${val}`)
            .join(' :: ');

        throw {
            status: 404,
            message: `Product not found for keyVal: '${formatSet}'`
        };
    }

    return product;
}

export const FindUserFail_H = async (keyVal, select) => {

    const user = await User.findOne(keyVal).select(select);

    if (!user) {
        throw {
            status: 404,
            message: `User account not found for ID: '${keyVal.userId}'`
        };
    }

    return user;
}

export const IdentifyModelByGoogleEmail_H = (email) => {

    const lower = email.toLowerCase();
    const prefix = lower.split('@')[0];

    if (prefix.endsWith('super')) return { role: 'super_admin', model: 'Admin', key: 'email' };
    if (prefix.endsWith('admin')) return { role: 'admin', model: 'Admin', key: 'email' };
    if (prefix.endsWith('vendor')) return { role: 'vendor', model: 'Vendor', key: 'businessEmail' };
    if (prefix.endsWith('support')) return { role: 'staff', model: 'Staff', key: 'staffEmail' };

    return { role: 'user', model: 'User', key: 'email' };
};

export const GenerateSlug_H = async (name) => {
    if (!name) {
        throw new Error(`'name' field must be required`);
    }

    let baseSlug = slugify(name, { lower: true, strict: true, trim: true });

    let slug = baseSlug;
    let counter = 1;

    while (await Category.countDocuments({ slug })) {
        slug = `${baseSlug}-${counter++}`;
    }

    return slug;
}

export const UploadImageWithRollBack_H = async (imageFile, folder = "eCommerce/images") => {
    let uploaded = null;

    try {
        if(imageFile) {
            ValidateFiles_H([imageFile], ["image/jpeg", "image/png", "image/webp", "image/jpg"], {maxSizeKB: 500});
        }

        if(ENV.IS_PROD) {
            const fileName = crypto.randomBytes(12).toString("hex");
            uploaded = await ToSaveCloudStorage_H(imageFile, folder, fileName);
        } else {
            uploaded = {
                secure_url: imageFile.path,
                public_id: null
            };
        }

        return uploaded;
    }
    catch (error) {

        // Rollback uploaded cloud file
        if(ENV.IS_PROD && uploaded?.public_id) {
            await ToDeleteFromCloudStorage_H(uploaded.public_id);
        }

        // Rollback local file
        if(!ENV.IS_PROD && imageFile?.path) {
            DeleteLocalFile_H(imageFile.path);
        }

        throw error;
    }
}