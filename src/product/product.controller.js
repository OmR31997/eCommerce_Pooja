import { ClearProducts, CreateProduct, DeleteProduct, GetPublicProductById, GetPublicProducts, GetSecuredProductByIdOrSku, GetSecuredProducts, ProductFilter, UpdateProduct, UpdateRating, UpdateStock, } from './product.service.js';
import { ErrorHandle_H } from '../../utils/helper.js';

// READ CONTROLLERS---------------------------------|
// SECURED
/*      *secured_products req/res handler*     */
export const secured_products = async (req, res) => {
    try {
        const {
            page = 1, limit = 10,
            search,
            categoryIds, vendorIds,
            priceRange, stockStatus,
            status,
            sortBy = 'createdAt', orderSequence = 'desc'
        } = req.query;

        const keyVal = {
            ...(["admin", "super_admin", "staff"].includes(req.user.role)
                ? { main: true }
                : req.user.role === "vendor"
                    ? { vendorId: req.user.id }
                    : { userId: req.user.id })
        }

        const options = {
            filter: {
                search,     //name, features, category.name, vendor.name,
                categoryIds, vendorIds,
                priceRange, stockStatus,
                status
            },

            baseUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,

            pagingReq: {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy, orderSequence
            },

            populates: {
                vendor: { path: 'vendorId', select: '_id businessName businessEmail businessPhone status' },
                category: { path: 'categoryId', select: '_id name slug status' },
            }
        }
        const { status: statusCode, success, message, count, pagination, data } = await GetSecuredProducts(keyVal, options);

        return res.status(statusCode).json({ success, message, count, pagination, data });

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
            ...(["admin", "super_admin", "staff"].includes(req.user.role)
                ? { main: true }
                : req.user.role === "vendor"
                    ? { vendorId: req.user.id }
                    : { userId: req.user.id })
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
        const keyVal = {
            sku: req.params.sku,
            ...(["admin", "super_admin", "staff"].includes(req.user.role)
                ? { main: true }
                : req.user.role === "vendor"
                    ? { vendorId: req.user.id }
                    : { userId: req.user.id })
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

        const { status: statusCode, success, message, count, pagination, data } = await GetPublicProducts(options);

        return res.status(statusCode).json({ message, success, message, count, pagination, data });

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

// CREATE
export const create_product = async (req, res, next) => {
    try {

        const vendorId = req.query.vendorId;
        const {
            categoryId,
            name, features, description,
            price, stock
        } = req.body;


        const files = req.files || [];

        if (vendorId && req.user.role === 'vendor' && req.user.id.toString() !== vendorId.toString()) {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to create product for another vendor`,
                success: false
            }
        }

        const filePayload = {
            imageFiles: files
        }

        const reqData = {
            vendorId: req.user.role === "vendor" ? req.user.id : vendorId,
            categoryId, name,
            features: features
                ? features.split(',').map(w => w.trim())
                : null, //Split each one into an array
            description, price,
            status: ['admin', 'super_admin', 'product_manager'].includes(req.user.role)
                ? 'approved'
                : 'pending',
            stock,
            notifiedLowStock: Number(stock) <= (Number(process.env.MIN_STOCK_THRESHOLD) || 5)
        }

        const { status, success, message, data } = await CreateProduct(reqData, filePayload);

        return res.status(status).json({
            message, data, success
        });

    } catch (error) {
        next(error);
    }
}

// UPDATE
export const update_product = async (req, res, next) => {
    try {
        const {

            name, features, description,
            price, discount, categoryId,
            removeToImages
        } = req.body;

        const vendorId = req.query.vendorId;

        if (vendorId && req.user.role === "vendor" && req.user.id !== vendorId) {
            throw {
                status: 405,
                message: "Method Not Allowed"
            }
        }

        const keyVal = {
            productId: req.params.pId,
            vendorId: req.user.role === 'vendor'
                ? req.user.id
                : vendorId
        };

        let removeImagePaths = [];
        if (typeof removeToImages === "string") {
            removeImagePaths = JSON.parse((removeToImages));
        }
        else if (Array.isArray(removeToImages)) {
            removeImagePaths = removeToImages;
        }
        else if (removeToImages) {
            removeImagePaths = [removeToImages];
        }

        const reqData = {
            name, features, description,
            price, discount, categoryId,
            removeImagePaths
        }

        const filePayload = {
            imageFiles: req.files || []
        }

        const hasField = Object.entries(reqData).some(([key, val]) => {
            if (val === undefined || val === null) return false;
            if (typeof val === "string") return val.trim() !== "";
            if (Array.isArray(val)) return val.length > 0;

            return true;
        }) || (filePayload.imageFiles.length > 0)

        if (!hasField) {

            throw {
                status: 400,
                message: "Please provide at least one field"
            }
        }

        const { status, success, message, data } = await UpdateProduct(keyVal, reqData, filePayload);

        if (!success) {
            return res.status(status).json({ errors, error, message, })
        }

        return res.status(status).json({ message, data, success });

    } catch (error) {
        next(error);
    }
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

