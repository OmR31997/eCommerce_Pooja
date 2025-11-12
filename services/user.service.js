import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { Order } from '../models/order.model.js';

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