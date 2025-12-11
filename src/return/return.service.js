import { Refund } from '../refund/refund.model.js';
import { FindOrderFail_H, FindReturnFail_H, Pagination_H, success } from '../../utils/helper.js';
import { Notify } from '../notification/notification.service.js';
import { Order } from '../order/order.model.js';
import { Return } from './return.model.js';

export const CreateReturn = async (keyVal, reqData) => {

    const order = await FindOrderFail_H({ _id: keyVal.orderId }, "status");

    // Check if return is allowed only after delivery
    if (order.status !== "delivered") {
        throw {
            status: 400,
            message: `Return allowed only after delivery`
        }
    }

    // Check if the product exists in the order and if quantity is valid
    const item = order.items.find(item => item.productId.toString() === keyVal.productId);

    if (!item) {
        throw {
            status: 404,
            message: "Product not found for in order"
        }
    }

    if (reqData.quantity > item.quantity) {
        throw {
            status: 400,
            message: "Retutn quantity exceeds purchase quantity"
        }
    }

    const returnItems = {
        productId: item.productId,
        quantity: reqData.quantity,
        price: item.price,
        subtotal: item.price * reqData.quantity
    }
    // Create the return request
    const created = await Return.create({
        orderId: keyVal.orderId,
        userId: keyVal.userId,
        status: 'requested',
        reason: reqData.reason,
        items: [returnItems]
    });

    // Notify admin or staff about the return request
    Notify.admin({
        title: "Order Return Requested",
        message: `Order return request by ${keyVal.userId}`,
        type: "return_requested"
    });

    return {
        status: 201,
        message: "Return requested successfully",
        data: created,
        success: true
    }
}

export const GetReturns = async (options = {}) => {
    const { filter = {}, pagingReq = {}, baseUrl, select } = options;

    const matchedQuery = BuildQuery_H(filter, 'return');

    const total = await Category.countDocuments(matchedQuery);

    const pagination = Pagination_H(pagingReq.page, pagingReq.limit, undefined, total, baseUrl, matchedQuery);

    const sortField = ['createdAt'].includes(pagingReq.sortBy) ? pagingReq.sortBy : 'createdAt';
    const sortDirection = pagingReq.orderSequence === 'asc' ? 1 : -1;
    const sortOption = { [sortField]: sortDirection };

    const returnData = await Return.find(matchedQuery)
        .skip(pagination.skip)
        .limit(pagingReq.limit)
        .sort(sortOption)
        .select(select)
        .lean();

    delete pagination.skip;
    return {
        status: 200,
        success: true,
        message: 'Data fetched successfully',
        count: total,
        pagination,
        data: returnData || []
    }
}

export const GetReturnItemsById = async (keyVal = {}) => {

    const returnData = await Return.findOne(keyVal);

    if (!returnData) {
        throw {
            status: 404,
            message: `Category not found for ID: '${keyVal._id}'`
        }
    }

    return { status: 200, message: 'Data fetched successfully', data: returnData, success: true }
}

export const UpdateReturn = async (keyVal, reqData) => {
    const returnOrder = await FindReturnFail_H(keyVal, 'status');

    const status = reqData.status;

    if (status) {
        returnOrder.status = status;
        await returnOrder.save();

        if (status === "inspected") {
            await Notify.admin({
                title: "Return Order Status",
                message: "Return process inspected successfully",
                type: "order"
            });
        }

        const messageMap = {
            approved: "Return request accepted",
            rejected: "Return rejected",
            inspected: "Return inspected"
        }

        return {
            status: 200,
            message: messageMap[status] || "Status updated",
            data: { _id: returnOrder._id, status },
            success: true
        };
    }

    throw {
        status: 400,
        message: "Bad request",
        data: null
    }
}