import { Cart } from "../models/cart.model.js";
import { Order } from "../models/order.model.js";

/* **checkout logic here** */
export const checkout = async (req, res) => {
    try {
        const { paymentMethod = "COD" } = req.body;
        const { id } = req.user;

        const cart = await Cart.findOne({ userId: id })
            .populate({ path: 'items.productId', populate: { path: "vendorId", select: "shopName" } });

        if (!cart || cart.items.length === 0) {
            return res.status(404).json({
                error: 'Cart is empty',
                success: false,
            });
        }

        const vendorGroups = {};

        cart.items.forEach(item => {
            const vendorId = item.productId.vendorId._id.toString();

            if (!vendorGroups[vendorId])
                vendorGroups[vendorId] = [];

            vendorGroups[vendorId].push(item);
        });

        const createdOrders = [];

        for (const [vendorId, items] of Object.entries(vendorGroups)) {
            const totalAmount = items.reduce((accume, currentItem) => accume + currentItem.price * currentItem.quantity, 0);

            const orderItems = items.map(item => ({
                productId: item.productId._id,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity
            }));

            const order = await Order.create({
                ...req.body,
                userId: id,
                vendorId,
                items: orderItems,
                totalAmount,
                paymentStatus: paymentMethod === "COD" ? "pending" : "initiated",
            });

            createdOrders.push(order);
        }

        // Clear cart 
        await Cart.findOneAndUpdate({ userId: id }, { items: [], totalAmount: 0 });

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

/* **view_user_orders logic here** */
export const view_user_orders = async (req, res) => {
    try {
        const { id } = req.user;
        const orders = await Order.find({ userId: id })
            .populate({ path: 'items.productId' })
            .sort({ createdAt: -1 });

        if (orders.length === 0) {
            return res.status(404).json({
                error: 'Order not found',
                success: false,
            });
        }

        return res.status(200).json({
            data: orders,
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

/* **view_order_by_id logic here** */
export const view_order_by_id = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;

        const order = await Order.findOne({ _id: orderId, userId })
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
                error: `Please provide 'orderStatus' field (e.g., confirmed, shipped, delivered, cancelled)`,
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