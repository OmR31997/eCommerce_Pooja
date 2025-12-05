import mongoose from "mongoose";

const ReturnSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    quantity: {
        type: mongoose.Schema.Types.ObjectId,
    },
    status: {
        type: String,
        enum: ['requested', 'approved', 'rejected', 'received'],
        default: 'requested'
    },
    reason: {
        type: String
    }
});

export const Return = mongoose.model("Return", ReturnSchema);
