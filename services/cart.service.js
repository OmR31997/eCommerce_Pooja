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

export const AddToCart = async (cartData, userId) => {
    const {productId, quantity} = cartData;

    if(quantity <= 0) {
        throw {
            status: 400,
            message: "Quantity must be greater than 0",
            success: false
        }
    }

    // Fetch with product & validate stock also
    const product = await Product.findById(cartData.productId).lean();

    if (!product || product.stock < cartData.quantity) {
        throw {
            status: 404,
            message: `Product not found or Out-Of-Stock for productId: '${cartData.productId}'`,
            success: false
        }
    }

    const price = product.price - ((product.price * product.discount) / 100);
    const subtotal = price * cartData.quantity;

    let result = undefined;

    const existing = await Cart.findOne({ userId });

    if (!existing) {
        // Add New

        const newCart = {
            userId,
            items: [{ ...cartData, price, subtotal }],
            totalAmount: subtotal
        }

        result = await Cart.create(newCart);
    }
    else {
        // Update Existing

        const index = existing.items.findIndex(item=> item.productId.toString() === productId);

        if (index > -1) {
            existing.items[index].quantity += cartData.quantity;
            existing.items[index].price = price;
            existing.items[index].subtotal = existing.items[index].quantity * price;
        }
        else {
            existing.items.push({productId, quantity, price, subtotal});
        }

        existing.totalAmount = existing.items.reduce((accume, current) => accume + current.subtotal, 0);
        
        result = await existing.save();
    }

    return {
        status: 200,
        message: 'Item Carted successfully',
        data: result,
        success: true,
    };
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