import { Cart } from '../cart/cart.model.js';
import { Order } from './order.model.js';
import { Notify } from '../notification/notification.service.js';
import { BuildPopulateStages_H, BuildQuery_H, Pagination_H, success } from '../../utils/helper.js';
import mongoose from 'mongoose';
import { Product } from '../product/product.model.js';

// READ------------------------|
export const GetOrders = async (keyVal = {}, options = {}) => {

    const { filter = {}, pagingReq = {}, populates = {}, baseUrl } = options;

    const { userId, vendorId } = keyVal;

    const matchedQuery = {
        ...BuildQuery_H({ ...filter, search: undefined }, 'order'),
        ...(vendorId && { vendorId: new mongoose.Types.ObjectId(vendorId) }),
        ...(userId && { userId: new mongoose.Types.ObjectId(userId) })
    };

    const populateStages = BuildPopulateStages_H(populates);

    const pipeline = [
        { $match: matchedQuery },
        { $unwind: '$items' },
        ...populateStages
    ];

    if (filter.search) {
        pipeline.push(
            {
                $match: {
                    $or: [
                        { 'product.name': { $regex: filter.search, $options: 'i' } },
                        { 'shippingAddress.postalCode': { $regex: filter.search, $options: 'i' } },
                        { 'shippingAddress.city': { $regex: filter.search, $options: 'i' } },
                        { 'shippingAddress.state': { $regex: filter.search, $options: 'i' } },
                        { 'shippingAddress.country': { $regex: filter.search, $options: 'i' } },
                    ]
                }
            }
        )
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
            paymentId: { $first: '$paymentId' },
            createdAt: { $first: '$createdAt' }
        }
    })

    pipeline.push({
        $facet: {
            metadata: [{ $count: 'totalOrdered' }],
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

    const result = await Order.aggregate(pipeline);

    const total = result[0]?.metadata[0]?.totalOrdered || 0;
    const orders = result[0]?.data || [];

    let pagination = Pagination_H(pagingReq.page, pagingReq.limit, undefined, total, baseUrl, matchedQuery);

    return success({
        message: 'Data fetched successfully',
        pagination,
        data: orders
    });
}

export const GetOrderById = async (keyVal) => {

    const order = await Order.findOne(keyVal)
        .populate({ path: 'items.productId', select: 'name quantity price subtotal totalAmount' })
        .populate({ path: 'vendorId', select: 'businessName businessEmail' })
        .populate({ path: 'userId', select: 'name address email' })


    if (!order) {
        throw {
            status: 404,
            message: `Order not found for ID: '${keyVal?._id}'`
        }
    }

    return success({ message: 'Data fetched successfully', data: order });
}

// CREATE----------------------|
export const CreateOrderBeforePayment = async (reqData) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    const createdOrders = []
    try {

        const { userId } = reqData;

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
                ...reqData,
                vendorId,
                items: data.items,
                totalAmount: data.totalAmount,
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

        for (const ord of createdOrders) {
            await Notify.vendor(ord.vendorId, {
                title: 'New Order Received',
                message: `You have received a new order #${ord._id}.`,
                type: 'order'
            });
        }

        return success({
            message: 'Orders created successfully',
            data: createdOrders,
            count: createdOrders.length
        });

    } catch (error) {

        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        throw error;
    } finally {

        session.endSession();
    }
}

export const CreateOrderAfterPayment = async (userId, paymentSessionId) => {
    const createdOrders = [];
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const existingCart = await Cart.findOne({ userId })
            .populate({ path: 'items.productId', select: 'vendorId stock name price subtotal' })
            .session(session);

        if (!existingCart || existingCart.items.length === 0) {
            throw {
                status: 404,
                message: `Cart not found for ID: '${userId}'`
            }
        }

        // Group items by vendor
        const vendorGroups = {};

        for (const item of existingCart.items) {
            const vendorId = item.productId.vendorId.toString();

            if (!vendorGroups[vendorId]) {
                vendorGroups[vendorId] = { items: [], totalAmount: 0 };
            }

            const price = (item.price != null) ? Number(item.price) : Number(item.productId.price);
            const subtotal = item.price * item.quantity;

            vendorGroups[vendorId].items.push({
                productId: item.productId._id.toString(),
                quantity: item.quantity,
                price,
                subtotal
            });

            vendorGroups[vendorId].totalAmount += subtotal;
        }

        // Create vendor-wise orders
        for (const [vendorId, group] of Object.entries(vendorGroups)) {

            // Create order
            const [order] = await Order.create([{
                userId,
                vendorId,
                items: group.items,
                shipping: existingCart.shipping,
                totalAmount: group.totalAmount,
                paymentMethod: 'Online',
                paymentStatus: 'paid',
                paymentSessionId,
                status: 'confirmed'
            }], { session })

            // Update product stock
            for (const item of group.items) {
                const updated = await Product.findOneAndUpdate(
                    { _id: item.productId._id, stock: { $gte: item.quantity } },
                    { $inc: { stock: -item.quantity, sales: item.quantity } },
                    { new: true, session }
                );

                if (!updated) {
                    throw {
                        status: 404,
                        message: `Product out of stock: '${item.productId}'`
                    }
                }
            }

            createdOrders.push(order)
        }

        // Clear cart 
        await Cart.updateOne({ userId }, { items: [], totalAmount: 0 }, { session })

        await session.commitTransaction();
        session.endSession();

        return createdOrders;

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        throw error
    }
}

// UPDATE----------------------|
export const UpdateOrder = async (keyVal, reqData) => {

    const updated = await Order.findOneAndUpdate(keyVal, reqData);

    if (!updated) {
        throw {
            status: 404,
            message: `Order not found for ID: '${keyVal._id}'`
        }
    }

    return success({ message: 'Order updated successfully', data: updated });
}

export const CancelOrder = async (keyVal) => {

    let freshOrder = null;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        // Get Order
        const order = await Order.findOne(keyVal)
            .populate({ path: 'items.productId' })
            .session(session);

        if (!order) {
            throw {
                status: 404,
                message: `Data not found for ID: '${keyVal._id}'`
            }
        }

        if (order.status === 'cancelled') {
            throw {
                status: 409,
                message: `Order already cancelled for ID: '${keyVal._id}'`
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
            }, { new: true, runValidators: true, session });
        }

        // Update order status
        await Order.updateOne(keyVal, { status: "cancelled" }, { runValidators: true, session });

        await session.commitTransaction();
        session.endSession();

        freshOrder = await Order.findOne(keyVal).select('vendorId').lean();

        await Notify.vendor(freshOrder.vendorId, {
            title: 'Order Cancelled',
            message: `Order #${freshOrder._id} has been cancelled.`,
            type: 'order'
        });

        return success({
            message: 'Order cancelled successfully',
            data: {
                _id: freshOrder._id,
                userId: keyVal.userId
            }
        });

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        throw error;
    } finally {
        session.endSession();
    }
}

// DELETE----------------------|
export const DeleteOrder = async (keyVal) => {
    const deleted = await Order.findOneAndDelete(keyVal);

    if (!deleted) {
        throw {
            status: 400,
            message: `Order not found ID: ${keyVal._id}`
        }
    }

    return success({ message: "Order deleted successfully.", data: deleted });
}

export const ClearOrders = async () => {

    const result = await Order.deleteMany({});

    if(result.deletedCount === 0) {
        throw {
            status: 404,
            message: "Order not found for delete"
        }
    }
    
    return success({
        message: `All orders cleared successfully`,
        data: `${result.deletedCount} deleted`
    });
}

// WORKING UNDER PROCESS
export const ExchangeOrder = async (keyVal, reqData) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const order = await Order.findOne(keyVal)
            .populate({ path: 'items.productId', select: 'stock' })
            .session(session);

        if (!order) {
            throw {
                status: 404,
                message: `Order not found for ID: '${keyVal._id}'`
            }
        }

        if (order.status !== 'delivered') {
            throw {
                status: 404,
                message: 'Only delivered orders can be exchanged'
            }
        }

        for (const item of order.items) {
            await Product.findOneAndUpdate({ _id: item.productId._id },
                { $inc: { stock: +item.quantity } }, { new: true, runValidators: true, session });
        }

        const updated = await Product.findOneAndUpdate({ _id: reqData.newProductId },
            { $inc: { stock: -order.items[0].quantity } },
            { new: true, runValidators: true, session });

        if (!updated) {
            throw {
                status: 400,
                message: 'New product out of stock'
            }
        }

        const newProduct = await Order.findOneAndUpdate(keyVal,
            { status: 'exchanged', items: updated }, { session });

        await session.commitTransaction();
        session.endSession();

        return success({
            message: `Order exchanged successfully`,
            data: newProduct
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        throw error
    }
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