import { ErrorHandle_H } from "../../utils/helper.js";
import { AddToCart, DecrementItemQty, DeleteCart, GetCartById, GetCarts, SaveShipping } from "./cart.service.js";

// READ---------------------------------------|
export const get_carts = async (req, res, next) => {
    try {
        const {
            page = 1, limit = 10,
            search, productIds,
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
                search, productIds
            },

            populates: {
                user: { path: 'userId', select: 'name status totalSpents' },
                product: { path: 'items.productId', select: 'vendorId name status' }
            }
        }

        const response = await GetCarts(keyVal, options, undefined);

        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

export const get_cart_by_id = async (req, res, next) => {
    try {
        const keyVal = {
            _id: req.params.cartId,
            ...(req.user.role === "user"
                ? { userId: req.user.id }
                : {}),
        }

        const response = await GetCartById(keyVal, undefined);

        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

// UPDATE & CREATE CONTROLLERS-----------------------|
export const buy_now = async (req, res, next) => {
    try {
        const { productId, quantity = 1 } = req.body;

        const userId = req.query.userId;

        if (userId && req.user.role === 'user' && userId !== req.user.id) {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to create for another user`
            }
        }

        const keyVal = {
            ...(req.user.role === 'user'
                ? { userId: req.user.id }
                : ['admin', 'super_admin'].includes(req.user.role) ? { userId } : undefined),
        }

        const reqData = {
            productId,
            quantity
        };

        const response = await AddToCart(keyVal, reqData);

        return res.status(201).json({ ...response, goTo: '/checkout/shipping' });

    } catch (error) {
        next(error);
    }
}

export const checkout_shipping = async (req, res, next) => {
    try {
        const {
            shippingTo, phone,
            addressLine1, addressLine2,
            landmark, city, state,
            postalCode
        } = req.body;

        const userId = req.query.userId;

        if (userId && req.user.role === 'user' && userId !== req.user.id) {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to create for another user`
            }
        }

        const keyVal = {
            _id: req.user.role === "user" ? req.user.id : userId
        }

        const reqData = {
            shipping: {
                name: shippingTo, phone,
                addressLine1, addressLine2,
                landmark, city, state,
                postalCode
            },
        }

        const response = await SaveShipping(keyVal, reqData);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const add_to_cart = async (req, res, next) => {
    try {
        const { productId } = req.body;

        if (req.user.role !== 'user') {
            throw {
                status: 405,
                message: `Method Not Allowed`
            }
        }

        const keyVal = { userId: req.user.id };
        const reqData = { productId, quantity: 1 };

        const response = await AddToCart(keyVal, reqData);

        return res.status(201).json(response);

    } catch (error) {
        next(error);
    }
}

// UPDATE & DELETE CONTROLLERS---------------------------|
export const delete_item_from_cart = async (req, res, next) => {
    try {

        if (req.user.role !== 'user') {
            throw {
                status: 401,
                message: `You don't have permission to delete cart`
            }
        }

        const keyVal = {
            _id: req.params.cartId,
            userId: req.user.id,
            productId: req.params.pId
        }

        const response = await DecrementItemQty(keyVal);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const delete_cart = async (req, res, next) => {
    try {
        if (req.user.role !== 'user') {
            throw {
                status: 401,
                message: `You don't have permission to delete cart`
            }
        }

        const keyVal = {
            _id: req.params.cartId,
            userId: req.user.id
        }

        const response = await DeleteCart(keyVal);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}