import { GetVendorById, GetVendors, RemoveAllVendors, RemoveVendor, UpdateVendor } from "./vendor.service.js";
import { VerifyOtp_H } from "../../utils/otp.js";

// READ------------------------------------|
export const get_me = async (req, res, next) => {

    try {
        const keyVal = {
            _id: req.user.id
        }

        const response = await GetVendorById(keyVal);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const get_vendor_by_id = async (req, res, next) => {

    try {
        const keyVal = {
            _id: req.params.id
        };

        const response = await GetVendorById(keyVal);

        return res.status(200).json(response);

    } catch (error) {

        next(error);
    }
}

export const get_vendors = async (req, res, next) => {

    try {

        const {
            page = 1, limit = 10,
            sortBy = '-createdAt', orderSequence = '-1'
        } = req.query;

        if (req.user.role === 'vendor') {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to access vendors`,
            }
        }

        const options = {
            baseUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,

            pagingReq: {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy, orderSequence
            }
        }

        const response = await GetVendors(options);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const vendor_filters = async (req, res, next) => {
    try {
        const {
            search, status,
            joinRange, updatedRange, address,

            page = 1, limit = 10,
            sortBy = 'createdAt', orderSequence = 'desc'

        } = req.query;

        if (req.user.role === 'vendor') {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to access vendors`,
            }
        }

        const options = {
            baseUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,

            pagingReq: {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy, orderSequence
            },

            filter: {
                search, //businessName = '', businessEmail = '', businessPhone = ''
                joinRange, updatedRange, address,
                status
            }
        }

        const response = await GetVendors(options);

        return res.status(200).json(response);

    } catch (error) {

        next(error);
    }
}

// UPDATE----------------------------------|
export const update_vendor_profile = async (req, res, next) => {
    try {

        const keyVal = {
            _id: req.params.id
        }

        const {
            businessName, businessEmail, businessPhone,
            businessDescription, onTimeDelivery,
            accountNumber, ifsc, bankName,
            gstNumber, address, type,
            removeDocumentPaths,
        } = req.body;

        const filePayload = {
            logoFile: req.files.logoUrl?.[0] || null,
            documents: req.files.documents || []
        }

        // Convert string[] properly if sent as JSON/string
        let removeDocPaths = [];
        if (typeof removeDocumentPaths === "string") {
            removeDocPaths = JSON.parse(removeDocumentPaths);
        }
        else if (Array.isArray(removeDocumentPaths)) {
            removeDocPaths = removeDocumentPaths
        }
        else if (removeToImages) {
            removeDocPaths = [removeDocumentPaths];
        }

        const reqData = {
            businessName, businessEmail, businessPhone,
            businessDescription,
            bankDetails: {
                accountNumber,
                ifsc,
                bankName
            },
            gstNumber, address, type,
            removeDocPaths,
            onTimeDelivery,
        }

        if (!accountNumber && !ifsc && !bankName) {
            delete reqData.bankDetails;
        }

        const isValidToUpdate = Object.values(reqData).some(val => val !== undefined);

        if (!isValidToUpdate) {

            throw {
                status: 400,
                message: `Either ${Object.keys(reqData).slice(0, -1).join(', ')}, ` +
                    `accountNumber, ifsc, bankName, or ` +
                    `${Object.keys(reqData).slice(-1)} fields must be provided to update vendor!`
            }
        }

        const response = await UpdateVendor(keyVal, reqData, filePayload);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const confirm_otp = async (req, res, next) => {
    try {
        const { otp, businessPhone, businessEmail } = req.body;

        const keyVal = {
            _id: req.user.id,
            ...(businessEmail
                ? { businessEmail }
                : { businessPhone }
            )
        }

        const errors = [];

        if (!otp) {
            errors.push(`'otp' field must be required!`)
        }

        if (!businessEmail && !businessPhone) {
            errors.push(`Either 'businessEmail' or 'businessPhone' must be required!`);
        }

        if (errors.length > 0) {
            throw {
                status: 400,
                message: "Validation failed",
                errors
            }
        }

        const verification = VerifyOtp_H(businessEmail, otp);

        if (!verification.valid) {
            throw {
                status: 400,
                message: verification.reason
            }
        }

        const reqData = {
            isVerified: true
        }

        const response = await UpdateVendor(keyVal, reqData);

        return res.status(200).json(response);
        
    } catch (error) {
        next(error);
    }
}

// DELETE----------------------------------|
export const remove_vendor = async (req, res, next) => {
    try {

        const keyVal = {
            _id: req.params.id
        }

        const response = await RemoveVendor(keyVal);

        return res.status(200).json(response);

    } catch (error) {

        next(error);
    }
}

export const clear_vendors = async (req, res, next) => {
    try {

        if (req.user.role !== 'super_admin') {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to clear`
            }
        }

        const response = await RemoveAllVendors();

        return res.status(200).json(response);

    } catch (error) {

        next(error);
    }
}

// -----------------------------------------------------------------------------------------------------|
/*
// READ CONTROLLERS FOR PRODUCTS REGARDING VENDOR----| 
export const get_products_by_vendor = async (req, res) => {
    try {
        const {
            page = 1, limit = 10,
            search, categoryIds,
            priceRange, stockStatus,
            status,
            sortBy = 'createdAt', orderSequence = 'desc'
        } = req.query;

        const pagingReq = {
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy, orderSequence
        }

        const populate = {
            vendor: { path: 'vendorId', select: '-_id businessName status' },
            category: { path: 'categoryId', select: '-_id slug description status' }
        }
        const vendorId = req.user.role === 'vendor' ? req.user.id : req.query.vendorId;

        const options = {
            filter: {
                search,
                vendorIds: vendorId,
                categoryIds,
                priceRange, stockStatus,
                discount, status,
            }
        }

        const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;

        const { status: statusCode, success, message, data, pagination } =
            await GetSecuredAllProducts(baseUrl, pagingReq, populate, options);

        return res.status(statusCode).json({ message, pagination, success, data });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

export const get_product_by_pId = async (req, res) => {
    try {
        const productId = req.params.pId;

        const vendorId = req.user.role === 'vendor' ? req.user.id : req.query.vendorId;

        const filter = {
            productId,
            vendorId
        }

        const { status: statusCode, message, data, success } =
            await GetSecuredProductByIdOrSku(filter);

        return res.status(statusCode).json({ message, data, success })

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

export const get_product_by_sku = async (req, res) => {
    try {
        const sku = req.params.sku;
        const vendorId = req.user.role === 'vendor' ? req.user.id : req.query.vendorId;

        const filter = {
            sku,
            vendorId
        }

        const { status, success, message, data } = await GetSecuredProductByIdOrSku(filter);

        return res.status(status).json({ message, data, success });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

// -----------------------------------------------------------------------------------------------------|
// ORDER
export const get_orders_by_vendor = async (req, res) => {
    try {
        const {
            page = 1, limit = 10, offset,
            search, userIds,
            paymentMethod, paymentStatus, status,
            sortBy = 'createdAt', orderSequence = 'desc'
        } = req.query;

        const options = {
            vendorId: req.user.role === 'vendor' ? req.user.id : req.query.vendorId,

            pagingReq: {
                page: parseInt(page),
                limit: parseInt(limit),
                offset,
                sortBy, orderSequence
            },

            baseUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,

            filter: {
                userIds,
                search,
                paymentMethod, paymentStatus, status
            },

            populates: {
                user: { path: 'userId', select: 'name status totalSpents' },
                product: { path: 'items.productId', select: 'name status' },
            }
        }

        const { status: statusCode, message, data, success } = await GetOrders(options);

        return res.status(statusCode).json({ message, data, success });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

export const get_order_by_vendor_via_orderId = async (req, res) => {
    try {
        const options = {
            populates: {
                vendor: { path: 'vendorId', select: 'businessName businessEmail status' },
                user: { path: 'userId', select: 'name status totalSpents' },
                product: { path: 'items.productId', select: 'name status' },
            },

            vendorId: req.user.role === 'vendor' ? req.user.id : req.query.vendorId,
            orderId: req.params.orderId
        }

        const { status, message, data, success } = await GetOrderById(options);

        return res.status(status).json({ message, data, success });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

*/