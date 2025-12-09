import mongoose from "mongoose";

export const ItemSchema = new mongoose.Schema({
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
        min: [0, `'subtotal' field must be required`],
    }
}, { _id: false });