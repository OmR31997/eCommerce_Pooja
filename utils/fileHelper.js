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

        console.log({ message: `Errorr in '${serviceMethod}'`, errors });
        return { status: 400, success: false, errors, message: 'Validation failed', };
    }

    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return { status: 409, success: false, message: `${field} already exists` };
    }

    console.log(`Errorr in '${serviceMethod}'`, error.message);
}

export const identifyRoleFromEmail = (email) => {
    const lower = email.toLowerCase();

    // --- Admin & Super Admin ---
    if (lower === "super_admin@support.com") {
        return { role: "super_admin", collection: "Admin" };
    }

    if (lower === "admin@support.com") {
        return { role: "admin", collection: "Admin" };
    }

    // --- Staff ---
    if (lower.includes("_staff@")) {
        return { role: "staff", collection: "Staff" };
    }

    // --- Vendor ---
    if (lower.includes("_vendor@")) {
        return { role: "vendor", collection: "Vendor" };
    }

    // --- Default USER ---
    return { role: "user", collection: "User" };
};


// Free Mail Case
export const getModelByRole = (role) => {
    switch (role) {
        case "super_admin":
        case "admin":
            return { role, collection: "Admin" };

        case "staff":
            return { role, collection: "Staff" };

        case "vendor":
            return { role, collection: "Vendor" };

        case "user":
        default:
            return { role: "user", collection: "User" };
    }
};

export const GenerateSlug = async (name) => {
    if (!name) {
        throw new Error(`'name' field must be required`);
    }

    let baseSlug = slugify(name, { lower: true, strict: true, trim: true });

    let slug = baseSlug;
    let counter = 1;

    while (await Category.countDocuments({ slug: baseSlug })) {
        slug = `${baseSlug}-${counter++}`;
    }

    return baseSlug;
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