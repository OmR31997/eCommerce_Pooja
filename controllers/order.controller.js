import { Cart } from "../models/cart.model.js";
import { Order } from "../models/order.model.js";
import { GetOrders } from "../services/order.service.js";

/*      * manage_vendor handler *      */
export const view_user_orders = async (req, res) => {
    try {
        const {
            page = 1, limit = 10, offset,
            search, userIds, vendorIds,
            paymentMethod, paymentStatus, status,
            sortBy = 'createdAt', orderSequence = 'desc'
        } = req.query;

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
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false
        });
    }
}

/* **checkout logic here** */
export const checkout = async (req, res) => {
    try {
        const {
            userId,
            shippingAddress,
            paymentMethod = "COD"
        } = req.body;

        const orderData = {
            userId: req.user.role === 'user' ? req.user.id : userId || undefined,
            shippingAddress: shippingAddress || undefined,
            paymentMethod: paymentMethod,
        }

        const cart = await Cart.findOne({ userId: orderData.userId })
            .populate('items.productId');

        if (!cart || cart.items.length === 0) {
            return res.status(404).json({
                error: 'Cart is empty',
                success: false,
            });
        }

        const vendorGroups = {};

        cart.items.forEach(item => {

            const vendorId = item.productId.vendorId.toString();

            if (!vendorGroups[vendorId])
                vendorGroups[vendorId] = [];

            vendorGroups[vendorId].push(item);
        });

        const createdOrders = [];

        for (const [vendorId, items] of Object.entries(vendorGroups)) {
            const totalAmount = items.reduce((accume, currentItem) => accume + currentItem.price * currentItem.quantity, 0);

            const orderItems = items.map(item => ({
                productId: item.productId._id.toString(),
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity
            }));

            const order = await Order.create({
                ...orderData,
                vendorId,
                items: orderItems,
                totalAmount,
                paymentStatus: paymentMethod === "COD" ? "pending" : "initiated",
            });

            createdOrders.push(order);
        }

        // Clear cart 
        await Cart.findOneAndUpdate({ userId: orderData.userId }, { items: [], totalAmount: 0 });

        return res.status(201).json({
            message: 'Orders created successfully',
            count: createdOrders.length,
            data: createdOrders,
            success: true,
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = {};

            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });

            return res.status(400).json({
                errors,
                message: 'Validation failed',
                success: false,
            });
        }

        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false
        });
    }
}

/* **view_order_by_id logic here** */
export const view_order_by_id = async (req, res) => {
    try {
        const { id, role } = req.user;

        const filter = { _id: req.params.id };
        if (role === 'vendor') {
            filter.vendorId = id;
        }
        else if (role === 'user') {
            filter.userId = id;
        }

        const order = await Order.findOne(filter)
            .populate({ path: 'items.productId', select: 'name price images' })
            .sort({ created: -1 });

        if (!order) {
            return res.status(404).json({
                error: 'Order not found',
                success: false,
            });
        }

        return res.status(200).json({
            data: order,
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false
        });
    }
}

/* **cancel_order logic here** */
export const cancel_order = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;

        const order = await Order.findOne({ _id: orderId, userId });

        if (!order) {
            return res.status(404).json({
                error: 'Order not found',
                success: false,
            });
        }

        if (order.orderStatus === "cancelled") {
            return res.status(400).json({
                error: 'Order already cancelled',
                success: false,
            });
        }

        order.orderStatus = "cancelled";
        await order.save()

        return res.status(200).json({
            message: "Order cancelled successfully",
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false
        });
    }
}

/* **update_order_status logic here** */
export const update_order_status = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { orderStatus } = req.body;
        const { id, role } = req.user;

        if (!orderStatus) {
            return res.status(400).json({
                error: `Please provide 'orderStatus' field & value should be 'confirmed', 'shipped', 'delivered', or 'cancelled')`,
                success: false,
            });
        }

        // Build filter condition dynamically based on role
        let filter = { _id: orderId };

        if (role === "user") {
            filter.userId = id;
        } else if (role === "vendor") {
            filter.vendorId = id;
        }

        const order = await Order.findOne(filter);

        if (!order) {
            return res.status(404).json({
                error: 'Order not found or not accessible',
                success: false,
            });
        }

        order.orderStatus = orderStatus;
        const responseOrder = await order.save();

        return res.status(200).json({
            message: 'Order status updated successfully',
            data: responseOrder,
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false
        });
    }
}
