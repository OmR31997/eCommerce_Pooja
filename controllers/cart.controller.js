import { Cart } from '../models/cart.model.js';
import { Product } from '../models/product.model.js';

/* **create_cart logic here** */
export const add_to_cart = async (req, res) => {
    try {
        const { productId, userId, quantity = 1 } = req.body;

        const product = await Product.findById(productId);

        if (!product || product.stock < quantity) {
            return res.status(404).json({
                error: `Product not found or stock not available with the given id`,
                success: false,
            });
        }

        const subTotal = quantity * product.price

        const cartData = {
            userId: req.user.role === 'user' ? req.user.id : userId || undefined,
            items: [{
                productId: productId || undefined,
                quantity: parseInt(quantity),
                price: product.price,
                subtotal: subTotal,
            }],
            totalAmount: subTotal
        }

        let cart = await Cart.findOne({ userId: cartData.userId });

        if (!cart) {
            cart = new Cart(cartData);
        }
        else {
            // check if product already exist in cart 
            const existingItemIndex = cart.items.findIndex((item) =>
                item.productId.toString() === productId,
            );

            // console.log(existingItemIndex);
            if (existingItemIndex > -1) {
                cart.items[existingItemIndex].quantity += quantity;
                cart.items[existingItemIndex].subtotal =
                    cart.items[existingItemIndex].quantity *
                    cart.items[existingItemIndex].price;
            }
            else {
                cart.items.push(cartData.items);
            }

            // Recalculate total amount
            cart.totalAmount = cart.items.reduce((accume, currentItem) => accume + currentItem.subtotal, 0);
        }

        await cart.save();

        return res.status(200).json({
            message: 'Carted item successfully',
            data: cartData,
            success: true,
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = {};

            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message
            });

            return res.status(400).json({
                errors,
                message: 'Validation failed',
                success: false,
            });
        }

        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

/* **view_cart logic here** */
export const view_cart = async (req, res) => {
    try {

        if (req.user.role === 'user') {
            const carts = await Cart.findOne({ userId: req.user.id })
                .populate({ path: 'userId', select: 'name' })
                .populate({ path: 'items.productId', select: 'name' })
                .select('-__v -items._id');

            if (!carts) {
                return res.status(404).json({
                    error: 'Product not found'
                });
            }
        }

        const carts = await Cart.find()
            .populate({ path: 'userId', select: 'name' })
            .populate({ path: 'items.productId', select: 'name' })
            .select('-__v -items._id');

        if (!carts || carts.length === 0) {
            return res.status(404).json({
                error: 'Product not found'
            });
        }
        return res.status(200).json({
            data: carts,
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

/* **remove_cart_item logic here** */
export const remove_cart_item = async (req, res) => {
    try {
        const cartId = req.params.id;
        const { id } = req.user;

        const cart = await Cart.findOne({ $and: { _id: cartId, userId: id } })
            .populate({ path: 'items.productId', select: 'sku' });

        if (!cart) {
            return res.status(404).json({
                error: 'Cart not found for this user',
                success: false,
            });
        }

        const itemIndex = cart.items.findIndex((item) => item.productId && item.productId.sku === sku);

        if (itemIndex === -1) {
            return res.status(404).json({
                error: 'Product not found in the cart',
                success: false,
            });
        }

        // Remove item from the cart
        cart.items.splice(itemIndex, 1);

        //Recalculate total amount
        cart.totalAmount = cart.items.reduce((accume, currentItem) => accume + currentItem.subtotal, 0);

        const response = await cart.save();

        return res.status(200).json({
            message: 'Product removed successfully from cart',
            data: response,
            success: true,
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

/* **clear_cart logic here** */
export const clear_cart = async (req, res) => {
    try {
        const { id } = req.user;
        const responseCart = await Cart.findOneAndDelete({ userId: id });

        if (!responseCart) {
            return res.status(204).json({
                error: 'Carted item not found for this user',
                success: false,
            });
        }

        return res.status(200).json({
            message: 'Carted products removed successfully',
            data: responseCart,
            success: true,
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}
