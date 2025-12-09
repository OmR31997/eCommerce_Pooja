import mongoose from "mongoose";

const RefundSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    reason: String,
    evidence: [String], // images URLs
    status: {
        type: String,
        enum: ['initiated', 'requested', 'pending', 'approved', 'processing', 'completed', 'rejected'],
        default: 'pending'
    },
    initiatedBy: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    gatewayRefundId: {
        type: String, // Razorpay refund id
        default: null
    }
}, { timestamps: true });

export const Refund = mongoose.model("Refund", RefundSchema);
