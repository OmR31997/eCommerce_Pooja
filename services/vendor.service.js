import mongoose from 'mongoose';
import { Order } from '../models/order.model.js';
import { Vendor, Review } from '../models/vendor.model.js';

export const getVendorDetails = async (vendorId) => {
    const vendorObjectId = new mongoose.Types.ObjectId(vendorId);

    // Fetch Static Vendor Information
    const vendor = await Vendor.findById(vendorId).lean();
    if (!vendor) return { status: 400, error: 'Vendor not found' };

    // Aggregate Order Stats
    const orderStats = await Order.aggregate([
        { $match: { vendorId: vendorObjectId } },
        {
            $facet: {
                totalOrders: [
                    { $count: 'count' },
                ],
                deliveredOrders: [
                    { $match: { status: 'delivered' } },
                    { $count: 'count' },
                ],
                failedOrders: [
                    { $match: { status: { $in: ['cancelled'] } } }, { $count: 'count' }

                ],
                totalEarning: [
                    { $match: { status: 'delivered' } },
                    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
                ],
                avgDispatchTime: [
                    { $match: { status: 'delivered' } },
                    { $group: { _id: null, total: { $avg: '$dispatchTime' } } }
                ],
                monthlyRevenue: [
                    { $match: { status: 'delivered' } },
                    {
                        $group: {
                            _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                            revenue: { $sum: '$totalAmount' }
                        }
                    }
                ],
                recentOrders: [{ $sort: { createdAt: -1 } }, { $limit: 5 }],
            }
        }
    ]);

    const monthlyRevenue = (orderStats[0].monthlyRevenue || []).map(mth => ({
                month: mth._id?.month ?? null,
                year: mth._id?.year ?? null,
                revenue: mth.revenue ?? 0,
            }));

    //Aggregate Review Stats 
    const reviewStats = await Review.aggregate([
        { $match: { vendorId: vendorObjectId } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, totalReviews: { $count: {} } } },
    ])

    return {
        data: {
            ...vendor,
            totalOrders: orderStats[0].totalOrders[0]?.count || 0,
            deliveredOrders: orderStats[0].deliveredOrders[0]?.count || 0,
            failedOrders: orderStats[0].failedOrders[0]?.count || 0,
            recentOrders: orderStats[0].recentOrders || [],
            totalEarning: orderStats[0].totalEarning[0]?.total || 0,
            avgDispatchTime: orderStats[0].totalEarning[0]?.avgDispatchTime || 0,
            totalReviews: reviewStats[0]?.totalReviews || 0,
            monthlyRevenue: monthlyRevenue.length > 0? monthlyRevenue: 'No Revenue Yet'
        },
        success: true,
        status: 200,
    }
}