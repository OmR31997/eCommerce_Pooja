import fs from 'fs/promises';
import path from 'path';
import slugify from 'slugify';
import { Category } from '../models/category.model.js';
import crypto from 'crypto';
import { ENV } from '../config/env.config.js';
import mongoose from 'mongoose';

export const ErrorHandle = (error) => {

    if (error.name === 'CastError') {
        return {
            status: 400,
            success: false,
            error: `Invalid ID format for field '${error.path}'`,
        }
    }

    if (error.name === 'ValidationError') {
        const errors = {};
        Object.keys(error.errors).forEach(key => {
            errors[key] = error.errors[key].message
        });

        return { status: 400, success: false, errors };
    }

    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return { status: 409, success: false, error: `${field} already exists` };
    }
}

export const ValidateFiles = async (files, allowedTypes, maxSizeMB = 1) => {
    const maxBytes = 1024 * 1024 * maxSizeMB;

    // if (!files || files.length === 0) return true;

    const sessionPaths = [];

    try {
        for (const file of files) {

            // Track for cleanup (DEV only)
            if (file.path) sessionPaths.push(file.path);

            // Validate mime type
            if (!allowedTypes.includes(file.mimetype)) {
                throw {
                    status: 415,
                    message: `Invalid file type for '${file.originalname}'`,
                    success: false
                }
            }

            // Validate size
            if (file.size > maxBytes) {
                throw {
                    status: 413,
                    message: `File size exceeds limit for '${file.originalname}'`,
                    success: false
                };
            }
        }

        return true;

    } catch (error) {
        if (ENV.IS_DEV) {
            await Promise.all(sessionPaths.map(path => DeleteLocalFile(path)));
        }

        throw error;
    }
}

export const DeleteLocalFile = async (filePath) => {
    try {
        await fs.access(filePath);
        await fs.unlink(filePath);
    } catch (error) {
        if (error.code === "ENOENT") {
            // File doesn't exist → ignore safely
            return;
        }
        throw new Error(`Error deleting file: ${error.message}`);
    }
}

export const ToDeleteLocalFilesParallel = async (files) => {
    if (!files || !Array.isArray(files)) return;

    return Promise.all(files.map(file => file?.secure_url ? DeleteLocalFile(file.secure_url) : null))
}

export const GenerateEmail = (email, role) => {

    const lowerEmail = email.toLowerCase();
    const forbidden = ['super', 'admin', 'support', 'vendor'];

    if (forbidden.some(word => lowerEmail.includes(word))) {
        throw new Error(`Email cannot contain reserved keywords: super, admin, support, vendor`);
    }

    const splitedMail = email.split('@');
    return `${splitedMail[0]}.${role}@${splitedMail[1]}`;
}

export const IdentifyModel = (logKey) => {

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
};

export const IdentifyModelByGoogleEmail = (email) => {

    const lower = email.toLowerCase();
    const prefix = lower.split('@')[0];

    if (prefix.endsWith('super')) return { role: 'super_admin', model: 'Admin', key: 'email' };
    if (prefix.endsWith('admin')) return { role: 'admin', model: 'Admin', key: 'email' };
    if (prefix.endsWith('vendor')) return { role: 'vendor', model: 'Vendor', key: 'businessEmail' };
    if (prefix.endsWith('support')) return { role: 'staff', model: 'Staff', key: 'staffEmail' };

    return { role: 'user', model: 'User', key: 'email' };
};

export const GetModelByRole = (role) => {

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
};

export const GenerateSlug = async (name) => {
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

export const GenerateSku = (categoryName, vendorId, productName, stock) => {
    // CATGEORY + VENDOR + PRODUCT + UNIT = sku (mostly)

    const cat = categoryName.substring(0, 3).toUpperCase();
    const prod = productName.replace(/\s+/g, '').substring(0, 4).toUpperCase();
    const vend = vendorId.toString().slice(-4); // last 4 chars or digits

    const rand = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars

    return `${cat}-${prod}-${vend}-${rand}`;
}

export const GenerateUniqueFileName = (prefix = '', originalname = '') => {
    if (process.env.NODE_ENV !== 'development')
        return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`
    else {
        const ext = path.extname(originalname);
        return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}${ext}`;
    }
}

export const Pagination = (page, limit, offset, total, baseUrl, filter) => {
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

export const ValidateLogo = async (file) => {
    return ValidateFiles([file], ["image/jpeg", "image/png", "image/webp"]);
};

export const ValidateDocs = async (docs, maxSizeMB = 3) => {
    return ValidateFiles(
        docs,
        [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ],
        maxSizeMB
    );
}

export const ValidateImages = async (images, maxSizeMB = 2) => {
    return ValidateFiles(images, ["image/jpeg", "image/png", "image/webp"], maxSizeMB)
}

const search = {
    order: (textVal) => {
        return [
            { shippingAddress: { $regex: textVal, $options: 'i' } }
        ]
    }
}

export const BuildQuery = (filter, moduleName) => {
    try {
        const query = {};

        if (filter.search) {
            query.$or = search.order(filter.search);
        }

        if (filter.userIds) {
            query.userId = {
                $in: filter.userIds
                    .replace(/^\[|\]|\{|\}$/g, '')
                    .split(',')
                    .map(w => w.trim()) ?? []
            };
        }

        if (filter.vendorIds) {
            query.userId = {
                $in: filter.vendorIds
                    .replace(/^\[|\]|\{|\}$/g, '')
                    .split(',')
                    .map(w => w.trim()) ?? []
            };
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

export const BuildProductQuery = (filter) => {
    try {
        const query = {};

        // To search via text
        if (filter.search) {
            query.$or = [
                { name: { $regex: filter.search, $options: "i" } },
                { description: { $regex: filter.search, $options: "i" } },
            ];
        }

        // Category filtering
        if (filter.categoryIds) {
            query.categoryId = {
                $in: Array.isArray(filter.categoryIds)
                    ? filter.categoryIds
                    : typeof filter.categoryIds === 'object'
                        ? Object.values(filter.categoryIds)
                        : typeof filter.categoryIds === 'string'
                            ? filter.categoryIds.split(',').map(w => w.trim()).filter(Boolean)
                            : []
            };
        }

        // Vendor filter
        if (filter.vendorIds) {
            query.vendorId = {
                $in: Array.isArray(filter.vendorIds)
                    ? filter.vendorIds
                    : typeof filter.vendorIds === 'object'
                        ? Object.values(filter.vendorIds)
                        : typeof filter.vendorIds === 'string'
                            ? filter.vendorIds.split(',').map(w => w.trim()).filter(Boolean)
                            : []
            };;
        }

        // Price range (min-max) //example:  100-500
        if (filter.priceRange) {
            const [min, max] = filter.priceRange.split('-').map(Number);
            query.price = { $gte: min, $lte: max };
        }

        if (filter.rating !== undefined) {
            query['rating.average'] = { $gte: filter.rating };
        }

        if (filter.discount !== undefined) {
            query.discount = { $gte: filter.discount };
        }

        // Status filter
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

        //  STOCK >= filter.stock.$gte
        if (filter.stock && filter.stock.$gte !== undefined) {
            query.stock = { $gte: filter.stock.$gte }
        }

        return query;
    } catch (error) {
        throw new Error(`Error building product query: ${error.message}`);
    }
}

export const BuildVendorQuery = (filter) => {
    try {

        const query = {};

        if (filter.search) {
            query.$or = [
                { businessName: { $regex: filter.search, $options: "i" } },
                { description: { $regex: filter.search, $options: "i" } },
                { businessEmail: { $regex: filter.search, $options: "i" } },
            ];
        }

        if (filter.address) {
            query.address = filter.address;
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
            query.updatedAt = {
                $gte: new Date(filter.updatedRange[0]),
                $lte: new Date(filter.updatedRange[1]),
            }
        }

        return query;
    } catch (error) {
        throw new Error(`Error building product query: ${error.message}`);
    }
}

export const BuildUserQuery = (filter) => {
    try {

        const query = {};

        if (filter.search) {
            query.$or = [
                { name: { $regex: filter.search, $options: "i" } },
                { description: { $regex: filter.search, $options: "i" } },
                { email: { $regex: filter.search, $options: "i" } },
                { phone: { $regex: filter.search, $options: "i" } },
                { address: { $regex: filter.search, $options: "i" } },
            ];
        }

        if (filter.segment) {
            query.segment = filter.segment;
        }

        if (filter.joinRange) {
            query.createdAt = {
                $gte: new Date(filter.joinRange[0]),
                $lte: new Date(filter.joinRange[1]),
            }
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
            query.updatedRange = {
                $gte: new Date(filter.updatedRange[0]),
                $lte: new Date(filter.updatedRange[1]),
            }
        }

        return query;
    } catch (error) {
        throw new Error(`Error building product query: ${error.message}`);
    }
}

export const getStartAndEndDate = (selectedYear, range, page) => {
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

export const BuildPopulateStages = (populates = {}) => {
    const stages = [];

    for (const [key, config] of Object.entries(populates)) {
        const { path, select = '' } = config;

        const localField = path;
        const foreignField = '_id';

        const collectionName = config.model ? mongoose.model(config.model) : key.toLowerCase() + 's';

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

            stages.push({ $addFields: {[key]:projection} });
        }
    }

    return stages;
}