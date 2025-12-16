import { CancelOrder, ClearOrders, CreateOrderBeforePayment, DeleteOrder, ExchangeOrder, GetOrderById, GetOrders, ReturnOrder, UpdateOrder } from "./order.service.js";
import { GenerateReceiptPDF_H } from '../../utils/generateReceipt.js';

//Generate
export const download_reciept = async (req, res, next) => {
    try {
        const userId = req.query.userId;

        if (userId && req.role === 'user' && req.user.id !== userId) {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to get reciept`
            }
        }

        const keyVal = {
            _id: req.params.orderId,
            userId: req.user.role === 'user' ? req.user.id : userId
        }

        const { data: order } = await GetOrderById(keyVal);

        await GenerateReceiptPDF_H(order, res);
    } catch (error) {
        next(error);
    }
}

// READ-------------------------|
export const get_orders = async (req, res, next) => {
    try {
        const {
            page = 1, limit = 10,
            search, productIds,
            paymentMethod, paymentStatus, status,
            sortBy = 'createdAt', orderSequence = 'desc'
        } = req.query;

        const keyVal = {
            ...(req.user.role === "user"
                ? { userId: req.user.id }
                : (req.user.role === "vendor")
                    ? { vendorId: req.user.id }
                    : {}
            )
        }

        let roleFilter = {};
        if (keyVal?.userId) {
            roleFilter.vendorIds = req.query.vendorIds;
        } else if (keyVal?.vendorId) {
            roleFilter.userIds = req.query.userIds;
        } else {
            roleFilter = { vendorIds: req.query.vendorIds, userIds: req.query.userIds }
        }

        const options = {
            pagingReq: {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy, orderSequence
            },

            baseUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,

            filter: {
                ...roleFilter,
                search, productIds,
                paymentMethod, paymentStatus, status,
            },

            populates: {
                vendor: { path: 'vendorId', select: 'businessName businessEmail status' },
                user: { path: 'userId', select: 'name status totalSpents' },
                product: { path: 'items.productId', select: 'name status' },
            }

        }

        const response = await GetOrders(keyVal, options);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const get_order_by_id = async (req, res, next) => {

    try {
        const keyVal = {
            ...(req.user.role === "user"
                ? { userId: req.user.id }
                : (req.user.role === "vendor")
                    ? { vendorId: req.user.id }
                    : {}
            )
        }

        keyVal._id = req.params.orderId;

        const response = await GetOrderById(keyVal);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

// CREATE-----------------------| 
export const checkout_before_payment = async (req, res, next) => {

    try {

        const userId = req.query.userId;

        const {
            shippingTo, phone, postalCode,
            addressLine, city, state,
        } = req.body;

        if (userId && req.user.role === 'user' && userId !== req.user.id) {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to create for anothe customer`
            }
        }

        const reqData = {
            userId: req.user.role === 'user' ? req.user.id : userId,
            shippingAddress: {
                name: shippingTo,
                phone, addressLine, city, state,
                postalCode
            },
            paymentMethod: "COD",
            paymentStatus: "pending"
        }

        const response = await CreateOrderBeforePayment(reqData);

        return res.status(201).json(response);

    } catch (error) {

        next(error)
    }
}

// UPDATE-----------------------| 
export const update_order = async (req, res, next) => {
    try {

        const {
            userId,
            shippingTo, phone, postalCode,
            paymentStatus,
            addressLine, city, state,
            trackingId
        } = req.body;

        if (req.user.role === "user") {
            throw {
                status: 401,
                message: "Unauthorized: You don't have permission to update order"
            }
        }

        const keyVal = {
            _id: req.params.orderId,
            userId
        }

        const reqData = {
            shippingAddress: {
                name: shippingTo,
                phone, addressLine, city, state,
                postalCode
            },
            trackingId,
            paymentStatus
        }

        const isValidToUpdate = Object.values(reqData.shippingAddress).some(val => val !== undefined);

        if (!isValidToUpdate) {
            delete reqData.shippingAddress;
        }

        if (!reqData.shippingAddress && !trackingId && !paymentStatus) {
            throw {
                status: 400,
                message: `paymentStatus, trackingId, ${Object.keys(reqData.shippingAddress).slice(0, -1).join(', ')}, or ` +
                    `${Object.keys(reqData.shippingAddress).slice(-1)} field must be provided to update permissions!`
            }
        }

        const response = await UpdateOrder(keyVal, reqData);

        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

export const cancel_order = async (req, res, next) => {
    try {

        const userId = req.query.userId;

        if (userId && req.user.role === 'user' && req.user.id !== userId) {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission`
            }
        }

        const keyVal = {
            _id: req.params.orderId,
            userId: req.user.role === 'user' ? req.user.id : userId,
        }

        const response = await CancelOrder(keyVal);

        return res.status(200).json(response);

    } catch (error) {

        next(error);
    }
}

// DELETE-----------------------|
export const delete_order = async (req, res, next) => {
    try {

        if (req.user.role === 'user') {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission`
            }
        }

        const keyVal = {
            _id: req.params.orderId,
        }

        const response = await DeleteOrder(keyVal);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const clear_orders = async (req, res, next) => {
    try {

        if (req.user.role !== 'super_admin') {
            throw {
                status: 405,
                message: "Method Not Allowed"
            }
        }

        const response = await ClearOrders();

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

// ||UNDER PROCEES||
export const exchange_order = async (req, res, next) => {
    try {
        const userId = req.query.userId;

        if (userId && req.user.role === 'user' && req.user.id !== userId) {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission`
            }
        }

        const keyVal = {
            _id: req.params.orderId,
            userId: req.user.role === 'user' ? req.user.id : userId,
        }

        const reqData = {
            newProductId: req.params.pId
        }

        const response = await ExchangeOrder(keyVal, reqData);

        return res.status(200).json(response);

    } catch (error) {

        next(error)
    }
}

// ||UNDER PROCESS||
export const return_order = async (req, res, next) => {
    try {
        const userId = req.query.userId;

        if (userId && req.user.role === 'user' && req.user.id !== userId) {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission`
            }
        }

        const options = {
            userId: req.user.role === 'user' ? req.user.id : userId,
            orderId: req.params.orderId
        }

        const { status, success, message } = await ReturnOrder(options);

        return res.status(status).json({ message, success });
    } catch (error) {
        next(error);
    }
}
