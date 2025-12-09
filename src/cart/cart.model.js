import mongoose from "mongoose";
import { ShippingSchema } from "../../common_models/shipping.model.js";
import { ItemSchema } from "../../common_models/item.model.js";

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

