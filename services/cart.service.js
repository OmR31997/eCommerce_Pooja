import mongoose from "mongoose";
import { Cart } from "../models/cart.model.js";

export const GetCarts = async (user, filter) => {
    try {
        const { id: vendorId, role } = user;
        const {sortBy, createdAt} = filter;
        let carts = [];

        const sortField = ['totalSpents', 'createdAt'].includes(sortBy) ? sortBy : 'createdAt';
        const sortDirection = filter.orderSequence === 'asc' ? 1 : -1;
        const sortOption = { [sortField === 'totalSpents' ? 'totalAmount' : sortField]: sortDirection };

        // Vendor — Only carts containing vendor's products
        if (role === 'vendor') {
            carts = await Cart.aggregate([
                { $unwind: '$items' },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'items.productId',
                        foreignField: '_id',
                        as: 'productData',
                    }
                },
                { $unwind: '$productData' },
                {
                    $match: { 'productData.vendorId': new mongoose.Types.ObjectId(vendorId) }
                },
                {
                    $group: {
                        _id: '$_id',
                        userId: { $first: '$userId' },
                        items: { $push: '$items' },
                        totalSpents: { $first: '$totalAmount' },
                        createdAt: { $first: '$createdAt' },
                        updatedAt: { $first: '$updatedAt' },
                    }
                },
                { $sort: { createdAt: -1 } }
            ]);
        }
        else if (["admin", "super_admin", "staff"].includes(role)) {
            const list = await Cart.find()
                .populate("items.productId")
                .sort(sortOption);

            carts = list.map(l => ({
                _id: l._id,
                userId: l.userId,
                items: l.items,
                totalSpents: l.totalAmount,
                createdAt: l.createdAt,
                updatedAt: l.updatedAt,
            }))
        }

        return {
            status: 200,
            success: true,
            message: 'Data fetched successfully.',
            counts: carts.length,
            data: carts
        }

    } catch (error) {
        console.log("Cart Fetch Error:", error.message);
        return {
            status: 500,
            success: false,
            error: error.message
        };
    }
}