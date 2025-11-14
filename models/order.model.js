import mongoose from "mongoose"

const OrderItemSchema = new mongoose.Schema({
    product: {
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

// OrderItemSchema.pre("validate", function (next) {
//     this.subtotal = this.quantity * this.price;
//     next();
// });

const ShippingSchema = new mongoose.Schema({
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
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, `'userId' field must be required`],
        index: true,
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: [true, `'vendorId' field must be required`],
        index: true,

    },
    items: {
        type: [OrderItemSchema],
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
        enum: ['pending', 'initiated', 'paid', 'failed'],
        default: 'pending',
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'cancelled'],
        default: 'pending'
    },
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
}, { timestamps: true });

// Auto-calculate totalAmount before save
// OrderSchema.pre("save", function (next) {
//     this.totalAmount = this.items.reduce((accume, currentItem) =>
//         accume + (currentItem.subtotal || 0), 0);
//     next();
// });

// Virtual (not stored in DB)
OrderSchema.virtual("itemCount").get(function () {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

/*  Compound index (Real-world optimization)
    Vendor + Order Status filter becomes faster
*/
OrderSchema.index({ vendorId: 1, status: 1 });

export const Order = mongoose.model('Order', OrderSchema);