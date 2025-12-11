import mongoose from 'mongoose';
import { User } from './user.model.js';
import { Order } from '../order/order.model.js';
import { Vendor } from '../vendor/vendor.model.js';
import { BuildQuery_H, Pagination_H } from '../../utils/helper.js';
import { Notify } from '../notification/notification.service.js';

export const GetUser = async (userId) => {
    const user = await User.findById(userId).
        populate({ path: 'permission', select: 'modules actions' }).
        populate({ path: 'roles', select: 'name' });

    if (!user)
        throw { status: 404, message: `Account not found for ID: ${userId}`, success: false };

    return { status: 200, message: 'Account fetched successfully', data: user }
}

export const GetAllUsers = async (options) => {

    const { filter = {}, pagingReq = {}, baseUrl, select } = options;

    const matchedQuery = BuildQuery_H(filter, 'user');

    // Count total records
    const total = await User.countDocuments(matchedQuery);

    const pagination = Pagination_H(pagingReq.page, pagingReq.limit, undefined, total, baseUrl, matchedQuery);

    const sortField = ['name', 'totalSpents', 'createdAt'].includes(pagingReq.sortBy) ? pagingReq.sortBy : 'createdAt';
    const sortDirection = pagingReq.orderSequence === 'asc' ? 1 : -1;
    const sortOption = { [sortField]: sortDirection };

    const users = await User.find(matchedQuery)
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
        data: users || []
    }
}

export const UpdateUser = async (userData, userId) => {

    const user = await User.findByIdAndUpdate(userId, userData);

    if (!user) {
        throw {
            status: 404,
            message: `User account not found for '${userId}'`,
            success: false
        }
    }

    return { status: 200, message: 'User account updated successfully', data: userData, success: true };
}

export const RemoveUser = async (keyVal) => {
    const user = await User.findOneAndDelete(keyVal);

    if (!user) {
        throw {
            status: 404,
            message: `User account not found for ID:'${keyVal._id}'`,
            success: false
        }
    }

    await Notify.admin({
        title: 'Customer Document Delete',
        message: `Vendor who has ID: ${user._id} deleted by admin`,
        type: 'delete'
    });

    return { status: 200, message: 'User account deleted successfully', data: user, success: false };
}

export const RemoveAllUsers = async () => {
    const users = await User.find();

    if (users.length === 0) {
        throw {
            status: 404,
            error: 'No user found to delete',
            success: false,
        }
    }

    // In case want to delte vendor account also 
    for (const user of users) {
        await Vendor.findOneAndDelete({ userId: user._id });
    }

    const result = await User.deleteMany({});

    if (result.deletedCount === 0) {
        throw {
            status: 404,
            error: 'No user found to delete',
            success: false,
        }
    }

    return {
        status: 200,
        message: `All users cleared successfully (${result.deletedCount} deleted)`,
        success: true,
    };
}

export const getUserDetails = async (userId) => {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const user = await User.findById(userId).populate('orders').lean();
    if (!user)
        return { status: 400, success: false }

    const orderStats = await Order.aggregate([
        { $match: { userId: userObjectId } },
        {
            $facet: {
                shippedOrders: [
                    { $match: { status: 'shipped' } },
                    { $count: 'count' },
                ],
                rejectedOrders: [
                    { $match: { status: 'cancelled' } },
                    { $count: 'count' },
                ],
                totalSpents: [
                    { $match: { status: { $in: ['confirmed', 'shipped'] } } },
                    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
                ],
                lastOrder: [
                    { $sort: { createdAt: -1 } },
                    { $limit: 1 },
                    { $project: { createdAt: 1, totalAmount: 1, status: 1 } }
                ]
            }
        }
    ]);

    const userStats = {
        totalOrders: (orderStats[0].shippedOrders?.[0]?.count || 0) + (orderStats[0].rejectedOrders?.[0]?.count || 0),
        shippedOrders: orderStats[0].shippedOrders?.[0]?.count || 0,
        rejectedOrders: orderStats[0].rejectedOrders?.[0]?.count || 0,
        totalSpents: orderStats[0].totalSpents?.[0]?.total || 0,
    };

    await User.findByIdAndUpdate(userId, userStats, { new: true });

    return {
        data: {
            ...user,
            ...userStats,
        },
        success: true,
        status: 200,
    }

} 