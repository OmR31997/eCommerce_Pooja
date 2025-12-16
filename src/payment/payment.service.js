import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Transaction } from '../transaction/transaction.model.js';
import { Notify } from '../notification/notification.service.js';
import { CreateOrderAfterPayment } from '../order/order.service.js';
import { success } from '../../utils/helper.js';

const Razor = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order (payment session)------------------------|
export const CreatePaymentByCustomer = async ({ userId, amount }) => {
    try {
        // Create Razorpay Order
        const result = await Razor.orders.create({

            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`
        });

        // Save transaction in DB
        const trxResult = await Transaction.create({
            userId,
            amount,
            razorOrderId: result.id,
            status: 'created',
            type: 'customer_payment'
        });

        await Notify.user(userId, {
            title: 'Payment Order Created',
            message: `Your payment order has been created, Transaction ID: ${trxResult._id}`,
            type: 'order_payment'
        });

        return success({
            message: 'Payment order created successfully',
            data: result
        })
    } catch (error) {
        throw error;
    }
}

//  Verify payment and create orders AFTER successful payment-----|
export const VerifyCustomerPayment = async (reqdata) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = reqdata;

    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign)
        .digest('hex');

    if (expectedSign !== razorpay_signature) {
        await Transaction.findOneAndUpdate({ razorOrderId: razorpay_order_id }, { status: 'failed' });

        throw {
            status: 400,
            message: 'Invalid signature'
        }
    }

    // Update Transaction
    const trxResult = await Transaction.findOneAndUpdate(
        { razorOrderId: razorpay_order_id },
        {
            status: 'success',
            razorPaymentId: razorpay_payment_id,
            verifiedAt: new Date()
        },
        { new: true }
    );

    if (!trxResult) {
        throw {
            status: 404,
            message: 'Transaction not found'
        };
    }

    // Create Order 
    const createdOrders = await CreateOrderAfterPayment({ userId, paymentSessionId: razorpay_order_id })

    await Notify.user(userId, {
        title: 'Payment Successfull',
        message: `Your payment was successfull and order have been place.`,
        type: 'payment'
    });

    for (const order of createdOrders) {
        await Notify.vendor(order.vendorId, {
            title: 'New Order Received',
            message: `You have received a new order #${order._id}.`,
            type: 'order'
        });
    }

    return success({
        message: `Payment verified and orders updated`,
        data: createOrders,
        transaction: trxResult._id
    });
}