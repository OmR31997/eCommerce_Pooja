import mongoose from 'mongoose';
import { Admin } from '../admin/admin.model.js';
import { Order } from '../order/order.model.js';
import { Vendor } from '../vendor/vendor.model.js';
import { Review } from '../../common_models/review.model.js';
import { User } from '../customer/user.model.js';
import { Staff } from '../staff/staff.model.js';
import { Category } from '../category/category.model.js';
import { Product } from '../product/product.model.js';
import { Role } from '../role/role.model.js';
import { Permission } from '../permission/permission.model.js';
import { Cart } from '../cart/cart.model.js';
import { GetStartAndEndDate_H } from '../../utils/helper.js';

export const GetPrimaryModule = (permission) => {
    let modules = [];

    permission.forEach(p => {
        modules.push(...p.module);
    });

    const count = {};

    modules.forEach(m => count[m] = (count[m] || 0) + 1);

    return Object.entries(count).sort((a, b) => b[1] - a[1])[0][0];
}

export const recentOrders = async () => {
    return await Order.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "customer",
            },
        },
        { $unwind: "$customer" },
        {
            $project: {
                _id: 1,
                totalAmount: 1,
                orderStatus: 1,
                createdAt: 1,
                customerName: "$customer.name",
            },
        },
    ]);
};

export const topCustomers = async () => {
    return await Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        {
            $group: {
                _id: "$user",
                totalSpent: { $sum: "$totalAmount" },
                orders: { $sum: 1 },
            },
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "customer",
            },
        },
        { $unwind: "$customer" },
        {
            $project: {
                name: "$customer.name",
                email: "$customer.email",
                totalSpent: 1,
                orders: 1,
            },
        },
    ]);
};

export const dailyStats = async () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    return await Order.aggregate([
        { $match: { createdAt: { $gte: start } } },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                revenue: { $sum: "$totalAmount" },
            },
        },
    ]);
};

export const weeklyStats = async () => {
    const start = new Date();
    start.setDate(start.getDate() - 7);

    return await Order.aggregate([
        { $match: { createdAt: { $gte: start } } },
        {
            $group: {
                _id: { $dayOfWeek: "$createdAt" },
                totalOrders: { $sum: 1 },
                revenue: { $sum: "$totalAmount" },
            },
        },
        { $sort: { "_id": 1 } },
    ]);
};

export const vendorEarnings = async (vendorId) => {
    return await Order.aggregate([
        { $match: { vendor: new mongoose.Types.ObjectId(vendorId), paymentStatus: "paid" } },
        {
            $group: {
                _id: null,
                totalEarnings: { $sum: "$totalAmount" },
                totalOrders: { $sum: 1 },
            },
        },
    ]);
};

export const bestSellingProducts = async () => {
    return await Order.aggregate([
        { $unwind: "$items" }, // break into individual items
        {
            $group: {
                _id: "$items.product",
                totalSold: { $sum: "$items.quantity" },
            },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "_id",
                as: "product",
            },
        },
        { $unwind: "$product" },
        {
            $project: {
                name: "$product.name",
                totalSold: 1,
            },
        },
    ]);
};

/* *Dashboards Services* */

export const GetSuperAdminDashboard = async (filter) => {
    try {
        const { selectedYear, range, page } = filter;

        const totalSubAdmin = await Admin.countDocuments({ email: { $ne: process.env.SUPER_ADMIN_EMAIL } })
        const totalVendors = await Vendor.countDocuments();
        const totalStaffs = await Staff.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalCategories = await Category.countDocuments();

        const roles = await Role.countDocuments();
        const permissions = await Permission.countDocuments();

        const activeStaff = await Staff.countDocuments({ isActive: true });
        const approvedVendor = await Vendor.countDocuments({ status: 'approved' });
        const pendingVendors = await Vendor.countDocuments({ status: 'pending' });

        const blockedUsers = await Vendor.countDocuments({ status: 'blocked' });
        const rejectedVendor = await User.countDocuments({ status: 'rejected' });

        const activeUsers = await User.countDocuments({ status: 'active' });
        const vipUsers = await User.countDocuments({ status: 'vip' });
        const newUsers = await User.countDocuments({ status: 'new' });
        const suspetedUsers = await User.countDocuments({ status: 'at_risk' });

        const inactiveStaff = await Staff.countDocuments({ isActive: false });
        const inactiveUsers = await User.countDocuments({ status: 'inactive' });
        const inactiveCategory = await Category.countDocuments({ status: 'inactive' });

        const totalCartedProducts = await Cart.countDocuments();

        const { startDate, endDate, startMonth, endMonth } = GetStartAndEndDate_H(selectedYear, range, page);

        const yearFilter = {
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            }
        }

        // Aggregate Order Stats
        const productStats = await Product.aggregate([
            {
                $facet: {
                    // 1. Total products count
                    totalProducts: [
                        { $count: "count" }
                    ],

                    // 2. Most viewed products
                    mostViewedProducts: [
                        { $sort: { views: -1 } },   // High views first
                        { $limit: 5 },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                views: 1,
                                thumbnail: 1,
                                price: 1
                            }
                        }
                    ],

                    // 3. Top selling products (optional)
                    bestSellingProducts: [
                        {
                            $lookup: {
                                from: "orderitems",
                                localField: "_id",
                                foreignField: "product",
                                as: "sales"
                            }
                        },
                        {
                            $addFields: {
                                totalSold: { $sum: "$sales.quantity" }
                            }
                        },
                        { $sort: { totalSold: - 1 } },
                        { $limit: 5 }
                    ]

                }
            }
        ]);

        // Aggregate Order Stats
        const orderStats = await Order.aggregate([
            {
                $facet: {
                    totalOrders: [
                        { $count: 'count' },
                    ],
                    deliveredOrders: [
                        { $match: { status: 'delivered' } },
                        { $count: 'count' },
                    ],
                    cancelledOrders: [
                        { $match: { status: { $in: ['cancelled'] } } }, { $count: 'count' }

                    ],
                    pending: [
                        { $match: { status: { $in: ["processing", "pending"] } } },
                        { $count: "count" }
                    ],
                    totalEarning: [
                        { $match: { paymentStatus: 'paid' } },
                        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
                    ],
                    avgDispatchTime: [
                        { $match: { status: 'delivered' } },
                        { $group: { _id: null, avg: { $avg: '$dispatchTime' } } }
                    ],
                    revenue: [
                        { $match: { paymentStatus: 'paid', ...yearFilter, } },
                        {
                            $group: {
                                _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                                revenue: { $sum: '$totalAmount' }
                            }
                        }
                    ],
                    monthlySales: [
                        { $match: { paymentStatus: 'paid', ...yearFilter } },
                        { $group: { _id: { month: { $month: '$createdAt' } }, sales: { $sum: '$totalAmount' } } },
                        { $sort: { '_id.month': 1 } }
                    ],
                }
            }
        ]);

        const monthsName = ['January', 'Feburary', 'March', 'April', 'May', 'Jun',
            'July', 'August', 'September', 'October', 'November', 'December'];

        const revenues = [];
        for (let m = startMonth; m <= endMonth; m++) {
            const found = orderStats[0].revenue.find(d => d._id.month === m + 1);

            revenues.push({
                monthNumber: m + 1,
                monthName: monthsName[m],
                revenue: found ? found.revenue : 0
            });
        }

        //Aggregate Review Stats 
        const reviewStats = await Review.aggregate([
            { $group: { _id: null, avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
        ]);

        return {
            data: {
                totalSubAdmin,
                totalVendors,
                approvedVendor,
                pendingVendors,
                rejectedVendor,
                blockedUsers,
                activeStaff,
                inactiveStaff,
                activeUsers,
                vipUsers,
                newUsers,
                suspetedUsers,
                inactiveUsers,
                inactiveCategory,


                totalStaffs,
                totalUsers,
                totalCategories,
                roles,
                permissions,

                totalCartedProducts,

                totalProducts: productStats[0].totalProducts[0]?.count || 0,
                mostViewedProducts: productStats[0].mostViewedProducts,
                bestSellingProducts: productStats[0].bestSellingProducts,

                totalOrders: orderStats[0].totalOrders[0]?.count || 0,
                deliveredOrders: orderStats[0].deliveredOrders[0]?.count || 0,
                cancelledOrders: orderStats[0].cancelledOrders[0]?.count || 0,
                pending: orderStats[0]?.pending[0]?.count || 0,
                totalEarning: orderStats[0].totalEarning[0]?.total || 0,
                avgDispatchTime: orderStats[0].avgDispatchTime[0]?.avg || 0,

                totalReviews: reviewStats[0]?.totalReviews || 0,
                avgRating: reviewStats[0]?.avgRating || 0,
                monthlySales: orderStats[0].monthlySales,
                revenue: revenues,
            },
            success: true,
            status: 200,
        }
    } catch (error) {
        return res.status(error.status).json({
            error: error.message || `Internal Server Error '${error}'`
        });
    }
}
export const GetAdminDashboard = async (filter) => {
    try {
        const { selectedYear, range, page } = filter;


        const totalVendors = await Vendor.countDocuments();
        const totalStaffs = await Staff.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalCategories = await Category.countDocuments();

        const roles = await Role.countDocuments();
        const permissions = await Permission.countDocuments();

        const activeStaff = await Staff.countDocuments({ isActive: true });
        const approvedVendor = await Vendor.countDocuments({ status: 'approved' });
        const pendingVendors = await Vendor.countDocuments({ status: 'pending' });

        const blockedUsers = await Vendor.countDocuments({ status: 'blocked' });
        const rejectedVendor = await User.countDocuments({ status: 'rejected' });

        const activeUsers = await User.countDocuments({ status: 'active' });
        const vipUsers = await User.countDocuments({ status: 'vip' });
        const newUsers = await User.countDocuments({ status: 'new' });
        const suspetedUsers = await User.countDocuments({ status: 'at_risk' });

        const inactiveStaff = await Staff.countDocuments({ isActive: false });
        const inactiveUsers = await User.countDocuments({ status: 'inactive' });
        const inactiveCategory = await Category.countDocuments({ status: 'inactive' });

        const totalCartedProducts = await Cart.countDocuments();

        const { startDate, endDate, startMonth, endMonth } = GetStartAndEndDate_H(selectedYear, range, page);

        const yearFilter = {
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            }
        }

        // Aggregate Order Stats
        const productStats = await Product.aggregate([
            {
                $facet: {
                    // 1. Total products count
                    totalProducts: [
                        { $count: "count" }
                    ],

                    // 2. Most viewed products
                    mostViewedProducts: [
                        { $sort: { views: -1 } },   // High views first
                        { $limit: 5 },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                views: 1,
                                thumbnail: 1,
                                price: 1
                            }
                        }
                    ],

                    // 3. Top selling products (optional)
                    bestSellingProducts: [
                        {
                            $lookup: {
                                from: "orderitems",
                                localField: "_id",
                                foreignField: "product",
                                as: "sales"
                            }
                        },
                        {
                            $addFields: {
                                totalSold: { $sum: "$sales.quantity" }
                            }
                        },
                        { $sort: { totalSold: - 1 } },
                        { $limit: 5 }
                    ]

                }
            }
        ]);

        // Aggregate Order Stats
        const orderStats = await Order.aggregate([
            {
                $facet: {
                    totalOrders: [
                        { $count: 'count' },
                    ],
                    deliveredOrders: [
                        { $match: { status: 'delivered' } },
                        { $count: 'count' },
                    ],
                    cancelledOrders: [
                        { $match: { status: { $in: ['cancelled'] } } }, { $count: 'count' }

                    ],
                    pending: [
                        { $match: { status: { $in: ["processing", "pending"] } } },
                        { $count: "count" }
                    ],
                    totalEarning: [
                        { $match: { paymentStatus: 'paid' } },
                        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
                    ],
                    avgDispatchTime: [
                        { $match: { status: 'delivered' } },
                        { $group: { _id: null, avg: { $avg: '$dispatchTime' } } }
                    ],
                    revenue: [
                        { $match: { paymentStatus: 'paid', ...yearFilter, } },
                        {
                            $group: {
                                _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                                revenue: { $sum: '$totalAmount' }
                            }
                        }
                    ],
                    monthlySales: [
                        { $match: { paymentStatus: 'paid', ...yearFilter } },
                        { $group: { _id: { month: { $month: '$createdAt' } }, sales: { $sum: '$totalAmount' } } },
                        { $sort: { '_id.month': 1 } }
                    ],
                }
            }
        ]);

        const monthsName = ['January', 'Feburary', 'March', 'April', 'May', 'Jun',
            'July', 'August', 'September', 'October', 'November', 'December'];

        const revenues = [];
        for (let m = startMonth; m <= endMonth; m++) {
            const found = orderStats[0].revenue.find(d => d._id.month === m + 1);

            revenues.push({
                monthNumber: m + 1,
                monthName: monthsName[m],
                revenue: found ? found.revenue : 0
            });
        }

        //Aggregate Review Stats 
        const reviewStats = await Review.aggregate([
            { $group: { _id: null, avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
        ]);

        return {
            data: {
                totalVendors,
                approvedVendor,
                pendingVendors,
                rejectedVendor,
                blockedUsers,
                activeStaff,
                inactiveStaff,
                activeUsers,
                vipUsers,
                newUsers,
                suspetedUsers,
                inactiveUsers,
                inactiveCategory,


                totalStaffs,
                totalUsers,
                totalCategories,
                roles,
                permissions,

                totalCartedProducts,

                totalProducts: productStats[0].totalProducts[0]?.count || 0,
                mostViewedProducts: productStats[0].mostViewedProducts,
                bestSellingProducts: productStats[0].bestSellingProducts,

                totalOrders: orderStats[0].totalOrders[0]?.count || 0,
                deliveredOrders: orderStats[0].deliveredOrders[0]?.count || 0,
                cancelledOrders: orderStats[0].cancelledOrders[0]?.count || 0,
                pending: orderStats[0]?.pending[0]?.count || 0,
                totalEarning: orderStats[0].totalEarning[0]?.total || 0,
                avgDispatchTime: orderStats[0].avgDispatchTime[0]?.avg || 0,

                totalReviews: reviewStats[0]?.totalReviews || 0,
                avgRating: reviewStats[0]?.avgRating || 0,
                monthlySales: orderStats[0].monthlySales,
                revenue: revenues,
            },
            success: true,
            status: 200,
        }
    } catch (error) {
        return res.status(error.status).json({
            error: error.message || `Internal Server Error '${error}'`
        });
    }
}

export const GetVendorDashboard_ById = async (vendorId) => {
    try {

        const { selectedYear, range, page } = filter;

        const vendorObjectId = new mongoose.Types.ObjectId(vendorId);

        const { startDate, endDate, startMonth, endMonth } = GetStartAndEndDate_H(selectedYear, range, page);

        const yearFilter = {
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            }
        }

        // Fetch Static Vendor Information
        const vendor = await Vendor.findById(vendorId).lean();
        if (!vendor) return { status: 400, error: 'Vendor not found' };

        // Aggregate Product Stats
        const productStats = await Product.aggregate([
            { $match: { vendorId: new mongoose.Types.ObjectId(vendorId) } },
            {
                $facet: {
                    // 1. Total products count
                    totalProducts: [
                        { $count: "count" }
                    ],

                    // 2. Most viewed products
                    mostViewedProducts: [
                        { $sort: { views: -1 } },   // High views first
                        { $limit: 10 },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                views: 1,
                                thumbnail: 1,
                                price: 1
                            }
                        }
                    ],

                    // 3. Top selling products (optional)
                    bestSellingProducts: [
                        {
                            $lookup: {
                                from: "orderitems",
                                localField: "_id",
                                foreignField: "product",
                                as: "sales"
                            }
                        },
                        {
                            $addFields: {
                                totalSold: { $sum: "$sales.quantity" }
                            }
                        },
                        { $sort: { totalSold: -1 } },
                        { $limit: 10 }
                    ]
                }
            }
        ]);

        // Aggregate Order Stats
        const orderStats = await Order.aggregate([
            { $match: { vendorId: new mongoose.Types.ObjectId(vendorId) } },
            {
                $facet: {
                    totalOrders: [
                        { $count: 'count' },
                    ],
                    deliveredOrders: [
                        { $match: { status: 'delivered' } },
                        { $count: 'count' },
                    ],
                    cancelledOrders: [
                        { $match: { status: { $in: ['cancelled'] } } }, { $count: 'count' }

                    ],
                    pending: [
                        { $match: { status: { $in: ["processing", "pending"] } } },
                        { $count: "count" }
                    ],
                    totalEarning: [
                        { $match: { paymentStatus: 'paid' } },
                        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
                    ],
                    avgDispatchTime: [
                        { $match: { status: 'delivered' } },
                        { $group: { _id: null, avg: { $avg: '$dispatchTime' } } }
                    ],
                    monthlyRevenue: [
                        { $match: { paymentStatus: 'paid', yearFilter, } },
                        {
                            $group: {
                                _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                                revenue: { $sum: '$totalAmount' }
                            }
                        }
                    ],
                    monthlySales: [
                        { $match: { paymentStatus: 'paid', yearFilter } },
                        { $group: { _id: { month: { $month: '$createdAt' } }, sales: { $sum: '$totalAmount' } } },
                        { $sort: { '_id.month': 1 } }
                    ],
                }
            }
        ]);

        const monthsName = ['January', 'Feburary', 'March', 'April', 'May', 'Jun',
            'July', 'August', 'September', 'October', 'November', 'December'];

        const monthlyRevenue = [];
        for (let m = startMonth; m <= endMonth; m++) {
            const found = orderStats[0].monthlyRevenue.find(d => d._id.month === m + 1);

            monthlyRevenue.push({
                monthNumber: m + 1,
                monthName: monthsName[m],
                revenue: found ? found.revenue : 0
            });
        }

        //Aggregate Review Stats 
        const reviewStats = await Review.aggregate([
            { $match: { vendorId: vendorObjectId } },
            { $group: { _id: null, avgRating: { $avg: '$rating' }, totalReviews: { $count: {} } } },
        ])

        return {
            data: {
                totalProducts: productStats[0].totalProducts[0]?.count || 0,

                totalOrders: orderStats[0].totalOrders[0]?.count || 0,
                deliveredOrders: orderStats[0].deliveredOrders[0]?.count || 0,
                cancelledOrders: orderStats[0].cancelledOrders[0]?.count || 0,
                pending: orderStats[0]?.pending[0]?.count || 0,
                totalEarning: orderStats[0].totalEarning[0]?.total || 0,
                avgDispatchTime: orderStats[0].avgDispatchTime[0]?.avg || 0,
                totalReviews: reviewStats[0]?.totalReviews || 0,
                monthlySales: orderStats[0]?.monthlySales[0]?.sales || 0,
                revenue: monthlyRevenue,
            },
            success: true,
            status: 200,
        }
    } catch (error) {
        return res.status(error.status).json({
            error: error.message || `Internal Server Error '${error}'`
        });
    }
}

export const GetStaffManagerDashboard = async (user) => {
    try {

        const totalStaffs = await Staff.countDocuments();
        const activeStaff = await Staff.countDocuments({ isActive: true });
        const inactiveStaff = await Staff.countDocuments({ isActive: false });

        const recentStaffs = await Staff.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('name email, isActive createdAt');

        const totalRoles = await Role.countDocuments();

        return {
            status: 200,
            success: true,
            data: {
                totalStaffs,
                activeStaff,
                inactiveStaff,
                totalRoles,
                recentStaffs,
            },
        };
    } catch (error) {
        return res.status(error.status).json({
            error: error.message || `Internal Server Error '${error}'`
        });
    }
}

export const GetVendorManagerDashboard = async () => {
    try {
        const totalVendors = await Vendor.countDocuments();
        const approvedVendors = await Vendor.countDocuments({ status: 'approved' });
        const pendingVendors = await Vendor.countDocuments({ status: 'pending' });
        const rejectedVendors = await Vendor.countDocuments({ status: 'rejected' });

        const recentVendors = await Vendor.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("name email isApproved createdAt");

        return {
            status: 200,
            success: true,
            data: {
                totalVendors,
                approvedVendors,
                pendingVendors,
                rejectedVendors,
                recentVendors
            },
        }

    } catch (error) {
        return res.status(error.status).json({
            error: error.message || `Internal Server Error '${error}'`
        });
    }
}

export const GetUserManagerDashboard = async () => {
    try {

        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const suspectedUsers = await User.countDocuments({ status: 'at_risk' });
        const inactiveUsers = await User.countDocuments({ status: 'inactive' });
        const blockedUsers = await User.countDocuments({ status: 'blocked' });
        const vipUsers = await User.countDocuments({ status: 'vip' });
        const newUsers = await User.countDocuments({ status: 'new' });

        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('name email, status createdAt');

        return {
            status: 200,
            success: true,
            data: {
                totalUsers,
                activeUsers,
                suspectedUsers,
                inactiveUsers,
                blockedUsers,
                vipUsers,
                newUsers,
                recentUsers,
            },
        };
    } catch (error) {
        return res.status(error.status).json({
            error: error.message || `Internal Server Error '${error}'`
        });
    }
}

export const GetProductManagerDashboard = async () => {
    try {
        const totalProducts = await Product.countDocuments();
        const approvedProducts = await Product.countDocuments({ status: 'approved' });
        const pendingProducts = await Product.countDocuments({ status: 'pending' });
        const rejectedProducts = await Product.countDocuments({ status: 'rejected' });

        const topProducts = await Product.find()
            .sort({ salesCount: -1 })
            .limit(5);

        const latestProducts = await Product.find()
            .sort({ createdAt: -1 })
            .limit(10);

        return {
            status: 200,
            success: true,
            data: {
                totalProducts,
                approvedProducts,
                pendingProducts,
                rejectedProducts,
                topProducts,
                latestProducts,
            },
        }

    } catch (error) {
        return res.status(error.status).json({
            error: error.message || `Internal Server Error '${error}'`
        });
    }
}

export const GetOrderManagerDashboard = async () => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: "pending" });
        const deliveredOrders = await Order.countDocuments({ status: "shipped" });
        const cancelled = await Order.countDocuments({ status: "cancelled" });
        const refunded = await Order.countDocuments({ status: "refunded" });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const todayRevenue = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: today, $lte: tomorrow },
                    paymentStatus: 'paid'
                }
            },
            {
                $group: { _id: null, revenue: { $sum: '$totalAmount' } }
            }
        ]);

        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('userId', 'name email');


        return {
            status: 200,
            success: true,
            data: {
                totalOrders,
                pendingOrders,
                deliveredOrders,
                cancelled,
                refunded,
                todayRevenue: todayRevenue[0]?.revenue || 0,
                recentOrders,
            },
        }
    } catch (error) {
        return res.status(error.status).json({
            error: error.message || `Internal Server Error '${error}'`
        });
    }
}

export const GetAccountManagerDashboard = async () => {
    try {

        return {
            status: 200,
            success: true,
            data: {
            },
        }
    } catch (error) {
        return res.status(error.status).json({
            error: error.message || `Internal Server Error '${error}'`
        });
    }
}