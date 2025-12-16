import mongoose from 'mongoose';
import { clearProducts, createProduct, deleteProduct, getPublicProducts, getSecuredProductByIdOrSku, getSecuredProducts, updateProduct, updateRating, updateStock } from './product.service.js';

// READ CONTROLLERS---------------------------------|
// SECURED
export const secured_products = async (req, res, next) => {
    try {
        const {
            page = 1, limit = 10,
            search,
            categoryIds, vendorIds,
            priceRange, stockStatus,
            status,
            sortBy = 'createdAt', orderSequence = 'desc'
        } = req.query;

        if (req.user.role === "user") {
            throw {
                status: 401,
                message: "Unauthorized: You don't have permission to access"
            }
        }

        // Determine vendor filter
        const keyVal = (req.user.role === "vendor")
            ? { vendorId: req.user.id }
            : {} //ADMIN | PRODUCT MANAGER (STAFF)

        const options = {
            filter: {
                ...(keyVal?.vendorId ? {} : { vendorIds }),
                search,     //name, features, category.name, vendor.name,
                categoryIds,
                priceRange, stockStatus,
                status
            },

            baseUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,

            pagingReq: {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy, orderSequence
            }
        }
        const response = await getSecuredProducts(keyVal, options);

        return res.status(200).json(response);

    } catch (error) {

        next(error);
    }
}

export const secured_product = async (req, res, next) => {
    try {

        // Only vendors/admin/staff allowed
        if (req.user.role === "user") {
            throw {
                status: 401,
                message: "Unauthorized: You don't have permission to access"
            }
        }

        const { pId, sku } = req.params;

        // Determine if it's an ObjectId
        const isObjectId = pId && mongoose.Types.ObjectId.isValid(pId);

        if (!isObjectId && !sku) {
            throw {
                status: 400,
                message: `Invalid 'pid' or 'sku'`
            }
        }

        const keyVal = {
            ...(isObjectId
                ? { _id: pId }
                : { sku }),
            ...(req.user.role === "vendor"
                ? { vendorId: req.user.id }
                : {} //ADMIN | PRODUCT MANAGER (STAFF)
            )
        }

        const response = await getSecuredProductByIdOrSku(keyVal);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

// PUBLIC
export const public_products = async (req, res, next) => {
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

        const response = await getPublicProducts(options);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const public_product = async (req, res, next) => {
    try {

        const { pId, sku } = req.params;

        // Determine if it's an ObjectId
        const isObjectId = pId && mongoose.Types.ObjectId.isValid(pId);

        if (!isObjectId && !sku) {
            throw {
                status: 400,
                message: `Invalid 'pid' or 'sku'`
            }
        }

        const options = {
            filter: {
                ...(isObjectId ? { pId } : { sku }),
                status: 'approved'
            }
        }

        const response = await getPublicProducts(options);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const product_filters = async (req, res, next) => {
    try {
        const {
            search, categoryIds,
            priceRange,
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
                search, categoryIds,
                priceRange,
                rating, discount
            },
        }

        const response = await getPublicProducts(options)

        return res.status(200).json(response);

    } catch (error) {

        next(error);
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

        const response = await createProduct(reqData, filePayload);

        return res.status(201).json(response);

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
                message: "Unauthorized: You don't have pemission to update another vendor's product"
            }
        }

        const keyVal = {
            productId: req.params.pId,
            vendorId: req.user.role === 'vendor'
                ? req.user.id
                : vendorId
        };

        // Convert string[] properly if sent as JSON/string
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

        const isValidToUpdate = Object.values(reqData).some(val => {
            if (val === undefined || val === null) return false;
            if (typeof val === "string") return val.trim() !== "";
            if (Array.isArray(val)) return val.length > 0;

            return true;
        }) || filePayload.imageFiles.length > 0;

        if (!isValidToUpdate) {

            throw {
                status: 400,
                message: `Either images for upload, ${Object.keys(reqData).slice(0, -1).join(', ')}, or ` +
                    `${Object.keys(reqData).slice(-1)} field must be provided to update permissions!`
            }
        }

        const response = await updateProduct(keyVal, reqData, filePayload);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const rating_product = async (req, res, next) => {
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
                message: `'rating' field is required and must be between 1 to 5 `,
            });
        }

        const keyVal = {
            userId: req.user.id,
            productId: req.params.pId,
        }

        const response = await updateRating(keyVal, rating);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const stock_product = async (req, res, next) => {
    try {
        const stockChange = Number(req.body.stock);

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

        const { status, success, message, data } = await updateStock(keyVal, stockChange);

        return res.status(status).json({ message, data, success });

    } catch (error) {
        return res.status(error.status || 500).json({
            error: error.message || `Internal Server Error ${error}`,
            success: false,
        });
    }
}


// DELETE   || WHEN ADMIN WILL DO SOMETHING REQUIRED NOTIFCATION TO SEND THE VENDOR
export const delete_product = async (req, res, next) => {

    try {
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

        const response = await deleteProduct(keyVal);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const clear_products = async (req, res, next) => {

    try {

        if (vendorId && req.user.role === 'vendor' && req.user.id !== req.query.vendorId) {
            throw {
                status: 401,
                message: `Unauthorized: You can clear own products only`
            }
        }

        const keyVal = {
            vendorId: req.user.role === 'vendor' ? req.user.id : req.query.vendorId
        }

        const response = await clearProducts(keyVal);

        return res.status(200).json(response);

    } catch (error) {

        next(error);
    }
}