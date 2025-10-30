import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    name: {
        type: String,
        trim: true,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    } ,
    stock: {
        type: Number,
        default: 0,
    },
    sku: {
        type: String,
        trim: true,
        unique: true,
        required: true,
    },
    images: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'inactive'],
        default: 'pending'
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
}, {timestamps: true});

export const Product = mongoose.model('product', ProductSchema);