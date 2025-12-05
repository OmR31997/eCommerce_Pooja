import { Order } from '../order/order.model.js';

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