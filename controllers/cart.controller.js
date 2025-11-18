import { Cart } from '../models/cart.model.js';
import { AddToCart, DecrementItemQty, GetCartById, GetCarts } from '../services/cart.service.js';
import { Pagination } from '../utils/fileHelper.js';

/* **create_cart logic here** */
export const add_to_cart = async (req, res) => {
    const { productId, quantity = 1 } = req.body;
    const { id: userId, role } = req.user;

    if (role === 'user') {

        const { status, error, errors, success, message, data } = await AddToCart({ productId, quantity: parseInt(quantity), userId });

        if (!success) {
            return res.status(status).json({ errors, error, message, })
        }

        return res.status(status).json({ message, data, success });
    }
}

/* **view_cart logic here** */
export const view_cart = async (req, res) => {
    try {
        const { page = 1, limit = 10, offset,
            sortBy = 'createdAt', orderSequence = 'desc' } = req.query;

        const parsedLimit = parseInt(limit);

        // Build Query
        const filter = { sortBy, orderSequence };

        const { status, success, error, data, counts } = await GetCarts(req.user, filter);

        if (!success) {
            return res.status(status).json({
                error,
                success,
            })
        }

        const { skip, currentPage, totalPages, nextUrl, prevUrl } = Pagination(
            parseInt(page), parsedLimit, offset, counts,
            `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`, filter);

        const paginated = data.slice(skip, skip + parsedLimit);


        return res.status(status).json({
            message: 'Data fetched succefully',
            pagination: {
                counts,
                prevUrl,
                nextUrl,
                currentPage,
                totalPages,
            },
            data: paginated,
            success,
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

/* **get_cart_item_byId logic here** */
export const get_cart_item_byId = async (req, res) => {

    const cartId = req.params.id;

    const { status, error, errors, success, message, data } = await GetCartById(cartId);

    if (!success) {
        return res.status(status).json({ errors, error, message, })
    }

    return res.status(status).json({ message, data, success });
}

/* **delete_to_cart logic here** */
export const delete_to_cart = async (req, res) => {
    const { cartId, productId, quantity } = req.body;
    const { userId } = req.user;

    const { status, success, errors, error, data } = await DecrementItemQty({ cartId, productId, quantity: parseInt(quantity), userId });

    if (!success) {
        return res.status(status).json({ errors, error, message, })
    }

    return res.status(status).json({ message, data, success });
}

/* **remove_cart_item logic here** */
export const remove_cart_item = async (req, res) => {
    try {
        const cartId = req.params.id;
        const userId = req.user.id;

        const cart = await Cart.findOne({ $and: { _id: cartId, userId } })
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
            message: 'Product removed successfully from the cart',
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