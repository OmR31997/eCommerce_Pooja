import { Vendor } from '../models/vendor.model.js';
import { Category } from '../models/category.model.js';
import { Product } from '../models/product.model.js';
import { BuildProductQuery, DeleteLocalFile, ErrorHandle, Pagination, ValidateFileSize, ValidateImageFileType } from '../utils/fileHelper.js';
import { ClearProducts, CreateProduct, DeleteProduct, UpdateProduct } from '../services/product.service.js';

/* **create_product logic here** */
export const create_product = async (req, res) => {
    const { name, categoryId, description, price, stock, vendorId } = req.body;
    const files = req.files || [];

    const productData = {
        name: name || undefined,
        description: description || undefined,
        price: parseFloat(price) || undefined,
        stock: parseInt(stock) || undefined,
        sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    }

    const { status, error, errors, success, message, data } = await CreateProduct(productData, { vendorId, categoryId, files: files || [], user: req.user });

    if (!success) {
        return res.status(status).json({ errors, error, message, })
    }

    return res.status(status).json({ message, data, success });
}

/* **view_products logic here** */
export const view_products = async (req, res) => {
    try {
        const {
            page = 1, limit = 10, offset,
            status = 'approved',
            sortBy = 'createdAt', orderSequence = 'desc' } = req.query;

        const parsedLimit = parseInt(limit);

        // Build Query
        const filter = {};

        // Handle Status
        if (status) filter.status = status;

        // Count total records
        const total = await Product.countDocuments(filter);

        const { skip, nextUrl, prevUrl, totalPages, currentPage } = Pagination(
            parseInt(page),
            parsedLimit,
            offset,
            total,
            status,
            `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`, filter);

        const sortField = ['name', 'price', 'createdAt'].includes(sortBy) ? sortBy : 'createdAt';
        const sortDirection = orderSequence === 'asc' ? 1 : -1;
        const sortOption = { [sortField]: sortDirection };

        const products = await Product.find(filter)
            .populate({ path: 'vendorId' })
            .populate({ path: 'categoryId' })
            .skip(skip)
            .limit(parsedLimit)
            .sort(sortOption)

        if (products.length === 0) {
            return res.status(404).json({
                error: 'Product not found',
                success: false,
            });
        }

        return res.status(200).json({
            message: 'Products fetched successfully.',
            pagination: {
                count: total,
                prevUrl,
                nextUrl,
                currentPage,
                totalPages,
                success: true,
            },
            data: products,
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

/* **view_single_product logic here** */
export const view_product_byId = async (req, res) => {
    try {
        const key = req.params.id;

        const filter = key.startsWith('SKU-') ? { sku: key } : { _id: key };
        filter.status = 'approved';

        const product = await Product.findOne(filter)
            .populate({ path: 'vendorId', select: 'shopName -_id' })
            .populate('categoryId', 'name slug -_id')
            .select('-vendorId -categoryId');

        if (!product) {
            return res.status(404).json({
                error: 'Product not found',
                success: false,
            });
        }

        return res.status(200).json({
            data: product,
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

/* **view_vendor_products logic here** */
export const view_vendor_products = async (req, res) => {
    try {
        const vendorId = req.user.id;

        const products = await Product.find({ vendorId })
            .populate({ path: 'vendorId', select: 'shopName' })
            .populate('categoryId', 'name slug -_id')
            .select('-vendorId -categoryId');;

        if (products.length === 0) {
            return res.status(400).json({
                error: 'Product not found',
                success: false,
            });
        }

        return res.status(200).json({
            data: products,
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

/* **view_vendor_product logic here** */
export const view_vendor_product = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const productId = req.params.id;

        const products = await Product.find({ _id: productId, vendorId })
            .populate({ path: 'vendorId', select: 'shopName' })
            .populate('categoryId', 'name slug -_id')
            .select('-vendorId -categoryId');

        if (products.length === 0) {
            return res.status(400).json({
                error: 'Product not found',
                success: false,
            });
        }

        return res.status(200).json({
            data: products,
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

/* **update_product logic here** */
export const update_product = async (req, res) => {
    const key = req.params.id;
    const {
        name, description, price, discount, stock,
    } = req.body;

    const files = req.files;

    if (!name && !description && !price && !discount && !stock && !files && files.length === 0) {
        return res.status(400).json({
            error: 'Please provide atleast one field',
            success: false,
        });
    }

    const productData = {
        name: name || undefined,
        description: description || undefined,
        price: parseFloat(price) || undefined,
        discount: parseFloat(discount) || undefined,
        stock: parseInt(stock) || undefined,
    }

    const { status, error, errors, success, message, data } = await UpdateProduct(productData, { key, files: files || [], user: req.user });

    if (!success) {
        return res.status(status).json({ errors, error, message, })
    }

    return res.status(status).json({ message, data, success });
}

/* **delete_product logic here** */
export const delete_product = async (req, res) => {
    const key = req.params.id;

    const { status, error, errors, success, message, data } = await DeleteProduct(key);

    if (!success) {
        return res.status(status).json({ errors, error, message, })
    }

    return res.status(status).json({ message, data, success });
}

/* **delete_product logic here** */
export const clear_product = async (req, res) => {

    const { status, error, errors, success, message, data } = await ClearProducts(req.user);

    if (!success) {
        return res.status(status).json({ errors, error, message, })
    }

    return res.status(status).json({ message, data, success });
}


/* **rate_product logic here** */
export const rate_product = async (req, res) => {
    try {
        const { rating } = req.body;
        const productId = req.params.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                error: `'rating' field is required and must be between 1 to 5 `,
                success: false,
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(400).json({
                error: 'Product not found',
                success: false,
            });
        }

        const total = product.rating.totalReview;
        const avg = product.rating.average;

        const newTotal = total + 1;
        const newAvg = ((avg * total) + rating) / newTotal;

        product.rating.average = parseFloat(newAvg.toFixed(1));
        product.rating.totalReview = newTotal;

        const ratingResponse = await product.save();

        return res.status(200).json({
            message: 'Product rated successfully',
            data: ratingResponse,
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

/* **product_filters logic here** */
export const product_filters = async (req, res) => {
    try {
        const {
            search, category,
            stockStatus, priceRange,
            vendor, rating,
            discount, status,
            page = 1, limit = 2, offset,
            sortBy = 'createdAt', orderSequence = 'desc'
        } = req.query;

        // Build Filters 
        const filters = {
            search: search || '',
            category: category || '',
            stockStatus: stockStatus || '',
            priceRange: priceRange ? priceRange.split(',').map(Number) : undefined,
            vendorId: vendor || '',
            rating: rating ? Number(rating) : undefined,
            discount: discount ? Number(discount) : undefined,
            status: status || 'approved',
        };

        const parsedLimit = parseInt(limit);

        // Build Mongo query
        const query = BuildProductQuery(filters);

        // Count Total Docs
        const total = await Product.countDocuments(query);

        const { skip, nextUrl, prevUrl, totalPages, currentPage } = Pagination(
            parseInt(page),
            parsedLimit,
            offset,
            total,
            `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,
            filters,
        );

        // Sorting
        const sortField = ['name', 'price', 'createdAt'].includes(sortBy) ? sortBy : 'createdAt';
        const sortDirection = orderSequence === 'asc' ? 1 : -1;
        const sortOption = { [sortField]: sortDirection };

        const products = await Product.find(query)
            .skip(skip)
            .limit(limit)
            .sort(sortOption)
            .populate({ path: 'vendorId', select: 'name businessName' })
            .populate({ path: 'categoryId', select: 'name slug' });

        return res.status(200).json({
            message: 'Products fetched successfully',
            data: products,
            pagination: {
                count: total,
                prevUrl,
                nextUrl,
                currentPage,
                totalPages,
            },
            success: true,
        });

    } catch (error) {
        console.error('Error in product_filters:', error);
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
};
