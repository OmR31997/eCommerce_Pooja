import mongoose from "mongoose";
import { Product } from "../product/product.model.js";
import { BuildPopulateStages, BuildQuery, Pagination } from "../../utils/fileHelper.js";
import { Cart } from "./cart.model.js";

// READ CART SERVICES----------------------------------------|
export const GetCarts = async (keyVal = {}, options = {}) => {

    const { filter = {}, pagingReq = {}, populates = {}, baseUrl } = options;
    let pagination = undefined;
    let total = 0;

    const matchedQuery = BuildQuery(filter, 'cart');
    const populateStages = BuildPopulateStages(populates);

    const pipeline = [
        { $match: matchedQuery },
        // {$unwind: '$items'},
        ...populateStages
    ];

    if (keyVal.userId) {
        pipeline.push({
            $match: { userId: new mongoose.Types.ObjectId(keyVal.userId) },
        });
    }

    if (keyVal.vendorId) {
        pipeline.push({  // ---- Restrict items to only products of this vendor ----
            $match: { 'items.vendorId': new mongoose.Types.ObjectId(keyVal.vendorId) },
        });
    }

    if (filter.search) {
        pipeline.push({
            $match: {
                'items.productId.name': { $regex: filter.search, $options: 'i' }
            }
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
                        businessName: '$vendor.businessName',
                        productId: '$items.productId',
                        name: '$product.name',
                        quantity: '$items.quantity',
                        price: '$items.price',
                        subtotal: '$items.subtotal'
                    },
                },
                shipping: { $first: '$shipping' }
            },
        }

    )

    pipeline.push(
        {   // ---- Pagination Meta ----
            $facet: {
                metadata: [{ $count: 'total' }]
                ,
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

    total = result[0]?.metadata[0]?.total || 0;

    const carts = result[0]?.data;

    pagination = Pagination(pagingReq.page, pagingReq.limit, undefined, total, baseUrl, filter);
    delete pagination.skip;

    return { status: 200, success: true, message: 'Data fetched successfully', total, pagination, data: carts }
}

export const GetCartById = async (cartId, keyVal = {}, productId) => {
    const { userId, vendorId } = keyVal;
    const cart = await Cart.findOne({ _id: cartId, userId })
        .populate({ path: 'items.productId', select: 'vendorId name' }).lean();

    if (!cart) {
        throw {
            status: 404,
            message: `Cart item not for ID: '${cartId}'`,
        }
    }

    if (productId) {
        cart.items = cart.items.filter(item => item.productId?._id.toString() === productId.toString())

        if (cart.items.length === 0) {
            throw {
                status: 404,
                message: `Cart item not for ID: '${cartId}'`,
            }
        }
    }

    if (vendorId) {
        cart.items = cart.items.filter(item => item.productId?.vendorId?.toString() === vendorId.toString());

        if (cart.items.length === 0) {
            throw {
                status: 404,
                message: `Cart does not contain items for this vendor`,
                success: false
            };
        }
    }

    return { status: 200, message: 'Data fetched successfully', data: cart, success: true }
}
// UPDATE CART SERVICES---------------------------------------|
const ToMoney = (num_val) => parseFloat(num_val.toFixed(2));
export const SaveShipping = async (reqData) => {
    const { userId, shipping } = reqData;
    const cart = await Cart.findOneAndUpdate({ userId }, { shipping }, { new: true, upsert: true });

    return { status: 200, message: 'Shipping updated successfully', data: { cart: cart.shipping }, success: true };
}

export const AddToCart = async (userId, cartData) => {

    const { productId, quantity } = cartData;

    let cart = undefined;
    if (quantity <= 0) {
        throw {
            status: 400,
            message: "Quantity must be greater than 0",
            success: false
        }
    }

    // Fetch with product & validate stock also
    const product = await Product.findById(cartData.productId);

    if (!product || product.stock < cartData.quantity) {
        throw {
            status: 404,
            message: `Product not found or Out-Of-Stock for productId: '${cartData.productId}'`,
            success: false
        }
    }

    const productPrice = ToMoney(product.price);
    const productDiscount = ToMoney(product.discount) / 100;
    const price = productPrice - (productPrice * productDiscount);
    const subtotal = ToMoney(price * Number(cartData.quantity));

    const existingCart = await Cart.findOne({ userId });

    if (!existingCart) {
        // Add New

        const newCart = {
            userId,
            items: [{ ...cartData, price, subtotal }],
            totalAmount: subtotal
        }

        cart = await Cart.create(newCart);
    }
    else {
        // Update Existing

        const index = existingCart.items.findIndex(item => item.productId.toString() === productId.toString());

        if (index > -1) {
            existingCart.items[index].quantity += cartData.quantity;
            existingCart.items[index].price = price;
            existingCart.items[index].subtotal = ToMoney(existingCart.items[index].quantity * price);
        }
        else {
            existingCart.items.push({ productId, quantity, price, subtotal });
        }

        existingCart.totalAmount = ToMoney(existingCart.items.reduce((sum, item) => sum + item.subtotal, 0));

        cart = await existingCart.save();
    }

    return {
        status: 200,
        message: 'Item Carted successfully',
        data: { cart },
        success: true,
    };
}

// DELETE CART SERVICES---------------------------------------|

export const DecrementItemQty = async (cartData) => {
    const { cartId, productId, quantity = 1, userId } = cartData;

    const cart = await Cart.findOne({ _id: cartId, userId }).populate({ path: 'items.productId' });

    if (!cart) {
        throw {
            status: 404,
            message: `Cart not found for ${cartId}`
        }
    }

    const item = cart.items.find(item => item.productId._id.toString() === productId.toString());

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
        cart.items = cart.items.filter(item => item.productId._id.toString() !== productId.toString())
    }
    else {
        item.subtotal = item.quantity * item.price;
    }

    cart.totalAmount = cart.items.reduce((accume, current) => accume + current.subtotal, 0);

    await cart.save();

    return { status: 200, success: true, message: 'Item quantity updated successfully.', data: cart, }

}

export const DeleteCart = async (cartId, userId) => {
    const cart = await Cart.findOneAndDelete({ _id: cartId, userId });

    if (!cart) {
        throw {
            status: 404,
            message: `Cart not found for ${cartId}`
        }
    }

    return { status: 200, message: 'Cart deleted successfully', data: cart, success: true }
}