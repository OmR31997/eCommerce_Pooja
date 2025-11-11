import fs from 'fs';
import path from 'path';
import slugify from 'slugify';
import { Category } from '../models/category.model.js';
import { Product } from '../models/product.model.js';

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

export const Pagination = (page, limit, offset, total, status, baseUrl) => {
    const skip = offset || (page - 1) * limit;
    const nextOffset = skip + limit < total ? skip + limit : null;
    const prevOffset = skip - limit >= 0 ? skip - limit : null;
    const totalPages = Math.ceil(total / limit);

    const buildUrl = (offSetVal, track) => {
        if (offSetVal === null) return null;

        const query = new URLSearchParams({
            page: track,
            limit,
            offset: offSetVal,
            status,
        }).toString();

        return `${baseUrl}?${query}`;
    }

    return {
        skip,
        currentPage: page,
        totalPages,
        nextUrl: buildUrl(nextOffset, page + 2),
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