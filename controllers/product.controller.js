import { Product } from '../models/product.model.js';
import { BuildProductQuery, ErrorHandle, Pagination } from '../utils/fileHelper.js';
import { ClearProducts, CreateProduct, DeleteProduct, GetPublicProductById, GetPublicProducts, GetSecuredAllProducts, GetSecuredProductByIdOrSku, UpdateProduct } from '../services/product.service.js';

export const create_product = async (req, res) => {
    try {
        const {
            vendorId, categoryId,
            name, features, description,
            price, stock
        } = req.body;

        const files = req.files || [];

        const filePayload = {
            images: files
        }

        if (vendorId && req.user.role === 'vendor' && req.user.id.toString() !== vendorId.toString()) {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to create product for another vendor`,
                success: false
            }
        }

        if (!categoryId) {
            throw {
                status: 400,
                message: `'categoryId' field must be required`,
                success: false
            }
        }

        const productData = {
            vendorId: ['admin', 'super_admin', 'product_manager'].includes(req.user.role)
                ? vendorId
                : req.user.id,
            categoryId: categoryId || undefined,
            name: name || undefined,
            features: features
                ? Array.isArray(features)
                    ? features
                    : features.split(',').map(w => w.trim())
                : (typeof features === 'object')
                    ? Object.values(features)
                    : undefined,
            description: description || undefined,
            price: price || undefined,
            status: ['admin', 'super_admin', 'product_manager'].includes(req.user.role)
                ? 'approved'
                : 'pending',
            stock: stock || 0,
            notifiedLowStock: parseInt(stock) <= parseInt(process.env.MIN_STOCK_THRESHOLD) || 5
        }

        const { status, success, message, data } = await CreateProduct(productData, filePayload);

        return res.status(status).json({
            message, data, success
        });

    } catch (error) {
        const handle = ErrorHandle(error);

        if (handle?.status)
            return res.status(handle.status).json({ error: handle.error, errors: handle.errors, success: false });

        return res.status(500).json({ error: error.message })
    }
}

export const secured_products = async (req, res) => {
    try {
        const {
            page = 1, limit = 10, offset,
            search,
            categoryIds, vendorIds,
            priceRange, stockStatus,
            discount, status,
            sortBy = 'createdAt', orderSequence = 'desc'
        } = req.query;

        if (req.user.role === 'vendor') {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to access this module`,
                success: false
            }
        }

        const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;

        const pagingReq = {
            page: parseInt(page),
            limit: parseInt(limit),
            offset,
            sortBy, orderSequence
        }

        const options = {
            filter: {
                search,
                categoryIds, vendorIds,
                priceRange, stockStatus, discount,
                status
            }
        }

        const populate = {
            category: {path: 'categoryId', select: 'status name slug description'}
        }
        const { status: statusCode, success, message, pagination, data } = await GetSecuredAllProducts(baseUrl, pagingReq, populate, options);

        return res.status(statusCode).json({ message, pagination, data, success });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

export const secured_product_by_pId = async (req, res) => {
    try {
        const productId = req.params.pId;

        if (req.user.role === 'vendor') {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to access this module`,
                success: false
            }
        }

        const { status, success, message, data } = await GetSecuredProductByIdOrSku({ _id: productId });

        return res.status(status).json({ message, data, success });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

export const secured_product_by_sku = async (req, res) => {
    try {
        const sku = req.params.sku;

        if (req.user.role === 'vendor') {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to access this module`,
                success: false
            }
        }

        const { status, success, message, data } = await GetSecuredProductByIdOrSku({ sku });

        return res.status(status).json({ message, data, success });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

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
        notifiedLowStock: parseInt(stock) <= parseInt(process.env.MIN_STOCK_THRESHOLD) || 5
    }

    const { status, error, errors, success, message, data } = await UpdateProduct(productData, { key, files: files || [], user: req.user });

    if (!success) {
        return res.status(status).json({ errors, error, message, })
    }

    return res.status(status).json({ message, data, success });
}

export const delete_product = async (req, res) => {
    const key = req.params.id;

    const { status, error, errors, success, message, data } = await DeleteProduct(key);

    if (!success) {
        return res.status(status).json({ errors, error, message, })
    }

    return res.status(status).json({ message, data, success });
}

export const clear_product = async (req, res) => {

    const { status, error, errors, success, message, data } = await ClearProducts(req.user);

    if (!success) {
        return res.status(status).json({ errors, error, message, })
    }

    return res.status(status).json({ message, data, success });
}

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

// --------------------------------------------------------------------------------------------------|
// PUBLIC
export const public_products = async (req, res) => {
    try {

        const {
            page = 1, limit = 10,
            sortBy = 'createdAt', orderSequence = 'desc',
            search, categoryIds, priceRange, storeName
        } = req.query;

        const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;

        const pagingReq = {
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy, orderSequence
        }

        const options = {
            filter: {
                search, priceRange, storeName,
                categoryIds,
                status: 'approved',
                'vendorId.status': 'approved',
                'categoryId.status': 'active',
                stock: { $gte: 1 }
            }
        }

        const { status, success, message, pagination, data } = await GetPublicProducts(baseUrl, pagingReq, options);

        return res.status(status).json({ message, success, message, pagination, data });

    } catch (error) {

        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

export const public_product_byId = async (req, res) => {
    try {

        const productId = req.params.id

        const populate = {
            vendor: { path: 'vendorId', select: 'name status' },
            category: { path: 'categoryId', select: 'name status' }
        };

        const options = {
            filter:
            {
                status: 'approved',
                vendorStatus: 'approved',
                categoryStatus: 'active',
                stock: { $gte: 1 }
            }
        }

        const { status: statusCode, success, message, data } = await GetPublicProductById(
            productId,
            populate,
            options
        );

        return res.status(statusCode).json({ message, data, success });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

export const product_filters = async (req, res) => {
    try {
        const {
            search, category,
            stockStatus, priceRange,
            vendor, rating,
            discount,
            page = 1, limit = 10, offset,
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
            status: 'approved',
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
}
