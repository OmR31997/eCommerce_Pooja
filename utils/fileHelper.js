import fs from 'fs';
import path from 'path';
import slugify from 'slugify';
import { Category } from '../models/category.model.js';

export const ErrorHandle = async (error, serviceMethod) => {
    if (error.name === 'CastError') {

        console.log(`Errorr in '${serviceMethod}'`, error.message);

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

        console.log({ message: `Error in '${serviceMethod}'`, errors });
        return { status: 400, success: false, errors, message: 'Validation failed', };
    }

    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return { status: 409, success: false, message: `${field} already exists` };
    }

    console.log(`Errorr in '${serviceMethod}'`, error.message);

    return { status: 500, success: false, message: 'Internal Server Error' }
}

export const GenerateEmail = (email, role) => {
    
    const lowerEmail = email.toLowerCase();
    const forbidden = ['super', 'admin', 'support', 'vendor'];

    if(forbidden.some(word => lowerEmail.includes(word))) {
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

    if (prefix.endsWith('super')) return { role: 'super_admin', model: 'Admin', key:'email'};
    if (prefix.endsWith('admin')) return { role: 'admin', model: 'Admin', key: 'email' };
    if (prefix.endsWith('vendor')) return { role: 'vendor', model: 'Vendor', key: 'businessEmail' };
    if (prefix.endsWith('support')) return { role: 'staff', model: 'Staff', key: 'staffEmail' };

    return { role: 'user', model: 'User', key: 'email' };
};

// Free Mail Case
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

export const BuildProductQuery = (filters) => {
    try {

        const query = {};

        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: "i" } },
                { description: { $regex: filters.search, $options: "i" } },
            ];
        }

        if (filters.category) {
            query.categoryId = filters.category;
        }

        if (filters.vendor) {
            query.vendorId = filters.vendor;
        }

        if (filters.priceRange && Array.isArray(filters.priceRange) && filters.priceRange.length === 2) {
            const [min, max] = filters.priceRange;
            query.price = { $gte: min, $lte: max };
        }

        if (filters.stockStatus) {
            switch (filters.stockStatus) {
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

        if (filters.rating !== undefined) {
            query['rating.average'] = { $gte: filters.rating };
        }

        if (filters.discount !== undefined) {
            query.discount = { $gte: filters.discount };
        }

        if (filters.status) {
            query.status = filters.status;
        }

        return query;
    } catch (error) {
        throw new Error(`Error building product query: ${error.message}`);
    }
}

export const BuildVendorQuery = (filters) => {
    try {

        const query = {};

        if (filters.search) {
            query.$or = [
                { businessName: { $regex: filters.search, $options: "i" } },
                { description: { $regex: filters.search, $options: "i" } },
                { businessEmail: { $regex: filters.search, $options: "i" } },
            ];
        }

        if (filters.address) {
            query.address = filters.address;
        }

        if (filters.joinRange) {
            const start = new Date(filters.joinRange[0])
            const end = new Date(filters.joinRange[1])

            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            query.createdAt = {
                $gte: start,
                $lte: end,
            }
        }

        if (filters.updatedRange) {
            query.updatedAt = {
                $gte: new Date(filters.updatedRange[0]),
                $lte: new Date(filters.updatedRange[1]),
            }
        }

        return query;
    } catch (error) {
        throw new Error(`Error building product query: ${error.message}`);
    }
}

export const BuildUserQuery = (filters) => {
    try {

        const query = {};

        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: "i" } },
                { description: { $regex: filters.search, $options: "i" } },
                { email: { $regex: filters.search, $options: "i" } },
                { phone: { $regex: filters.search, $options: "i" } },
                { address: { $regex: filters.search, $options: "i" } },
            ];
        }

        if (filters.segment) {
            query.segment = filters.segment;
        }

        if (filters.joinRange) {
            query.createdAt = {
                $gte: new Date(filters.joinRange[0]),
                $lte: new Date(filters.joinRange[1]),
            }
        }

        if (filters.joinRange) {

            const start = new Date(filters.joinRange[0])
            const end = new Date(filters.joinRange[1])

            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            query.createdAt = {
                $gte: start,
                $lte: end,
            }
        }

        if (filters.updatedRange) {
            query.updatedRange = {
                $gte: new Date(filters.updatedRange[0]),
                $lte: new Date(filters.updatedRange[1]),
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