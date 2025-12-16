import { CreatePaymentByCustomer, VerifyCustomerPayment } from "./payment.service.js";

// CREATE PAYMENT SESSION------------------------|
export const start_payment = async (req, res, next) => {
    try {

        if (req.user.role !== 'user') {
            throw {
                status: 401,
                message: `Unauthrized: payment system allow only for customer`
            }
        }

        const userId = req.user.id;
        const { amount } = req.body;
        const response = await CreatePaymentByCustomer({ userId, amount });

        return res.status(201).json(response);

    } catch (error) {

        next(error)
    }
}

// VERIFY PAYMENT--------------------------------|
export const confirm_payment = async (req, res, next) => {
    try {
        const {
            razorpay_order_id, razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (req.user.role !== 'user') {
            throw {
                status: 401,
                message: `Unauthrized: payment verification only for the customer`
            }
        }

        const payload = {
            razorpay_order_id, razorpay_payment_id,
            razorpay_signature,
            userId: req.user.id
        }

        const response = await VerifyCustomerPayment(payload);

        return res.status(200).json(response);
        
    } catch (error) {
        next(error);
    }
}