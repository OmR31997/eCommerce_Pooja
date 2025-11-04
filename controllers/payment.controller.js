import { Order } from '../models/order.model.js';
import { RazorPayInstance } from '../utils/razorpay.js';
import crypto from 'crypto';

/* **create_payment_order logic here** */
export const create_payment_order = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({
                error: `'amount' field must be required`,
                success: false,
            });
        }

        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: "receipt_" + Date.now(),
        };

        const order = await RazorPayInstance.orders.create(options);

        return res.status(200).json({
            message: 'Payment done successfully',
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false
        });
    }
}

/* **verify_payment logic here** */
export const verify_payment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = `${razorpay_order_id}|${razorpay_payment_id}`;

        const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

        if(expectedSignature === razorpay_signature) {
            const order = await Order.create({
                userId,
                totalAmount: req.body.amount,
                paymentMethod: 'Online',
                paymentStatus: 'paid',
                orderStatus: 'confirmed',
                paymentId: razorpay_payment_id,
            });

            return res.status(200).json({
                message: 'Payment verified',
                order,
                success: true,
            });
        }
        else {
            return res.status(400).json({
                error: 'Invalid signature',
                success: false,
            })
        }
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false
        });
    }
}