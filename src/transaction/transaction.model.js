import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
    },
    type: {
        type: String,
        enum: ["customer_payment", "vendor_payout"],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    razorOrderId: {    //Razor payment for customer/user
        type: String,
    },
    razorPaymentId: {  //Razor payment for customer/user
        type: String,
    }, 
    verifiedAt: {      //Razor payment for customer/user
        type: Date,
    },
    razorpayPayoutId: { //RazorpayX payoutId
        type: String,
    },
    fundAccountId: {    //RazorpayX fund accountId
        type: String,
    },
    contactId: {    //Razorpay contactId
        type: String,
    },
    status: {
        type: String,
        enum: ['initiated', 'processing', 'processed', 'failed', 'cancelled'],
        default: 'initiated'
    },
    failureReason: {    //Razorpay failure reason
        type: String,
        default: null
    },
    processedAt: {  //when payout confirmed
        type: Date
    },
    failedAt: { //when payout failed
        type: Date
    },
    note: {     //remark or internal reference
        type: String
    }
});

export const Transaction = mongoose.model('Transaction', TransactionSchema);