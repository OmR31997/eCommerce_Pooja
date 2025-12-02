import {Refund} from '../models/refund.model.js';
import { Order } from '../models/order.model.js';

export const RequestRefund = async (req, res) => {
    const { orderId, amount, reason } = req.body;
    const userId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    if (order.status !== "delivered")
        return res.status(400).json({ msg: "Refund only allowed after delivery" });

    const refund = await Refund.create({
        orderId,
        userId,
        amount,
        reason,
        status: "pending",
    });

    order.refundStatus = "requested";
    order.refundId = refund._id;
    await order.save();

    res.json({ msg: "Refund request submitted", refund });
};

const RequestRefund = async (orderId, userId) => {
  const order = await Order.findById(orderId);

  if (order.status !== "delivered")
    throw new Error("Refund not allowed.");

  const refund = await Refund.create({
    orderId,
    userId,
    status: "requested"
  });

  await NotificationService.Send(
    ADMIN_ID,
    "admin",
    "Refund Request",
    `User requested refund for order ${order.orderNo}`,
    "order"
  );

  return refund;
}
