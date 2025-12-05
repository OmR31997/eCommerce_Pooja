import mongoose from "mongoose";

const ShippingSchema = new mongoose.Schema({
    name: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    landmark: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'India' }
}, { _id: false });

const ItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, `'productId' field must be required`]
    },
    quantity: {
        type: Number,
        default: 1
    },
    price: {
        type: Number,
        required: [true, `'price' field must be required`]
    },
    subtotal: {
        type: Number,
        default: 0
    }
}, { _id: false });

const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, `'userId' field must be required`],
    },
    items: {
        type: [ItemSchema],
        default: []
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    shipping: {
        type: ShippingSchema,
        default: null
    }
}, { timestamps: true });

// CartSchema.pre('save', function(next) {
//     this.vendorIds = [...new Set(this.items.map(item => item.productId.vendorId))];
//     next();
// });

export const Cart = mongoose.model('Cart', CartSchema);

