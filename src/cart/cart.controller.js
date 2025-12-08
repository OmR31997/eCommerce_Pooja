import { ErrorHandle_H } from "../../utils/helper.js";
import { AddToCart, DecrementItemQty, DeleteCart, GetCartById, GetCarts, SaveShipping } from "./cart.service.js";

// \READ CART CONTROLLERS--------------------|

export const get_carts = async (req, res) => {
    try {
        const {
            page = 1, limit = 10,
            search,
            sortBy = 'createdAt', orderSequence = 'desc'
        } = req.query;

        const keyVal = req.user.role === 'user'
            ? { userId: req.user.id }
            : req.user.role === 'vendor'
                ? { vendorId: req.user.id }
                : {}

        const options = {
            baseUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,

            pagingReq: {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy, orderSequence
            },

            filter: {
                search
            },

            populates: {
                user: { path: 'userId', select: 'name status totalSpents' },
                product: { path: 'items.productId', select: 'vendorId name status' }
            }
        }

        const { status, message, pagination, data, total, success } = await GetCarts(keyVal, options);

        return res.status(status).json({
            success,
            count: total,
            pagination,
            message,
            data
        });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

export const get_cart_by_cartId = async (req, res) => {
    try {
        const cartId = req.params.id;

        const keyVal = req.user.role === 'user'
            ? { userId: req.user.id }
            : req.user.role === 'vendor'
                ? { vendorId: req.user.id }
                : {}

        const { status, message, data, success } = await GetCartById(cartId, keyVal, undefined);

        return res.status(status).json({
            message,
            data,
            success,
        });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

export const get_cart_by_productId = async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const productId = req.params.pId;

        const keyVal = req.user.role === 'user'
            ? { userId: req.user.id }
            : req.user.role === 'vendor'
                ? { vendorId: req.user.id }
                : {}

        const { status, message, data, success } = await GetCartById(cartId, keyVal, productId);

        return res.status(status).json({
            message,
            data,
            success,
        });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

// UPDATE & CREATE CONTROLLERS-----------------------|
export const checkout_shipping = async (req, res) => {
    try {
        const {
            shippingTo, phone,
            addressLine1, addressLine2,
            landmark, city, state,
            postalCode, userId
        } = req.body;

        if (userId && req.user.role === 'user' && userId !== req.user.id) {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to create for another user`
            }
        }

        const reqData = {
            userId: req.user.role === 'user' ? req.user.id : userId,
            shipping: {
                name: shippingTo, phone,
                addressLine1, addressLine2,
                landmark, city, state,
                postalCode
            },
        }

        const { status, message, data, success } = await SaveShipping(reqData);

        return res.status(status).json({ message, data, success });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message })
        }

        return res.status(500).json({ error: error.message || error });
    }
}

export const buy_now = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        const userId = req.user.role === 'user'
            ? req.user.id
            : ['admin', 'super_admin'].includes(req.user.role) ? req.query.userId : undefined;

        const { status, message, data, success } = await AddToCart(userId, { productId, quantity });

        return res.status(status).json({
            message,
            data,
            goTo: '/checkout/shipping',
            success
        });

    } catch (error) {
        const handle = ErrorHandle_H(error);

        if (handle?.status)
            return res.status(handle.status).json({ error: handle.error, errors: handle.errors, success: false });

        return res.status(500).json({ error: error.message });
    }
}

export const add_to_cart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        if (req.user.role !== 'user') {
            throw {
                status: 401,
                message: `You don't have permission to delete cart`
            }
        }

        const userId = req.user.id;

        const { status, success, message, data } = await AddToCart(userId, { productId, quantity });

        return res.status(status).json({ message, success, data });

    } catch (error) {
        const handle = ErrorHandle_H(error);

        if (handle?.status)
            return res.status(handle.status).json({ error: handle.error, errors: handle.errors, success: false });

        return res.status(500).json({ error: error.message });
    }
}

// UPDATE & DELETE CONTROLLERS---------------------------|
export const delete_item_from_cart = async (req, res) => {
    try {

        const cartId = req.params.cartId;
        const productId = req.params.pId;

        if (req.user.role !== 'user') {
            throw {
                status: 401,
                message: `You don't have permission to delete cart`
            }
        }

        const userId = req.user.id;

        const { status, success, message, data } = await DecrementItemQty({ cartId, productId, quantity: parseInt(quantity), userId });

        return res.status(status).json({ message, data, success });

    } catch (error) {
        const handle = ErrorHandle_H(error);

        if (handle?.status)
            return res.status(handle.status).json({ error: handle.error, errors: handle.errors, success: false });

        return res.status(500).json({ error: error.message });
    }
}

export const delete_cart = async (req, res) => {
    try {

        const cartId = req.params.id;

        if (req.user.role !== 'user') {
            throw {
                status: 401,
                message: `You don't have permission to delete cart`
            }
        }

        const userId = req.user.id;

        const { status, success, message, data } = await DeleteCart(cartId, userId);

        return res.status(status).json({ message, data, success });

    } catch (error) {
        const handle = ErrorHandle_H(error);

        if (handle?.status)
            return res.status(handle.status).json({ error: handle.error, errors: handle.errors, success: false });

        return res.status(500).json({ error: error.message });
    }
}