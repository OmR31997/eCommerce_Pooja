import mongoose from 'mongoose';
import { User } from './user.model.js';
import { Order } from '../order/order.model.js';
import { Vendor } from '../vendor/vendor.model.js';
import { BuildQuery_H, Pagination_H, success } from '../../utils/helper.js';
import { Notify } from '../notification/notification.service.js';

// READ-------------------------------|
export const GetUser = async (keyVal) => {

    const user = await User.findOne(keyVal).
        populate({ path: 'permission', select: 'modules actions' }).
        populate({ path: 'roles', select: 'name' });

    if (!user) {
        throw {
            status: 404,
            message: `Account not found for ID: ${keyVal._id}`
        };
    }


    return success({ message: 'Account fetched successfully', data: user })
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

    return success({
        message: 'Data fetched successfully',
        pagination,
        data: users || []
    });
}

// UPDATE-----------------------------|
export const UpdateUser = async (keyVal, reqData) => {

    const user = await User.findOneAndUpdate(keyVal, reqData, { new: true, runValidators: true });

    if (!user) {
        throw {
            status: 404,
            message: `User account not found for ID: '${keyVal._id}'`,
        }
    }

    return success({
        message: 'User account updated successfully',
        data: user
    });
}

// REMOVE-----------------------------|
export const RemoveUser = async (keyVal) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Step 1: Check if user is a vendor
        const vendor = await Vendor.findOne({ userId: keyVal._id }).session(session).select('businessName');

        if (vendor) {
            throw {
                status: 400,
                message: `Be Carefull! User registered as a vendor (${vendor.businessName})`
            }
        }

        // Step 2: Delete the user
        const user = await User.findOneAndDelete(keyVal).session(session);

        if (!user) {
            throw {
                status: 404,
                message: `User account not found for ID:'${keyVal._id}'`,
            }
        }

        // Step 3: Commit transaction
        await session.commitTransaction();

        // Step 4: Notify admin (after commit)
        await Notify.admin({
            title: 'Customer Document Delete',
            message: `User with ID: ${user._id} deleted by admin`,
            type: 'delete'
        });

        return success({ message: 'User account deleted successfully', data: user });

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        throw error;
    } finally {
        session.endSession();
    }
}

export const RemoveAllUsers = async () => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Step 1: Get all vendor userIds
        const vendors = await Vendor.find({}, { userId: 1, _id: 0 }).session(session).lean();

        const vendorUserIds = vendors.map(v => v.userId);

        if (vendorUserIds.length === 0) {
            throw {
                status: 400,
                message: "No vendors found. Deletion aborted."
            }
        }

        // Step 2: Delete users who are NOT vendors
        const result = await User.deleteMany({ _id: { $nin: vendorUserIds }, session });

        if (result.deletedCount === 0) {
            throw {
                status: 404,
                message: "No user found to delete"
            }
        }

        // Step 3: Commit transaction
        await session.commitTransaction();

        // Step 4: Notify admin (after commit)
        await Notify.admin({
            title: 'Customer Records Delete',
            message: `Deleted: ${result.deletedCount}, NotDeleted: ${vendorUserIds.length}`,
            type: 'delete'
        });

        return success({
            message: "All common users cleared successfully",
            data: {
                deleted: result.deletedCount,
                not_deleted: `${vendorUserIds.length} users have vendor role.`

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

/*
export const GetUserDetails = async (userId) => {
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
*/