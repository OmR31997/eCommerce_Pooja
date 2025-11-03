import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, `'userId' field must be required`],
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, `'productId' field must be required`],
        },
        quantity: {
            type: Number,
            default: 1,
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

}, {timestamps: true});

export const Cart = mongoose.model('Cart', CartSchema);