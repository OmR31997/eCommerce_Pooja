import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: [true, `'vendorId' field must be required`],
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, `'categoryId' field must be required`],
    },
    name: {
        type: String,
        trim: true,
        required: [true, `'name' field must be required`],
    },
    description: {
        type: String,
        required: [true, `'description' field must be required`],
    },
    price: {
        type: Number,
        required: [true, `'price' field must be required`],
    },
    stock: {
        type: Number,
        default: 0,
    },
    sku: {  //"Stock Keeping Unit"
        type: String,
        trim: true,
        unique: true,
        required: [true, `'sku' field must be required`],
    },
    images: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'under_process'],
        default: 'pending',
        validate: {
            validator: function (value) {
                if (this.isNew && value !== 'pending')
                    throw new Error(`'status' must be 'pending' at the creation time`);

                return true;
            }
        }
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        totalReview: {
            type: Number,
            default: 0
        }
    }
}, { timestamps: true });

export const Product = mongoose.model('Product', ProductSchema);