import mongoose from "mongoose";
import { Product } from "../product/product.model.js";
import { Cart } from "./cart.model.js";
import { BuildPopulateStages_H, BuildQuery_H, Pagination_H, success } from "../../utils/helper.js";

// READ-------------------------------------------------|
export const GetCarts = async (keyVal, options = {}) => {

    const { filter = {}, pagingReq = {}, populates = {}, baseUrl } = options;

    const matchedQuery = BuildQuery_H(filter, 'cart');
    const populateStages = BuildPopulateStages_H(populates);

    const pipeline = [
        ...populateStages,
        { $match: matchedQuery },
    ];

    if (keyVal.userId) {
        pipeline.push({
            $match: { userId: new mongoose.Types.ObjectId(keyVal.userId) },
        });
    }

    pipeline.push(
        { $unwind: '$items' },
        {
            $group: {
                _id: '$_id',
                userId: { $first: { name: '$user.name', status: '$user.status', _id: '$user._id' } },
                items: {
                    $push: {
                        productId: '$items.productId',
                        name: '$product.name',
                        quantity: '$items.quantity',
                        price: '$items.price',
                        subtotal: '$items.subtotal'
                    },
                },
                shipping: { $first: '$shipping' }
            },
        },
    )

    pipeline.push(
        {   // ---- Pagination Meta ----
            $facet: {
                metadata: [{ $count: 'total' }],
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
        }
    );

    const result = await Cart.aggregate(pipeline);

    const total = result[0]?.metadata[0]?.total || 0;

    const carts = result[0]?.data;

    let pagination = Pagination_H(pagingReq.page, pagingReq.limit, undefined, total, baseUrl, filter);

    delete pagination.skip;

    return success({ message: 'Data fetched successfully', pagination, data: carts });
}

export const GetCartById = async (keyVal, productId) => {

    const { vendorId } = keyVal;
    if (keyVal?.vendorId) delete keyVal.vendorId;

    const cart = await Cart.findOne(keyVal)
        .populate({ path: 'items.productId', select: 'vendorId name' }).lean();

    if (!cart) {
        throw {
            status: 404,
            message: `Cart item not for ID: '${keyVal._id}'`,
        }
    }

    if (productId) {
        cart.items = cart.items.filter(item => item.productId?._id.toString() === productId);

        if (cart.items.length === 0) {
            throw {
                status: 404,
                message: `Cart item not for ID: '${keyVal._id}'`,
            }
        }
    }

    if (vendorId) {
        cart.items = cart.items.filter(item => item.productId?.vendorId?.toString() === vendorId);

        if (cart.items.length === 0) {
            throw {
                status: 404,
                message: `Cart does not contain items for this vendor`,
                success: false
            };
        }
    }

    return success({ message: 'Data fetched successfully', data: cart })
}

// CREATE | UPDATE--------------------------------------|
const ToMoney = (num_val) => parseFloat(num_val.toFixed(2));
export const SaveShipping = async (keyVal, reqData) => {

    const cart = await Cart.findOneAndUpdate(keyVal, reqData, { new: true, upsert: true });

    if (!cart) {
        throw {
            status: 404,
            message: `Cart not found for ID: '${keyVal._id}'`
        }
    }

    return success({ message: 'Shipping updated successfully', data: { cart: cart.shipping } });
}

export const AddToCart = async (keyVal, reqData) => {

    const { productId, quantity } = reqData;

    let cart = undefined;
    let index = undefined;
    if (quantity <= 0) {
        throw {
            status: 400,
            message: "Quantity must be greater than 0"
        }
    }

    // Fetch with product & validate stock also
    const product = await Product.findById(productId);

    if (!product || product.stock < quantity) {
        throw {
            status: 404,
            message: `Product not found or Out-Of-Stock for productId: '${productId}'`
        }
    }

    const productPrice = ToMoney(product.price);
    const productDiscount = ToMoney(product.discount) / 100;
    const price = productPrice - (productPrice * productDiscount);
    const subtotal = ToMoney(price * quantity);

    const existingCart = await Cart.findOne(keyVal);

    if (!existingCart) {
        // Add New

        const newCart = {
            ...keyVal,
            items: [{ ...reqData, price, subtotal }],
            totalAmount: subtotal
        }

        cart = await Cart.create(newCart);
    }
    else {
        // Update Existing

        index = existingCart.items.findIndex(item => item.productId.toString() === productId.toString());

        if (index > -1) {
            existingCart.items[index].quantity += reqData.quantity;
            existingCart.items[index].price = price;
            existingCart.items[index].subtotal = ToMoney(existingCart.items[index].quantity * price);
        }
        else {
            existingCart.items.push({ productId, quantity, price, subtotal });
        }

        existingCart.totalAmount = ToMoney(existingCart.items.reduce((sum, item) => sum + item.subtotal, 0));

        cart = await existingCart.save();
    }

    return success({
        message: 'Item Carted successfully',
        data: {
            _id: cart._id,
            userId: keyVal.userId,
            items: {
                _id: productId,
                quantity: cart.items[index].quantity
            }
        }
    });
}

// DELETE CART SERVICES---------------------------------------|
export const DecrementItemQty = async (keyVal) => {
    const { productId, quantity = 1 } = keyVal;

    delete keyVal.productId;

    const cart = await Cart.findOne(keyVal).populate({ path: 'items.productId' });

    if (!cart) {
        throw {
            status: 404,
            message: `Cart not found for ID: ${keyVal._id}`
        }
    }

    const item = cart.items.find(item => item.productId._id.toString() === productId);

    if (!item) {
        throw {
            status: 404,
            message: "Item not found in cart"
        };
    }

    if (item.quantity <= 0) {
        throw {
            status: 400,
            message: "Item quantity already zero"
        };
    }

    item.quantity -= quantity;

    if (item.quantity <= 0) {
        cart.items = cart.items.filter(item => item.productId._id.toString() !== productId)
    }
    else {
        item.subtotal = item.quantity * item.price;
    }

    cart.totalAmount = cart.items.reduce((accume, current) => accume + current.subtotal, 0);

    await cart.save();

    return success({
        message: 'Item quantity updated successfully.',
        data: {
            _id: cart._id,
            userId: keyVal.userId,
            items: {
                _id: productId,
                quantity: item.quantity
            }
        }
    });

}

export const DeleteCart = async (keyVal) => {
    const cart = await Cart.findOneAndDelete(keyVal);

    if (!cart) {
        throw {
            status: 404,
            message: `Cart not found for ID: ${keyVal._id}`
        }
    }

    return success({ message: 'Cart deleted successfully', data: cart })
}