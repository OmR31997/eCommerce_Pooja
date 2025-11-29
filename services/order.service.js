import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import { BuildPopulateStages, BuildQuery} from "../utils/fileHelper.js";

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

    if(userId) {
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

    let order = Order.findById(orderId);

    if (populates.vendor) {
        order = order.populate(populates.vendor);
    }

    if (populates.product) {
        order = order.populate(populates.product);
    }

    const existing = await Order.findById(orderId);

    if(!existing) {
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
        if (existing.vendorId._id === new mongoose.Types.ObjectId(userId))
            return { message: 'Data fetched successfully', status: 200, data: existing, success: true };

        throw {
            status: 404,
            message: `Data not found for ID: '${orderId}'`
        }
    }

    return {status: 200, message: 'Data fetched successfully', data: existing, success: true};
}