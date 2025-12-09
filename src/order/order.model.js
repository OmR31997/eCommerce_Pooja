import mongoose from "mongoose"
import { ItemSchema } from "../../common_models/item.model.js";
import { ShippingSchema } from "../../common_models/shipping.model.js";

const OrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, `'userId' field must be required`],
        index: true,
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: [true, `'vendorId' field must be required`],
        index: true,

    },
    items: {
        type: [ItemSchema],
        validate: [(val) => val.length > 0, 'At least one order item is required']
    },
    totalAmount: {
        type: Number,
        min: [0, `'totalAmount' must be non-negative`],
        default: 0,
    },
    paymentMethod: {
        type: String,
        enum: {
            values: ['COD', 'Online'],
            message: "Payment method must be either COD or Online",
        },
        required: [true, `'paymentMethod' field must be required`],
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'initiating'],
        default: 'pending',
    },
    status: {
        type: String,
        enum: [
            'return_requested', 'approved', 'pending', 
            'delivered', 'cancelled', 'returned',
        ],
        default: 'pending'
    },
    paymentSessionId: { 
        type: String, 
        default: null 
    }, // razorpay order id
    shippingAddress: {
        type: ShippingSchema,
        required: [true, `'shippingAddress' field must be required`]
    },
    trackingId: {
        type: String,
        default: null,
        index: true,
    },
    paymentId: {
        type: String, // Razorpay or Stripe transaction ID
    },
    refundId: {
        type: mongoose.Schema.Types.ObjectId,
    }
}, { timestamps: true });

// Virtual (not stored in DB)
OrderSchema.virtual("itemCount").get(function () {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

/*  Compound index (Real-world optimization)
    Vendor + Order Status filter becomes faster
*/
OrderSchema.index({ vendorId: 1, status: 1 });

export const Order = mongoose.model('Order', OrderSchema);