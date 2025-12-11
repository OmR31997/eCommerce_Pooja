import { CancelOrder, CreateOrderBeforePayment, ExchangeOrder, GetOrderById, GetOrders, ReturnOrder } from "./order.service.js";
import { GenerateReceiptPDF } from '../../utils/generateReceipt.js';
import { ErrorHandle_H } from "../../utils/helper.js";

// READ ORDER CONTROLLERS-------------------------|
export const get_orders = async (req, res) => {
    try {
        const {
            page = 1, limit = 10, offset,
            search, userIds, vendorIds,
            paymentMethod, paymentStatus, status,
            sortBy = 'createdAt', orderSequence = 'desc'
        } = req.query;

        if (req.user.role === 'user') {
            throw {
                status: 405,
                message: `Method Not Allowed`
            }
        }

        const options = {
            pagingReq: {
                page: parseInt(page),
                limit: parseInt(limit),
                offset,
                sortBy, orderSequence
            },

            baseUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,

            filter: {
                search,
                userIds, vendorIds,
                status, paymentStatus,
                paymentMethod
            },

            populates: {
                vendor: { path: 'vendorId', select: 'businessName businessEmail status' },
                user: { path: 'userId', select: 'name status totalSpents' },
                product: { path: 'items.productId', select: 'name status' },
            }

        }

        const { status: statusCode, message, pagination, success, data, } = await GetOrders(options);

        return res.status(statusCode).json({ message, pagination, success, data, });

    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error: error.message || `Internal Server Error ${error}`
        });
    }
}

export const get_order_by_orderId = async (req, res) => {
    try {

        const keyVal = {
            _id: req.params.orderId,
            ...(["admin", "super_admin", "staff"].includes(req.user.role)
                ? { main: true }
                : req.user.role === "vendor"
                    ? { vendorId: req.user.id }
                    : { userId: req.user.id })
        }
        
        const { status, message, data, success } = await GetOrderById(keyVal);

        return res.status(status).json({ message, data, success });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

// CREATE ORDER CONTROLLER------------------------|
export const checkout_before_payment = async (req, res, next) => {

    try {

        const {
            shippingTo, phone, postalCode,
            addressLine, city, state,
            userId } = req.body;

        if (userId && req.user.role === 'user' && userId !== req.user.id) {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to create for anothe customer`
            }
        }

        const orderData = {
            userId: req.user.role === 'user' ? req.user.id : userId,
            shippingAddress: {
                name: shippingTo,
                phone, addressLine, city, state,
                postalCode
            }, paymentMethod:"COD", paymentStatus: "pending"
        }

        const { status, success, message, data, count } = await CreateOrderBeforePayment(orderData);

        return res.status(status).json({ message, data, created: count, success });

    } catch (error) {

        next(error)
    }
}

// UPDATE ORDER CONTROLLER------------------------|
export const exchange_order = async (req, res) => {
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
            orderId: req.params.orderId,
            newProductId: req.params.pId
        }

        const { status, success, message } = await ExchangeOrder(options);

        return res.status(status).json({ message, success });

    } catch (error) {

        return res.status(error.status || 500).json({
            success: false,
            error: error.message || `Internal Server Error ${error}`
        });
    }
}

export const return_order = async (req, res) => {
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

        return res.status(error.status || 500).json({
            success: false,
            error: error.message || `Internal Server Error ${error}`
        });
    }
}


// DELETE ORDER CONTROLLER------------------------|
export const cancel_order = async (req, res) => {
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

        const { status, success, message } = await CancelOrder(options);

        return res.status(status).json({ message, success });

    } catch (error) {

        return res.status(error.status || 500).json({
            success: false,
            error: error.message || `Internal Server Error ${error}`
        });
    }
}

//-------------------------------------RECIEPT GENRATE CONTROLLER--------------------------------------|
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
            userId: req.user.role === 'user' ? req.user.id : userId,
            _id: req.params.orderId
        }

        const options = {
            populates: {
                vendor: { path: 'vendorId', select: 'businessName' },
                product: { path: 'items.productId', select: 'name quantity price subtotal totalAmount' },
            },
        }

        const { data: order } = await GetOrderById(keyVal);

        if (!order.items.length === 0) {
            throw {
                status: 404,
                message: 'Item not found'
            }
        }

        await GenerateReceiptPDF(order, res);
    } catch (error) {
        next(error);
    }
}