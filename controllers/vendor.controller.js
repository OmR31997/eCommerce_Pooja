import { User } from '../models/user.model.js';
import { Vendor } from '../models/vendor.model.js';
import { DeleteLocalFile, ErrorHandle, } from '../utils/fileHelper.js';
import { GetAllVendors, GetVendor, RemoveAllVendors, RemoveVendor, UpdateVendor } from '../services/vendor.service.js';
import { GetSecuredAllProducts, GetSecuredProductByIdOrSku } from '../services/product.service.js';
import { GetOrderById, GetOrders } from '../services/order.service.js';

// --------------------------------------CRUD OPERATION FOR VENDOR---------------------------------------|
/*      * get_me handler *      */
export const get_me = async (req, res) => {
    try {
        const { status, success, message, data } = await GetVendor(req.user.id);

        return res.status(status).json({ message, data, success });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

/*      * get_vendor_byId handler *      */
export const get_vendor_byId = async (req, res) => {
    try {
        const vendorId = req.params.id;

        const { status, success, message, data } = await GetVendor(vendorId);

        return res.status(status).json({ message, data, success });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

/*      * get_vendors handler *      */
export const get_vendors = async (req, res) => {
    try {
        if (req.user.role === 'vendor') {
            throw {
                status: 400,
                message: `Unauthorized: You haven't accessibility`,
                success: false
            }
        }

        const {
            page = 1,
            limit = 10,
            offset,
            sortBy = 'createdAt',
            orderSequence = 'desc' } = req.query;

        const { status, success, message, pagination, data } = await GetAllVendors(
            `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,
            { page: parseInt(page), limit: parseInt(limit), offset, sortBy, orderSequence },
            {}
        );

        return res.status(status).json({ message, pagination, success, data })
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

/*      * vendor_filters handler *      */
export const vendor_filters = async (req, res) => {
    try {
        const {
            search = '', status = '',
            businessName = '', businessEmail = '', businessPhone = '',
            joinRange = '', updatedRange = '', address = '',
            page = 1, limit = 10, offset,
            sortBy = 'createdAt', orderSequence = 'desc'
        } = req.query;

        if (req.user.role === 'vendor') {
            throw {
                status: 400,
                message: `Unauthorized: You haven't accessibility`,
                success: false
            }
        }

        const { status: StatusCode, success, message, pagination, data } = await GetAllVendors(
            `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,
            { page: parseInt(page), limit: parseInt(limit), offset, sortBy, orderSequence },
            {
                search, status, businessName, businessEmail, businessPhone, address,
                joinRange: joinRange ? joinRange.split(',').map(i => i.trim()) : undefined,
                updatedRange: updatedRange ? updatedRange.split(',').map(i => i.trim()) : undefined,
            }
        )

        return res.status(StatusCode).json({ message, pagination, data, success });

    } catch (error) {
        console.error('Error in vendor_filters:', error);
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
};

/*      * update_vendor_profile handler *      */
export const update_vendor_profile = async (req, res) => {
    try {
        const vendorId = req.params.id;

        const {
            businessName, businessEmail, businessPhone,
            businessDescription, gstNumber, type,
            address, accountNumber, ifsc, bankName,
            onTimeDelivery,
            removeDocuments
        } = req.body;

        const files = req.files || {};

        // Convert string[] properly if sent as JSON/string
        let removeDocs = [];
        if (typeof removeDocuments === 'string') {
            try {
                removeDocs = JSON.parse(removeDocuments);
            } catch (error) {
                removeDocs = [removeDocuments];
            }
        }
        else if (Array.isArray(removeDocuments)) removeDocs = removeDocuments;

        const vendorData = {
            businessName: businessName || undefined,
            businessEmail: businessEmail || undefined,
            businessPhone: businessPhone || undefined,
            businessDescription: businessDescription || undefined,
            gstNumber: gstNumber || undefined,
            type: type || undefined,
            accountNumber: accountNumber || undefined,
            ifsc: ifsc || undefined, bankName: bankName || undefined,
            address: address || undefined,
            onTimeDelivery: onTimeDelivery === 'true' ? true : onTimeDelivery === 'false' ? false : undefined,
            bankDetails: {
                accountNumber: accountNumber || undefined,
                ifsc: ifsc || undefined,
                bankName: bankName || undefined
            }
        }

        const filePayload = {
            logoUrl: files.logoUrl?.[0],
            documents: files.documents,
            removeDocuments: removeDocs
        }

        const hasBankDetails = Object.values(vendorData.bankDetails)
            .some(value => value !== undefined);

        const hasFields = Object.keys(vendorData)
            .filter(key => key !== 'bankDetails')
            .some(key => vendorData[key] !== undefined);

        const hasFiles = files && Object.keys(files).length > 0;

        if (!hasFields && !hasBankDetails && !hasFiles && removeDocs.length === 0) {
            throw {
                status: 400,
                message: 'At least one field must be required',
                success: false
            }
        }

        const { status, success, data, message } = await UpdateVendor(
            vendorData,
            filePayload,
            vendorId
        );

        return res.status(status).json({ message, data, success });

    } catch (error) {

        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return { status: 409, success: false, error: `${field} already exists` };
        }

        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
};

/*      * remove_vendor_profile handler *      */
export const remove_vendor_profile = async (req, res) => {
    try {
        const vendorId = req.params.id;

        const { status, success, message, data } = await RemoveVendor(vendorId);

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
// PRODUCT

export const get_products_ByVendor = async (req, res) => {
    try {
        const {
            page = 1, limit = 10, offset,
            search, categoryIds,
            priceRange, stockStatus,
            discount, status,
            sortBy = 'createdAt', orderSequence = 'desc'
        } = req.query;

        const pagingReq = {
            page: parseInt(page),
            limit: parseInt(limit),
            offset,
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

export const get_product_bySku = async (req, res) => {
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
export const get_orders_ByVendor = async (req, res) => {
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

export const get_order_byId = async (req, res) => {
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
                DeleteLocalFile(file.path);
                return res.status(400).json({
                    error: 'Invalid file type. Only images allowed.',
                    success: false,
                });
            }

            if (!ValidateFileSize(file.size, 1)) {
                DeleteLocalFile(file.path);
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
