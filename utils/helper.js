import slugify from 'slugify';
import crypto from 'crypto';
import path from 'path';
import { ENV } from '../config/env.config.js';
import { User } from '../src/customer/user.model.js';
import { Product } from '../src/product/product.model.js';
import { DeleteLocalFile_H, ValidateFiles_H } from './fileHelper.js';
import { ToDeleteFromCloudStorage_H, ToSaveCloudStorage_H } from './cloudUpload.js';
import { Category } from '../src/category/category.model.js';
import mongoose from 'mongoose';

// COMMON ERROR HADLE HELPERS-------------------|
export const ErrorHandle_H = (error) => {

    // 1) CastError (Invalid ObjectId)
    if (error.name === 'CastError') {
        return {
            status: 400,
            message: `Invalid ID format for field '${error.path}'`,
        }
    }

    // 2) ValidationError (Mongoose validation failures) [enum, minlength/maxlength, required, regex, custom validators]
    if (error.name === 'ValidationError') {

        // Check nested CastErrors (e.g. slug: Promise)
        const castErr = Object.values(error.errors).find(er => er.name === 'CastError');

        if (castErr) {
            return {
                status: 400,
                message: `Invalid value for '${castErr.path}'`
            }
        }
        const errors = {};

        Object.keys(error.errors).forEach(key => {
            errors[key] = error.errors[key].message
        });

        return { status: 400, errors, message: 'Validation failed' };
    }

    // 3) Multer Error
    if (error.name === "MulterError") {
        return {
            status: 400,
            message: `Upload error: ${error.message}`
        }
    }
    // 4) Duplicate Key Error
    if (error.code === 11000 || error.errorResponse?.code === 11000) {
        let field = '';

        // Extract field name
        if (error.keyPattern) {
            field = Object.keys(error.keyPattern)[0];
        } else if (error.errorResponse?.keyPattern) {
            field = Object.keys(error.errorResponse.keyPattern)[0];
        }
        else {
            field = error.keyValue || 'field';
        }

        return { status: 409, message: `${field} already exists` };
    };

    // 4) MongoServerError (general write errors)
    if (error.name === 'MongoServerError') {
        return {
            status: 500,
            message: error.message || 'Database error occurred'
        };
    }

    // 5) Cloudinary error
    if (error?.message?.includes("Cloudinary")) {
        return {
            status: 500,
            message: "File upload failed - Cloud storage error",
            errors: error.message
        }
    }
    // 6) Custom Error
    if (error?.status) {
        return error;
    }

    // 7) Default or Unknow Fallback Error
    return {
        status: 500,
        message: error.message || 'Something went wrong',
        errors: error.errors || null
    };
}

export const FindCategoryFail_H = async (keyVal, select) => {
    const category = await Category.findOne(keyVal, select).select(select);

    if (!category) {
        throw {
            status: 404,
            message: `Category not found for ID: ${keyVal.categoryId || categoryId.slug}`
        }
    }
    return category;
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

// IDENTIFY HELPERS---------------------------------|
export const IdentifyModelByGoogleEmail_H = (email) => {

    const lower = email.toLowerCase();
    const prefix = lower.split('@')[0];

    if (prefix.endsWith('super')) return { role: 'super_admin', model: 'Admin', key: 'email' };
    if (prefix.endsWith('admin')) return { role: 'admin', model: 'Admin', key: 'email' };
    if (prefix.endsWith('vendor')) return { role: 'vendor', model: 'Vendor', key: 'businessEmail' };
    if (prefix.endsWith('support')) return { role: 'staff', model: 'Staff', key: 'staffEmail' };

    return { role: 'user', model: 'User', key: 'email' };
}

export const IdentifyModel_H = (logKey) => {

    const key = Object.keys(logKey)[0];
    const value = logKey[key];

    if (key.startsWith('business')) return { role: 'vendor', model: 'Vendor', logValue: value };
    if (key.startsWith('staff')) return { role: 'staff', model: 'Staff', logValue: value };

    if (key === 'email') {
        const prefix = value.split('@')[0];

        if (prefix.endsWith('super')) return { role: 'super_admin', model: 'Admin', logValue: value };
        if (prefix.endsWith('admin')) return { role: 'admin', model: 'Admin', logValue: value };

        return { role: 'user', model: 'User', logValue: value };
    }

    return { role: 'user', model: 'User', logValue: value };
}

export const IdentifyModelByRole_H = (role) => {

    switch (role) {
        case "admin" || 'super_admin':
            return { model: "Admin" };

        case "staff":
            return { model: "Staff" };

        case "vendor":
            return { model: "Vendor" };

        case "user":
        default:
            return { model: "User" };
    }
}

// GET RANGE(quarter, half, year, month) HELPER
export const GetStartAndEndDate_H = (selectedYear, range, page) => {
    let startMonth = 0;
    let endMonth = 11;

    if (range === 'quarter') {
        if (![1, 2, 3, 4].includes(page)) {
            return { status: 400, error: `page must be 1, 2, 3, or 4`, success: false };
        }
        startMonth = (page - 1) * 3;
        endMonth = startMonth + 2;
    }
    else if (range === 'half') {
        startMonth = 0;
        endMonth = 5;
    }
    else if (range === 'year') {
        startMonth = 0;
        endMonth = 11;
    }
    else if (range === 'month') {
        if (page < 1 || page > 12) {
            return { status: 400, error: 'Invalid page' }
        }

        startMonth = page - 1;
        endMonth = page - 1;
    }

    const startDate = new Date(selectedYear, startMonth, 1);
    const endDate = new Date(selectedYear, endMonth + 1, 0, 23, 59, 59)

    return { startDate, endDate, startMonth, endMonth };
}

// GENERATE AUTO UNIQUE HELPERS-----------------| 
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

export const GenerateSku_H = (categoryName, vendorId, productName) => {
    // CATGEORY + VENDOR + PRODUCT + UNIT = sku (mostly)

    const cat = categoryName.substring(0, 3).toUpperCase();
    const prod = productName.replace(/\s+/g, '').substring(0, 4).toUpperCase();
    const vend = vendorId.toString().slice(-4); // last 4 chars or digits

    const rand = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars

    return `${cat}-${prod}-${vend}-${rand}`;
}

export const GenerateEmail_H = (email, role) => {

    const lowerEmail = email.toLowerCase();
    const forbidden = ['super', 'admin', 'support', 'vendor'];

    if (forbidden.some(word => lowerEmail.includes(word))) {
        throw new Error(`Email cannot contain reserved keywords: super, admin, support, vendor`);
    }

    const splitedMail = email.split('@');
    return `${splitedMail[0]}.${role}@${splitedMail[1]}`;
}

export const GenerateUniqueFileName_H = (prefix = '', originalname = '') => {
    if (process.env.NODE_ENV !== 'development')
        return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`
    else {
        const ext = path.extname(originalname);
        return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}${ext}`;
    }
}

// UPLOAD HELPERS---------------------------------|
export const UploadImageWithRollBack_H = async (imageFile, folder = "eCommerce/images") => {
    let uploaded = null;

    try {
        if (imageFile) {
            await ValidateFiles_H([imageFile], ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/ico"], { maxSizeKB: 500 });

            if (ENV.IS_PROD) {
                const fileName = crypto.randomBytes(12).toString("hex");
                uploaded = await ToSaveCloudStorage_H(imageFile, folder, fileName);
            } else {
                uploaded = {
                    secure_url: imageFile.path,
                    public_id: null
                };
            }
        }

        return uploaded;
    }
    catch (error) {

        // Rollback uploaded cloud file
        if (ENV.IS_PROD && uploaded?.public_id) {
            await ToDeleteFromCloudStorage_H(uploaded.public_id);
        }

        // Rollback local file
        if (!ENV.IS_PROD && imageFile?.path) {
            DeleteLocalFile_H(imageFile.path);
        }

        throw error;
    }
}

export const UploadImagesWithRollBack_H = async (imageFiles, folder = "eCommerce/images") => {
    let uploaded = [];

    try {
        if (imageFiles?.length > 0) {
            await ValidateFiles_H(
                imageFiles,
                ["image/jpeg", "image/png", "image/webp", "image/jpg"],
                { maxSizeMB: 3 }
            );

            uploaded = await Promise.all(imageFiles.map(imgFile => {
                if (ENV.IS_PROD) {
                    return ToSaveCloudStorage_H(
                        imgFile,
                        folder,
                        crypto.randomBytes(12).toString("hex")
                    );
                } else {
                    return {
                        secure_url: imgFile.path,
                        public_id: null
                    }
                }
            }));
        }

        return uploaded;
    } catch (error) {

        // To Rollback
        if (uploaded?.length > 0) {
            await ToDeleteFilesParallel_H(uploaded);
        }

        throw error;
    }
}

export const UploadFilesWithRollBack_H = async (files, folder = "eCommerce/files") => {
    let uploadedFiles = null;

    try {
        if (files?.length > 0) {
            await ValidateFiles_H(
                files,
                [
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ], { maxSizeMB: 1 });

            if (ENV.IS_PROD) {
                uploadedFiles = await Promise.all(files.map(file => ToSaveCloudStorage_H(
                    file,
                    folder,
                    `DOC-${crypto.randomBytes(12).toString("hex")}`
                )));

            }

            if (!ENV.IS_PROD) {
                uploadedFiles = await Promise.all(files.map(file => ({ secure_url: file.path, public_id: null })));
            }
        }

        return uploadedFiles;
    }
    catch (error) {

        // Rollback uploaded cloud files
        if (uploadedFiles?.length > 0) {
            if (ENV.IS_PROD) {
                await Promise.all(uploadedFiles.map(uploadedFile => uploadedFile?.public_id ? ToDeleteFromCloudStorage_H(uploadedFile.public_id) : null));
            }

            // Rollback local file
            if (!ENV.IS_PROD) {
                await Promise.all(uploadedFiles.map(uploadedFile => DeleteLocalFile_H(uploadedFile.secure_url)));
            }
        }

        throw error;
    }
}

// Usefull when you want to delete selected documents/images
export const ToDeleteSelectedFiles_H = async (reqPaths, actualPaths) => {

    let finalDeletePath = [];
    if (ENV.IS_PROD) {

        for (const rPath of reqPaths) {

            // Push actual document identifiers for MongoDB pull
            const match = actualPaths.find(aPath => aPath?.public_id === rPath);

            if (!match) {
                throw {
                    status: 405,
                    message: `Incorrect path/paths for 'removeDocumentPaths' entered`
                }
            }

            await ToDeleteFromCloudStorage_H(rPath);

            finalDeletePath.push({ public_id: rPath });
        }
    } else {
        for (const rPath of reqPaths) {
            await DeleteLocalFile_H(rPath);

            const match = actualPaths.find(aPath => aPath?.secure_url === rPath)
            if (match)
                finalDeletePath.push({ secure_url: rPath });
            else {
                throw {
                    status: 405,
                    message: `Incorrect path/paths for 'removeDocumentPaths' entered`
                }
            }
        }
    }
    return finalDeletePath;
}

// WHEN TO DELETE COMPLETE RECORD WHERE HAVE FILES 
export const ToDeleteFilesParallel_H = async (actualPaths) => {
    if (!actualPaths || actualPaths.length === 0) return

    try {

        const paths = ENV.IS_PROD
            ? actualPaths
                .filter(aPath => aPath?.public_id)
                .map(aPath => aPath.public_id)
            : actualPaths
                .filter(aPath => aPath?.secure_url)
                .map(aPath => aPath.secure_url);

        if (paths.length > 0) {
            await Promise.all(paths.map(path => ToDeleteFromCloudStorage_H(path)));

            console.log(`Deleted ${paths.length} files successfully from cloud!`);
        }
    } catch (error) {
        throw error;
    }
}

// MONGO QUERY HELPERS-----------------------------|
const searchConfig = {

    vendor: (searchVal) => {
        return [
            { businessName: { $regex: searchVal, $options: 'i' } },
            { businessEmail: { $regex: searchVal, $options: 'i' } },
            { businessPhone: { $regex: searchVal, $options: 'i' } },
        ]
    },

    order: (searchVal) => {
        return [
            { shippingAddress: { $regex: searchVal, $options: 'i' } }
        ]
    },

    category: (searchVal) => [
        { name: { $regex: searchVal, $options: 'i' } },
        { slug: { $regex: searchVal, $options: 'i' } },
    ],

    product: (searchVal) => [
        { name: { $regex: searchVal, $options: 'i' } },
        { sku: { $regex: searchVal, $options: 'i' } },
        { 'category.name': { $regex: searchVal, $options: 'i' } },
        { 'vendor.name': { $regex: searchVal, $options: 'i' } },
        { description: { $regex: searchVal, $options: 'i' } }
    ],

    cart: (searchVal) => [
        { 'items.productId.name': { $regex: searchVal, $options: 'i' } },
        { 'items.productId.businessName': { $regex: searchVal, $options: 'i' } },
        { 'name': { $regex: searchVal, $options: 'i' } },
    ]
}

export const BuildQuery_H = (filter, moduleName) => {
    try {
        const query = {};

        if (filter.search && searchConfig) {
            query.$or = searchConfig[moduleName](filter.search);
        }


        if (filter.categoryIds) {
            let categoryList = [];

            categoryList = filter.categoryIds
                .replace(/^\[|\]|\{|\}$/g, '')
                .split(',')
                .map(w => w.trim())
                .filter(v => v.length > 0)
                .map(v => new mongoose.Types.ObjectId(v));

            query.categoryId = { $in: categoryList };
        }

        // Vendor/User case
        if (filter.userIds) {
            query.userId = {
                $in: filter.userIds
                    .replace(/^\[|\]|\{|\}$/g, '')
                    .split(',')
                    .map(w => w.trim()) ?? []
            };
        }

        if (filter.vendorIds) {
            let vendorIdList = [];
            vendorIdList = filter.vendorIds
                .replace(/^\[|\]|\{|\}$/g, '')
                .split(',')
                .map(w => w.trim())
                .filter(v => v.length > 0)
                .map(v => new mongoose.Types.ObjectId(v))

            query.vendorId = { $in: vendorIdList };
        }

        if (filter.joinRange) {

            const start = new Date(filter.joinRange[0])
            const end = new Date(filter.joinRange[1])

            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            query.createdAt = {
                $gte: start,
                $lte: end,
            }
        }

        if (filter.updatedRange) {
            const start = new Date(filter.joinRange[0])
            const end = new Date(filter.joinRange[1])

            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            query.updatedAt = {
                $gte: start,
                $lte: end,
            }
        }

        // Product case
        if (filter.priceRange) {    //100-500: (min-max)
            const [min, max] = filter.priceRange.split('-').map(Number);
            query.price = { $gte: min, $lte: max };
        }

        if (filter.rating !== undefined) {
            query['rating.average'] = { $gte: filter.rating };
        }

        if (filter.discount !== undefined) {
            query.discount = { $gte: filter.discount };
        }

        if (filter.status) query.status = filter.status;

        if (filter.stockStatus) {
            switch (filter.stockStatus) {
                case 'in_stock':
                    query.stock = { $gt: 0 };
                    break;
                case 'low_stock':
                    query.stock = { $gt: 0, $lt: 5 };
                    break;
                case 'out_of_stock':
                    query.stock = { $lte: 0 };
                    break;
            }
        }

        if (filter.stock && filter.stock.$gte !== undefined) {
            query.stock = { $gte: filter.stock.$gte }
        }

        if (filter.status) {
            query.status = filter.status;
        }
        if (filter.paymentStatus) {
            query.paymentStatus = filter.paymentStatus;
        }
        if (filter.paymentMethod) {
            query.paymentMethod = filter.paymentMethod;
        }

        return query;

    } catch (error) {
        throw new Error(`Error building ${moduleName} query: ${error.message}`);
    }
}

export const Pagination_H = (page, limit, offset, total, baseUrl, filter) => {
    const skip = offset ? parseInt(offset) : (page - 1) * limit;
    const nextOffset = skip + limit < total ? skip + limit : null;
    const prevOffset = skip - limit >= 0 ? skip - limit : null;
    const totalPages = Math.ceil(total / limit);

    const buildUrl = (offSetVal, track) => {
        if (offSetVal === null) return null;

        const query = new URLSearchParams({
            page: track,
            limit,
            ...filter,
        }).toString();

        return `${baseUrl}?${query}`;
    }

    return {
        skip,
        currentPage: page,
        totalPages,
        nextUrl: buildUrl(nextOffset, page + 1),
        prevUrl: buildUrl(prevOffset, page - 1),
    };
}

export const BuildPopulateStages_H = (populates = {}) => {
    const stages = [];

    for (const [key, config] of Object.entries(populates)) {
        const { path, select = '' } = config;

        const localField = path;
        const foreignField = '_id';

        const collectionName = config.model
            ? mongoose.model(config.model)
            : key.toLowerCase().endsWith("y")
                ? `${key.toLowerCase().replace('y', "ies")}`
                : `${key.toLowerCase()}s`;

        stages.push({
            $lookup: {
                from: collectionName,
                localField,
                foreignField,
                as: key
            }
        });

        stages.push({
            $unwind: {
                path: `$${key}`,
                preserveNullAndEmptyArrays: true
            }
        });

        if (select) {
            const projection = {};

            const fields = select.split(' ');
            fields.forEach(field => {
                projection[field] = `$${key}.${field}`;
            });

            stages.push({ $addFields: { [key]: projection } });
        }
    }

    return stages;
}