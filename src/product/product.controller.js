import { Product } from './product.model.js';
import { BuildProductQuery, Pagination } from '../../utils/fileHelper.js';
import { ClearProducts, DeleteProduct, GetPublicProductById, GetPublicProducts, GetSecuredProducts, ProductFilter, UpdateProduct, UpdateRating, UpdateStock, } from './product.service.js';
import { ErrorHandle_H } from '../../utils/helper.js';

// READ
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

        const keyVal = req.user.role === 'user'
            ? { userId: req.user.id }
            : req.user.role === 'vendor'
                ? { vendorId: req.user.id }
                : { Authority: 'AdminStatff' }

        const options = {
            filter: {
                search,
                categoryIds, vendorIds,
                priceRange, stockStatus, discount,
                status
            },

            baseUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,

            pagingReq: {
                page: parseInt(page),
                limit: parseInt(limit),
                offset,
                sortBy, orderSequence
            },

            populates: {
                vendor: { path: 'vendorId', select: 'businessName, businessEmail' },
                category: { path: 'categoryId', select: 'status name slug description' },
            }
        }
        const { status: statusCode, success, message, pagination, data } = await GetSecuredProducts(keyVal, options);

        return res.status(statusCode).json({ message, pagination, data, success });

    } catch (error) {

        return res.status(error.status || 500).json({
            success: false,
            error: error.message || `Internal Server Error ${error}`
        });
    }
}

export const secured_product_by_productId = async (req, res) => {
    try {

        const keyVal = {
            productId: req.params.pId,
            vendorId: req.user.role === 'vendor' ? req.user.id : {},
        }

        const { status, success, message, data } = await GetSecuredProductByIdOrSku(keyVal);

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

        if (req.user.role === 'vendor') {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to access this module`,
                success: false
            }
        }

        const keyVal = {
            sku: req.params.sku,
            vendorId: req.user.role === 'vendor' ? req.user.id : {},
        }
        const { status, success, message, data } = await GetSecuredProducts(keyVal);

        return res.status(status).json({ message, data, success });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

// CREATE
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
        const handle = ErrorHandle_H(error);

        if (handle?.status)
            return res.status(handle.status).json({ error: handle.error, errors: handle.errors, success: false });

        return res.status(500).json({ error: error.message })
    }
}

// UPDATE
export const update_product = async (req, res) => {
    const {
        name, description, features, price, discount,
    } = req.body;

    const keyVal = {
        productId: req.params.pId,
        vendorId: req.user.role === 'vendor' ? req.user.id : req.query.vendorId
    };

    const files = req.files;

    if (!name && !description && !price && !discount && !stock && !files && files.length === 0) {
        return res.status(400).json({
            error: 'Please provide atleast one field',
            success: false,
        });
    }

    const productData = {
        name, description,
        price, discount,
        features,
        images: files
    }

    const { status, error, errors, success, message, data } = await UpdateProduct(keyVal, productData);

    if (!success) {
        return res.status(status).json({ errors, error, message, })
    }

    return res.status(status).json({ message, data, success });
}

export const rating_product = async (req, res) => {
    try {
        const rating = parseInt(req.body.rating);

        if (req.user.role !== 'user') {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to give rating`
            }
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                error: `'rating' field is required and must be between 1 to 5 `,
                success: false,
            });
        }

        const keyVal = {
            userId: req.user.id,
            productId: req.params.pId,
        }

        const { status, success, message, data } = await UpdateRating(keyVal, rating);

        return res.status(status).json({ message, data, success });

    } catch (error) {
        return res.status(error.status || 500).json({
            error: error.message || `Internal Server Error ${error}`,
            success: false,
        });
    }
}

export const stock_product = async (req, res) => {
    try {
        const stockChange = parseInt(req.body.stock);

        const vendorId = req.query.vendorId;

        if (vendorId && req.user.role == 'vendor' && req.user.id !== vendorId) {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to update stock for another vendor`
            }
        }

        if (stockChange < 0) {
            throw {
                status: 400,
                message: "Stock cannot be negative"
            }
        }

        const keyVal = {
            vendorId: req.user.role === 'user' ? req.user.id : vendorId,
            productId: req.params.id,
        }

        const { status, success, message, data } = await UpdateStock(keyVal, stockChange);

        return res.status(status).json({ message, data, success });

    } catch (error) {
        return res.status(error.status || 500).json({
            error: error.message || `Internal Server Error ${error}`,
            success: false,
        });
    }
}


// DELETE   || WHEN ADMIN WILL DO SOMETHING REQUIRED NOTIFCATION TO SEND THE VENDOR
export const delete_product = async (req, res) => {

    const vendorId = req.query.vendorId;

    if (vendorId && req.user.role === 'vendor' && req.user.id !== vendorId) {
        throw {
            status: 401,
            message: `Unauthorized: You don't have permission to delete product which belongs to another vendor`
        }
    }

    const keyVal = {
        productId: req.params.pId,
        vendorId: req.user.role === 'vendor' ? req.user.id : vendorId
    };

    const { status, error, errors, success, message, data } = await DeleteProduct(keyVal);

    if (!success) {
        return res.status(status).json({ errors, error, message, })
    }

    return res.status(status).json({ message, data, success });
}

export const clear_products = async (req, res) => {

    try {

        if (vendorId && req.user.role === 'vendor' && req.user.id !== req.query.vendorId) {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to delete product which belongs to another vendor`
            }
        }

        const vendorId = req.user.role === 'vendor' ? req.user.id : req.query.vendorId

        const { status, success, message, data } = await ClearProducts(vendorId);

        return res.status(status).json({ message, data, success });

    } catch (error) {

        return res.status(error.status || 500).json({
            success: false,
            error: error.message || `Internal Server Error ${error}`
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
        } = req.query;

        const options = {
            baseUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,

            pagingReq: {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy, orderSequence,
            }
        }

        const { status: statusCode, success, message, pagination, data } = await GetPublicProducts(options);

        return res.status(statusCode).json({ message, success, message, pagination, data });

    } catch (error) {

        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

export const public_product_byId = async (req, res) => {
    try {

        const productId = req.params.pId;

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
            rating, discount,
            page = 1, limit = 10, offset,
            sortBy = 'createdAt', orderSequence = 'desc'
        } = req.query;

        const options = {
            baseUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,

            pagingReq: {
                page: parseInt(page),
                limit: parseInt(limit),
                offset,
                sortBy, orderSequence
            },

            filter: {
                search, category,
                stockStatus, priceRange,
                rating, discount,
                status: 'approved',
            },
        }

        const { status, success, message, data, pagination, count } = await ProductFilter(options)

        return res.status(status).json({
            success,
            message,
            count,
            pagination,
            data
        });

    } catch (error) {

        return res.status(error.status || 500).json({
            error: error.message || `Internal Server Error ${error}`,
            success: false,
        });
    }
}
