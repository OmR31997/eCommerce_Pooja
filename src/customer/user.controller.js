import { count } from 'console';
import { GetOrderById, GetOrders } from '../order/order.service.js';
import { GetAllUsers, GetUser, RemoveAllUsers, RemoveUser, UpdateUser } from './user.service.js';

// READ CONTROLLERS-----------------------|
export const get_me = async (req, res) => {
    try {
        const { status, success, message, data } = await GetUser(req.user.id);

        return res.status(status).json({ message, data, success });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

export const get_user_byId = async (req, res) => {
    try {
        const userId = req.params.id;

        const { status, success, message, data } = await GetUser(userId);

        return res.status(status).json({ message, data, success });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

export const get_users = async (req, res) => {
    try {
        if (req.user.role === 'user')
            throw {
                status: 401,
                message: `Unauthorized: You haven't accessibility`,
                success: false
            }

        const {
            page = 1,
            limit = 10,
            offset,
            sortBy = 'createdAt',
            orderSequence = 'desc' } = req.query;

        const { status, success, message, pagination, data } = await GetAllUsers(
            `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,
            { page: parseInt(page), limit: parseInt(limit), offset, sortBy, orderSequence },
            {}
        );

        return res.status(status).json({ message, pagination, success, data });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

export const users_filters = async (req, res) => {
    try {
        const {
            search, status,
            phone, segment, joinRange, updatedRange, address,
            page = 1, limit = 10,
            sortBy = 'createdAt', orderSequence = 'desc'
        } = req.query;

        if (req.user.role === 'user') {
            throw {
                status: 401,
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
                search, status,
                phone, segment, joinRange, updatedRange, address,
                status: ['admin', 'super_admin'].includes(req.user.role) ? undefined : 'active'
            },
        }

        const { status: statusCode, success, message, pagination, data } = await GetAllUsers(options);

        return res.status(statusCode).json({ message, pagination, data, success });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
};

// UPDATE CONTROLLERS
export const update_user_profile = async (req, res) => {
    try {
        const {
            name, email, phone,
            segment, address
        } = req.body;

        const userId = req.params.id;

        const userData = {
            name: name || undefined,
            email: email || undefined,
            phone: phone || undefined,
            address: address || undefined,
            segment: segment || undefined,
        }

        const hasAnyField = Object.values(userData).some(value => value !== undefined)

        if (!hasAnyField) {
            throw {
                status: 400,
                message: 'Atleast one field must be required for update',
                success: false
            }
        }

        const { status, success, message, data } = await UpdateUser(userData, userId);

        return res.status(status).json({ message, data, success });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

// DELETE CONTROLLERS
export const remove_user_profile = async (req, res) => {
    try {
        const keyVal = {_id: req.params.id};

        const { status, success, message, data } = await RemoveUser(keyVal);

        return res.status(status).json({ message, data, success });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

export const clear_users = async (req, res) => {
    try {

        if (req.user.role !== 'super_admin') {
            throw {
                status: 405,
                message: `Method Not Allowed`
            }
        }

        const { status, success, message, data } = await RemoveAllUsers();

        return res.status(status).json({ message, data, success });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

// ---------------------------------------------------------------------------------------------------|
// PRODUCT
export const get_orders_ByUser = async (req, res) => {
    try {
        const {
            page = 1, limit = 10, offset,
            search, userIds,
            paymentMethod, paymentStatus, status,
            sortBy = 'createdAt', orderSequence = 'desc'
        } = req.query;

        const options = {
            userId: req.user.role === 'user' ? req.user.id : req.query.userId,

            pagingReq: {
                page: parseInt(page),
                limit: parseInt(limit),
                offset,
                sortBy, orderSequence
            },

            baseUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,

            filter: {
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

            userId: req.user.role === 'user' ? req.user.id : req.query.userId,
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

// ------------------------------------------------------------------------
// VENDOR
export const vendor_registration_ByUser = async (req, res) => {
    try {
        const {
            businessName, businessEmail, businessPhone, password,
            businessDescription,
            accountNumber, ifsc, bankName,
            gstNumber, address, type,
        } = req.body;

        const files = req.files || {};

        const filePayload = {
            logoUrl: files.logoUrl?.[0] || null,
            documents: files.documents || []
        }

        const { status, success, message, data } = await VendorRegistration({
            userId: req.params.userId,
            businessName, businessEmail, businessPhone,
            businessDescription, password, gstNumber,
            status: ['admin', 'super_admin', 'staff'].includes(req.user.role) ? 'approved' : 'pending',
            bankDetails: {
                accountNumber,
                ifsc,
                bankName
            },
            type, address
        }, filePayload);

        return res.status(status).json({
            message, data, success
        });

    } catch (error) {

        const handle = ErrorHandle(error);

        if (handle?.status)
            return res.status(handle.status).json({ error: handle.error, errors: handle.errors, success: false });

        return res.status(500).json({ error: error.message });
    }
}