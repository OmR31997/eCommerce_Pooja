import { CreatePaymentByCustomer, VerifyCustomerPayment } from "./payment.service.js";

// ----------------------------------------CREATE PAYMENT SESSION-----------------------------------|
export const start_payment = async (req, res) => {
    try {

        if (req.user.role !== 'user') {
            throw {
                status: 401,
                message: `Unauthrized: payment system allow only for customer`
            }
        }

        const userId = req.user.id;
        const { amount } = req.body;
        const { status, message, data, success } = await CreatePaymentByCustomer({ userId, amount });

        return res.status(status).json({ message, data, success });

    } catch (error) {

        return res.status(error.status || 500).json({
            success: false,
            error: error.message || error
        });
    }
}

// ------------------------------------------VERIFY PAYMENT-----------------------------------------|
export const confirm_payment = async (req, res) => {
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

        const { status, success, message, data, transaction } = await VerifyCustomerPayment(payload);

        return res.status(status).json({ message, transaction, data, success });
        
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error: error.message || error
        });
    }
}