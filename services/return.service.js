import { Product } from "../models/product.model";
import { Order } from '../models/order.model.js';

export const CreateReturn = async (reqIds, reqData) => {
    const { orderId, userId } = reqIds;
    const order = await Order.findOneAndUpdate({orderId, userId}, {reqData});

    if (!order) {
        throw {
            status: 404,
            message: `Product not found for ID: '${userId}'`
        }
    }
}