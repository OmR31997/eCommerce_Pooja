import mongoose from "mongoose";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { ErrorHandle } from "../utils/fileHelper.js";

export const GetCarts = async (user, filter) => {
    try {
        const { id: vendorId, role } = user;
        const { sortBy, createdAt } = filter;
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

export const GetCartById = async (cardId) => {
    try {
        const catrItem = await Cart.findById(cardId).populate('productId');

        if (!catrItem) {
            return { status: 404, error: 'No one item carted', success: false };
        }

        return {
            status: 200,
            message: 'Data fetched successfully',
            data: catrItem,
            success: true,
        };

    } catch (error) {
        console.log("Cart Fetch Error:", error.message);
        return {
            status: 500,
            success: false,
            error: error.message
        };
    }
}

export const AddToCart = async (cartData) => {
    try {
        const { productId, quantity = 1 } = cartData;

        const product = await Product.findById(productId);

        if (!product || product.stock < quantity) {
            return {
                status: 404,
                error: `Product not found or stock not available with the given id`,
                success: false,
            };
        }

        let cart = await Cart.findOne({ userId: cartData.userId });

        if (!cart) {
            cart = new Cart({
                userId,
                items: [{
                    productId,
                    quantity,
                    price: product.price,
                    subtotal: quantity * product.price
                }],
                totalAmount: subtotal,
            });
        }
        else {

            const existItemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

            if (existItemIndex > -1) {
                cart.items[existItemIndex].quantity += quantity;
                cart.items[existItemIndex].subtotal = cart.items[existItemIndex].quantity * cart.items[existItemIndex].price;
            }
            else {
                cart.items.push()
            }

            // // Recalculate Total Amount
            cart.totalAmount = cart.items.reduce((accume, currentItem) => accume + currentItem.subtotal, 0)

        }

        const response = await cart.save();

        return {
            status: 200,
            message: 'Item Carted successfully',
            data: response,
            success: true,
        };

    } catch (error) {
        const handled = await ErrorHandle(error, 'AddToCart');
        return handled || { status: 500, success: false, error: 'Internal Server Error' };
    }
}

export const DecrementItemQty = async (cartData) => {
    try {
        const { cartId, productId, quantity = 1, userId } = cartData;

        const cart = await Cart.findOne({ _id: cartId, userId }).populate('productId');

        if (!cart) {
            return { status: 404, success: false, error: `Cart not found for ${cartId}` };
        }

        const item = cart.items.find(item => item.productId._id.toString() === productId);

        if (!item) {
            return { status: 404, success: false, error: "Item not found in cart" };
        }

        if (item.quantity <= 0) {
            return { status: 400, success: false, error: "Item quantity already zero" };
        }

        item.quantity -= quantity;

        if (item.quantity <= 0) {
            cart.items = cart.items.filter(item => item.productId.toString() !== productId)
        }
        else {
            item.subtotal = item.quantity * item.price;
        }

        cart.totalAmount = cart.items.reduce((accume, current) => sum + item.subtotal, 0);

        await cart.save();

        return { status: 200, success: true, message: 'Item quantity updated successfully.', data: cart, }


    } catch (error) {
        const handled = await ErrorHandle(error, 'CreateStaff');
        return handled || { status: 500, success: false, error: 'Internal Server Error' };
    }
}

export const DeleteCartetItems = async (cartId) => {
    try {
        
    } catch (error) {
        return { status: 500, success: false, error: 'Internal Server Error' };
    }
}