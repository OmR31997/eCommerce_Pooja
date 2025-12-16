import { count } from 'console';
import { GetOrderById, GetOrders } from '../order/order.service.js';
import { GetAllUsers, GetUser, RemoveAllUsers, RemoveUser, UpdateUser } from './user.service.js';

// READ-------------------------|
export const get_me = async (req, res, next) => {
    try {

        const keyVal = { _id: req.user.id };

        const response = await GetUser(keyVal);

        return res.status(200).json(response);
    } catch (error) {
        next(error)
    }
}

export const get_user_byId = async (req, res, next) => {
    try {

        if (req.user.role === 'user') {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to access`,
                success: false
            }
        }

        const keyVal = { _id: req.params.id };

        const response = await GetUser(keyVal);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const get_users = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            orderSequence = 'desc' } = req.query;

        if (req.user.role === 'user') {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to access`
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

        const response = await GetAllUsers(options);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
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

            filter: {
                search, status,
                phone, segment, joinRange, updatedRange, address,
            },
        }

        const response = await GetAllUsers(options);

        return res.status(200).json(response);

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
};

// UPDATE-------------------------|
export const update_user_profile = async (req, res, next) => {
    try {
        const {
            name, email, phone,
            segment, address
        } = req.body;

        const keyVal = { _id: req.params.id };

        const reqData = {
            name, email,
            phone, segment,
            address
        }

        const isValidToUpdate = Object.values(reqData).some(val => val !== undefined);

        if (!isValidToUpdate) {

            throw {
                status: 400,
                message: `Either ${Object.keys(reqData).slice(0, -1).join(', ')}, or ` +
                    `${Object.keys(reqData).slice(-1)} field must be provided to update permissions!`
            }
        }

        const response = await UpdateUser(keyVal, reqData);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

// DELETE-------------------------|
export const remove_user_profile = async (req, res, next) => {
    try {
        const keyVal = { _id: req.params.id };

        const response = await RemoveUser(keyVal);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const clear_users = async (req, res, next) => {
    try {

        if (req.user.role !== 'super_admin') {
            throw {
                status: 401,
                message: `Authorized: You don't have permission to clear`
            }
        }

        const response = await RemoveAllUsers();

        return res.status(200).json(response);

    } catch (error) {
        next(error);
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
