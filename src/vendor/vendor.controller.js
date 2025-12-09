import { User } from '../customer/user.model.js';
import { Vendor } from '../vendor/vendor.model.js';
import { DeleteLocalFile_H } from '../../utils/fileHelper.js';
import { GetVendor, GetVendors, RemoveAllVendors, RemoveVendor, UpdateVendor } from './vendor.service.js';
// import { GetSecuredAllProducts, GetSecuredProductByIdOrSku } from '../product/product.service.js';
import { GetOrderById, GetOrders } from '../order/order.service.js';
import { ErrorHandle_H } from '../../utils/helper.js';

// READ CONTROLLERS--------------------------------|
/*      *get_me req/res handler*     */
export const get_me = async (req, res) => {
    try {

        const { status, success, message, data } = await GetVendor(req.user.id);

        return res.status(status).json({ message, data, success });

    } catch (error) {

        return res.status(error.status || 500).json({
            success: false,
            error: error.message || `Internal Server Error ${error}`
        });
    }
}

/*      *get_vendor_byId req/res handler*     */
export const get_vendor_byId = async (req, res) => {
    try {
        const vendorId = req.params.id;

        const { status, success, message, data } = await GetVendor(vendorId);

        return res.status(status).json({ message, data, success });

    } catch (error) {

        return res.status(error.status || 500).json({
            success: false,
            error: error.message || `Internal Server Error ${error}`
        });
    }
}

/*      *get_vendors req/res handler*     */
export const get_vendors = async (req, res) => {
    try {

        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            orderSequence = 'desc'
        } = req.query;

        if (req.user.role === 'vendor') {
            throw {
                status: 400,
                message: `Unauthorized: You don't have permission to access`,
                success: false
            }
        }

        const options = {
            baseUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,

            pagingReq: {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy, orderSequence
            },
        }

        const { status, success, message, count, pagination, data } = await GetVendors(options);

        return res.status(status).json({ message, count, pagination, success, data })

    } catch (error) {

        return res.status(error.status || 500).json({ 
            success: false, 
            error: error.message || `Internal Server Error ${error}` });
    }
}

/*      * vendor_filters handler *      */
export const vendor_filters = async (req, res) => {
    try {
        const {
            search, status,
            joinRange, updatedRange, address,
            page = 1, limit = 10,
            sortBy = 'createdAt', orderSequence = 'desc'
        } = req.query;

        if (req.user.role === 'vendor') {
            throw {
                status: 400,
                message: `Unauthorized: You haven't accessibility`,
                success: false
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

        if (req.user.role === 'vendor') {
            throw {
                status: 401,
                message: `Unauthorized: You haven't accessibility`,
                success: false
            }
        }

        const { status: statusCode, success, message, count, pagination, data } = await GetVendors(options);

        return res.status(statusCode).json({ success, message, count, pagination, data });

    } catch (error) {

        return res.status(error.status || 500).json({
            message: error.message || `Internal Server Error: ${error}`
        })
    }
};

// UPDATE CONTROLLERS--------------------------------|
/*      * update_vendor_profile handler *      */
export const update_vendor_profile = async (req, res) => {
    try {

        // IN SELF VENDOR CASE PARAMS && USER VALIDATION ALREADY APPLIED INSIDE THE MIDDLEWARE

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
        if (typeof removeDocumentPaths === 'string') {
            try {
                removeDocPaths = JSON.parse(removeDocumentPaths);
            } catch (error) {
                removeDocPaths = [removeDocumentPaths];
            }
        }
        else if (Array.isArray(removeDocumentPaths)) removeDocPaths = removeDocumentPaths;

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

        if (Object.keys(reqData).length === 0 &&
            !filePayload.logoFile &&
            filePayload.documents.length === 0) {
            throw {
                status: 400,
                message: 'At least one field must be required',
            }
        }

        const { status, success, data, message } = await UpdateVendor(keyVal, reqData, filePayload);

        return res.status(status).json({ message, data, success });

    } catch (error) {

        try {
            ErrorHandle_H(error);
        } catch (handled) {
            return res.status(handled.status || 500).json({
                success: false,
                message: handled.message,
                errors: handled.errors || null
            });
        }
    }
};

// DELETE CONTROLLERS--------------------------------|
/*      * remove_vendor_profile handler *      */
export const remove_vendor_profile = async (req, res) => {
    try {
        // IN SELF VENDOR CASE PARAMS && USER VALIDATION ALREADY APPLIED INSIDE THE MIDDLEWARE

        const keyVal = {
            _id: req.params.id
        }

        const { status, success, message, data } = await RemoveVendor(keyVal);

        return res.status(status).json({ message, data, success });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

/*      * clear_vendors handler *      */
export const clear_vendors = async (req, res) => {
    try {

        if (req.user.role !== 'super_admin') {
            throw {
                status: 405,
                message: `Method Not Allowed`
            }
        }

        const { status, success, message, data } = await RemoveAllVendors();

        return res.status(status).json({ message, success, data })
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

// -----------------------------------------------------------------------------------------------------|
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

/*      * confirm_otp handler *      */
export const confirm_otp = async (req, res) => {
    try {
        const { otp, businessName, businessEmail, ...rest } = req.body;
        const file = req.file;
        const { id, role } = req.user;

        if (rest?.id && rest.id !== id) {
            return res.status(403).json({
                error: 'ID mismatch — unauthorized action',
                success: false,
            });
        }

        const errors = [];

        if (!otp) {
            errors.push(`'otp' field must be required`);
        }

        if (!businessEmail) {
            errors.push(`'businessEmail' field must be required`);
        }

        if (errors.length > 0) {
            return res.status(400).json({
                errors,
                message: 'Validation failed',
                success: false,
            })
        }

        const verification = verifyOtp(businessEmail, otp);

        if (!verification.valid) {
            return res.status(400).json({
                error: verification.reason,
                success: false,
            });
        }

        const vendorData = {
            ...req.body,
            userId: id,
        };

        if (file) {

            if (!ValidateImageFileType(file.mimetype)) {
                DeleteLocalFile_H(file.path);
                return res.status(400).json({
                    error: 'Invalid file type. Only images allowed.',
                    success: false,
                });
            }

            if (!ValidateFileSize(file.size, 1)) {
                DeleteLocalFile_H(file.path);
                return res.status(400).json({
                    error: 'File size exceeds 2MB limit',
                    success: false,
                });
            }

            if (process.env.NODE_ENV !== 'development') {
                const { secure_url } = await ToSaveCloudStorage(file.path, 'eCommerce/${vendorId}/LogoUrls', filename);
                vendorData.logoUrl = secure_url;
            }
            else {
                vendorData.logoUrl = file.path;
            }
        }

        const responseVendor = await Vendor.create(vendorData);

        const responseUser = await User.findByIdAndUpdate(id, { $set: { role: 'vendor' } }, { new: true });;

        return res.status(201).json({
            responseVendor,
            responseUser
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}
