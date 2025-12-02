import { CancelOrder, CreateOrder, DownloadReciept, ExchangeOrder, GetOrderById, GetOrders, ReturnOrder, UpdateOrder, ViewReciept } from "../services/order.service.js";
import { ErrorHandle } from "../utils/fileHelper.js";
import { GenerateReceiptPDF } from "../utils/generateReceipt.js";

/*      * manage_vendor handler *      */
export const view_user_orders = async (req, res) => {
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
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

/*      * checkout handler *      */
export const checkout = async (req, res) => {
    try {

        const {
            shippingTo, phone, postalCode,
            addressLine, city, state,
            paymentMethod, userId } = req.body;

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
            }, paymentMethod
        }

        const { status, success, message, data, count } = await CreateOrder(orderData);

        return res.status(status).json({ message, data, created: count, success });

    } catch (error) {

        const handle = ErrorHandle(error);

        if (handle?.status)
            return res.status(handle.status).json({ error: handle.error, errors: handle.errors, success: false });

        return res.status(500).json({ success: false, error: error.message });
    }
}

/*      * view_order_by_id handler *      */
export const view_order_by_id = async (req, res) => {
    try {

        if (!['admin', 'super_admin', 'staff'].includes(req.user.role)) {
            throw {
                status: 405,
                message: `Method Not Allowed`
            }
        }

        const options = {
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

/*      * cancel_order handler *      */
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
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

/*      * return_order handler *      */
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
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

/*      * exchange_order handler *      */
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
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

/*      * cancel_order handler *      */
export const update_order = async (req, res) => {
    try {
        const {
            shippingTo, phone,
            postalCode, addressLine, city, state,
            // trackingId, paymentId,
            // paymentMethod

        } = req.body;

        if (!['admin', 'super_admin', 'staff'].includes(req.user.role)) {
            throw {
                status: 405,
                message: `Method Not Allowed`
            }
        }

        const options = {
            orderId: req.params.orderId,
            orderData: {
                shippingAddress: {
                    name: shippingTo,
                    phone, addressLine, city, state,
                    postalCode
                },
                paymentStatus, status,
                trackingId, paymentId, paymentMethod
            }
        }

        const { status: statusCode, success, message, data } = await UpdateOrder(options);

        return res.status(statusCode).json({ message, data, success });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

/*      * download_reciept handler *      */
export const download_reciept = async (req, res) => {
    try {
        const userId = req.query.userId;

        if (userId && req.role === 'user' && req.user.id !== userId) {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to get reciept`
            }
        }

        const options = {
            userId: req.user.role === 'user' ? req.user.id : userId,
            orderId: req.params.orderId,

            populates: {
                vendor: {path: 'vendorId', select: 'businessName'},
                product: { path: 'items.productId', select: 'name quantity price subtotal totalAmount' },
            },
        }

        const { data: order } = await GetOrderById(options);

        if (!order.items.length === 0) {
            throw {
                status: 404,
                message: 'Item not found'
            }
        }

        await GenerateReceiptPDF(order, res);
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}