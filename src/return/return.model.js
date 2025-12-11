import mongoose from "mongoose";
import { ItemSchema } from "../../common_models/item.model.js";

const ReturnSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    items: {
        type: [ItemSchema]
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    status: {
        type: String,
        enum: [
            'requested', 'refund_received', 'refund_initiated',
            'inspected', 'approved', 'rejected'],

        required: [true, `'status' field must be required`]
    },
    reason: {
        type: String,
        required: [true, `'reason' field must be required!`]
    },
    refundId: {
        type: mongoose.Schema.Types.ObjectId
    }
});

export const Return = mongoose.model("Return", ReturnSchema);
