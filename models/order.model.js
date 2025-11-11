import mongoose from "mongoose"

const OrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, `'userId' field must be required`],
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: [true, `'vendorId' field must be required`],

    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, `'productId' field must be required`],
        },
        quantity: {
            type: Number,
            required: [true, `'quantity' field must be required`],
        },
        price: {
            type: Number,
            required: [true, `'price' field must be required`],
        },
        subtotal: {
            type: Number,
            required: [true, `'subtotal' field must be required`],
        }
    }],
    totalAmount: {
        type: Number,
        required: [true, `'totalAmount' field must be required`],
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Online'],
        required: [true, `'paymentMethod' field must be required`],
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'initiated', 'paid', 'failed'],
        default: 'pending',
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    shippingAddress: {
        name: {
            type: String,
            trim: true,
            required: [true, `name' field must be required`],
        },
        phone: {
            type: String,
            required: [true, `'phone' field must be required`],
        },
        addressLine: {
            type: String,
            required: [true, `'addressLine' field must be required`],
        },
        city: {
            type: String,
            required: [true, `'city' field must be required`],
        },
        state: {
            type: String,
            required: [true, `'state' field must be required`],
        },
        postalCode: {
            type: String,
            required: [true, `'postalCode' field must be required`],
        }
    },
    trackingId: {
        type: String,
        default: null,
    },
    paymentId: {
        type: String, // Razorpay or Stripe transaction ID
    },
}, { timestamps: true });

export const Order = mongoose.model('Order', OrderSchema);