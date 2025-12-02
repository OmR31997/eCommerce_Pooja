import mongoose from "mongoose";
import PDFDocument from 'pdfkit';
import { Order } from "../models/order.model.js";
import { BuildPopulateStages, BuildQuery } from "../utils/fileHelper.js";
import { GenerateReceiptPDF } from '../utils/generateReceipt.js';
import { Cart } from "../models/cart.model.js";
import { Product } from '../models/product.model.js';
import { CreateNotification } from "./notification.service.js";

export const GetOrders = async (options = {}) => {

    const { filter = {}, pagingReq = {}, populates = {}, baseUrl, vendorId, userId } = options;

    const matchedQuery = BuildQuery(filter, 'order');
    const populateStages = BuildPopulateStages(populates);

    const pipeline = [
        { $match: matchedQuery },
        { $unwind: '$items' },
        ...populateStages,
    ];

    if (vendorId) {
        pipeline.push({
            $match: { vendorId: new mongoose.Types.ObjectId(vendorId) }
        });
    }

    if (userId) {
        pipeline.push({
            $match: { userId: new mongoose.Types.ObjectId(userId) }
        });
    }

    if (filter.search) {
        pipeline.push({
            $match: { 'productData.name': { $regex: filter.search, $options: 'i' } },
        })
    }

    pipeline.push({
        $group: {
            _id: '$_id',
            user: { $first: { name: '$user.name', status: '$user.status' } },
            vendor: { $first: { businessName: '$vendor.businessName', status: '$vendor.status' } },
            items: {
                $push: {
                    productId: '$items.productId',
                    productName: '$product.name',
                    quantity: '$items.quantity',
                    price: '$items.price',
                    subtotal: '$items.subtotal'
                },
            },
            totalAmount: { $first: '$totalAmount' },
            paymentMethod: { $first: '$paymentMethod' },
            paymentStatus: { $first: '$paymentStatus' },
            status: { $first: '$status' },
            shippingAddress: { $first: '$shippingAddress' },
            trackingId: { $first: '$trackingId' },
            paymentId: { $first: '$paymentId' }
        }
    })

    pipeline.push({
        $facet: {
            metadata: [{ $count: 'totalOrdered' }]
            ,
            data: [
                {
                    $sort: {
                        [pagingReq.sortBy || 'createdAt']: pagingReq.orderSequence === 'asc' ? 1 : -1
                    }
                },
                {
                    $skip: (pagingReq.page - 1) * pagingReq.limit
                },
                {
                    $limit: pagingReq.limit
                },
            ],
        }
    });

    const orders = await Order.aggregate(pipeline);

    const totalOrders = orders[0]?.metadata[0]?.totalOrdered || 0;
    const result = orders[0]?.data || [];
    const currentPage = pagingReq.page;
    const totalPages = Math.ceil(totalOrders / pagingReq.limit);

    const pagination = {
        count: totalOrders,
        prevUrl: currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}&limit=${pagingReq.limit}` : null,
        nextUrl: currentPage < totalPages ? `${baseUrl}?page=${currentPage + 1}&limit=${pagingReq.limit}` : null,
        currentPage,
        totalPages
    }

    return {
        status: 200,
        message: 'Data fetched successfully',
        pagination,
        success: true,
        data: result
    }
}

export const GetOrderById = async (options = {}) => {

    const { vendorId, orderId, userId, populates = {} } = options;

    let result = Order.findById(orderId);

    if (populates.vendor) {
        result = result.populate(populates.vendor);
    }

    if (populates.product) {
        result = result.populate(populates.product);
    }

    const existing = await result.findById(orderId).lean();

    if (!existing) {
        throw {
            status: 404,
            message: `Data not found for ID: '${orderId}'`
        }
    }

    if (vendorId) {
        if (existing.vendorId._id.toString() === vendorId.toString())
            return { message: 'Data fetched successfully', status: 200, data: existing, success: true };

        throw {
            status: 404,
            message: `Data not found for ID: '${orderId}'`
        }
    }

    if (userId) {
        if (existing.userId.toString() === userId.toString())
            return { message: 'Data fetched successfully', status: 200, data: existing, success: true };

        throw {
            status: 404,
            message: `Data not found for ID: '${orderId}'`
        }
    }

    return { status: 200, message: 'Data fetched successfully', data: existing, success: true };
}

export const CreateOrder = async (orderData) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    const createdOrders = []
    try {

        const { userId, paymentMethod } = orderData;

        const existingCart = await Cart.findOne({ userId })
            .populate({ path: 'items.productId', select: 'vendorId stock name' })
            .session(session);

        if (!existingCart || existingCart.items.length === 0) {
            throw {
                status: 404,
                message: 'Cart is empty'
            }
        }


        // Group items by vendor
        const vendorGroups = {};

        for (const item of existingCart.items) {
            const vendorId = item.productId.vendorId.toString();

            if (!vendorGroups[vendorId]) {
                vendorGroups[vendorId] = { items: [], totalAmount: 0 };
            }

            const subtotal = item.price * item.quantity;

            vendorGroups[vendorId].items.push({
                productId: item.productId._id.toString(),
                quantity: item.quantity,
                price: item.price,
                subtotal
            });

            vendorGroups[vendorId].totalAmount += subtotal;
        }

        // Create vendor-wise orders
        for (const [vendorId, data] of Object.entries(vendorGroups)) {

            // Create order
            const [order] = await Order.create([{
                ...orderData,
                vendorId,
                items: data.items,
                totalAmount: data.totalAmount,
                paymentStatus: paymentMethod === 'COD' ? 'pending' : 'initiating'
            }], { session })

            // Update product stock
            for (const item of data.items) {
                const product = await Product.findOneAndUpdate(
                    { _id: item.productId, stock: { $gte: item.quantity } },
                    { $inc: { stock: -item.quantity, sales: item.quantity } },
                    { new: true, session }
                );

                if (!product) {
                    throw {
                        status: 404,
                        message: `Product out of stock: '${item.productId}'`
                    }
                }
            }

            createdOrders.push(order)
        }

        // Clear cart 
        await Cart.findOneAndUpdate({ userId }, { items: [], totalAmount: 0 }, { session });

        await session.commitTransaction();
        session.endSession();
    } catch (error) {

        await session.abortTransaction();
        session.endSession();

        throw {
            status: error.status ?? 500,
            message: error.message || "Error creating order."
        }
    }

    try {
        for (const order of createdOrders) {
            await CreateNotification({
                receiver: {
                    receiverId: order.vendorId,
                    role: 'vendor'
                },
                title: 'New Order Received',
                message: `You have received a new order #${order._id}.`,
                type: 'order'
            });
        }
    } catch (NotifyError) {
        console.log("Notification failed:", NotifyError.message);
    }

    return {
        status: 201,
        message: 'Orders created successfully',
        data: createdOrders,
        count: createdOrders.length,
        success: true
    }
}

export const CancelOrder = async (options = {}) => {

    let freshOrder = null;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const { orderId, userId } = options;

        // Get Order
        const order = await Order.findOne({ _id: orderId, userId })
        .populate({path: 'items.productId'})
        .session(session);

        if (!order) {
            throw {
                status: 404,
                message: `Data not found for ID: '${orderId}'`
            }
        }

        if (order.status === 'cancelled') {
            throw {
                status: 409,
                message: `Order already cancelled for ID: '${orderId}'`
            }
        }

        if (order.status === 'delivered') {
            throw {
                status: 400,
                message: "Delivered order cannot be cancelled"
            };
        }

        // Revert product stock (product stock inc)
        for (const item of order.items) {
            const productId = item.productId?._id || item.productId;

            await Product.findByIdAndUpdate(productId, {
                $inc: { stock: item.quantity, sales: -item.quantity }
            }, { session });
        }

        // Update order status
        await Order.updateOne({_id: orderId}, { status: "cancelled" }, { session });

        await session.commitTransaction();
        session.endSession();

        freshOrder = await Order.findById(orderId).select('vendorId').lean();

    } catch (error) {

        await session.abortTransaction();
        session.endSession();

        throw {
            status: error.status ?? 500,
            message: error.message || 'Order cancellation failed'
        }
    }

    try {
        await CreateNotification({
            receiver: {
                receiverId: freshOrder.vendorId,
                role: 'vendor'
            },
            title: 'Order Cancelled',
            message: `Order #${freshOrder._id} has been cancelled.`,
            type: 'order'
        });

    } catch (NotifyError) {
        console.log("Notification failed:", NotifyError.message);
    }

    return { status: 200, message: 'Order cancelled successfully', success: true };
}

export const ReturnOrder = async (options = {}) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const { orderId, userId } = options;
        const order = await Order.findOne({ _id: orderId, userId })
            .populate({ path: 'items.productId', select: 'stock' })
            .session(session);

        if (!order) {
            throw {
                status: 404,
                message: `Order not found for orderID: '${orderId}' with userID: '${userId}' `
            }
        }

        if (order.status !== 'delivered') {
            throw {
                status: 400,
                message: `Only delivered orders can be returned`
            }
        }

        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId._id, {
                $inc: { stock: +item.quantity, sales: -item.quantity }
            }, session);
        }

        await Order.findByIdAndUpdate(orderId, { status: 'returned' }, { session });

        await session.commitTransaction();
        session.endSession();

        return { status: 200, message: 'Order returned successfully', success: true };

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        throw { status: 500, message: error.message }
    }
}

export const ExchangeOrder = async (options = {}) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const { orderId, userId, newProductId } = options;

        const order = await Order.findOne({ _id: orderId, userId })
            .populate({ path: 'items.productId', select: 'stock' })
            .session(session);

        if (!order) {
            throw {
                status: 404,
                message: `Order not found for orderID: '${orderId}'`
            }
        }

        if (order.status !== 'delivered') {
            throw {
                status: 404,
                message: 'Only delivered orders can be exchanged'
            }
        }

        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId._id, {
                $inc: { stock: +item.quantity }
            }, { session });
        }

        const newProduct = await Product.findByIdAndUpdate({
            _id: newProductId,
            stock: { $gte: order.items[0].quantity }
        },
            {
                $inc: { stock: -order.items[0].quantity }
            },
            {
                new: true, session
            });

        if (!newProduct) {
            throw {
                status: 400,
                message: 'New product out of stock'
            }
        }

        await Order.findByIdAndUpdate(orderId, {
            status: 'exchanged',
            exchangedProduct: newProduct
        }, { session });

        await session.commitTransaction();
        session.endSession();

        return { status: 200, message: `Order exchanged successfully`, success: true };

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        throw {
            status: 500,
            message: error.message || 'Order cancellation failed'
        }
    }
}

export const UpdateOrder = async (options = {}) => {

    const { orderData = {}, orderId } = options;

    const updatedOrdered = await Order.findByIdAndUpdate(orderId, orderData);

    if (!updatedOrdered) {
        throw {
            status: 404,
            message: `Order not found for orderID: '${orderId}'`
        }
    }

    return { status: 200, message: 'Order updated successfully', data: updatedOrdered, success: true };
}

export const ViewReciept = async (options = {}) => {
    const { orderId, userId } = options;

    const order = await Order.findOne({ _id: orderId, userId })
        .populate('items.productId', 'name')
        .lean();

    if (!order) {
        throw {
            status: 404,
            message: `Order not found for orderID: '${orderId}'`
        }
    }

    const items = order.items.map(item => ({
        name: item.productId.name,
        qty: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price
    }));

    const total = order.totalAmount;

    const doc = new PDFDocument({ margin: 50 });

    return { status: 200, doc, data: order, items, total };
}

export const DownloadReciept = async (options = {}, res) => {
    const { orderId, userId } = options;

    const order = await Order.findOne({ _id: orderId, userId })
        .populate('items.productId', 'name')
        .lean();

    if (!order) {
        throw {
            status: 404,
            message: `Order not found for orderID: '${orderId}'`
        }
    }

    GenerateReceiptPDF(order, res);
}