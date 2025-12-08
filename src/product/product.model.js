import mongoose from 'mongoose';
import { FileSchema } from '../../common_models/file.model.js';

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
        unique: true,
        required: [true, `'name' field must be required`],
    },
    features: {
        type: [String],
        default: []
    },
    description: {
        type: String,
        required: [true, `'description' field must be required`],
    },
    price: {
        type: mongoose.Schema.Types.Decimal128,
        required: [true, `'price' field must be required`],
        get: v => v ? Number(v.toString()) : null
    },
    stock: {
        type: Number,
        default: 0,
    },
    notifiedLowStock: {
        type: Boolean,
    },
    sku: {  //"Stock Keeping Unit"
        type: String,
        trim: true,
        unique: true,
        required: [true, `'sku' field must be required`],
    },
    images: {
        type: [FileSchema],
        required: [true, `'images' field must be required`],
    },
    status: {
        type: String,
        enum: ['approved', 'pending', 'rejected'],
        default: 'pending',
    },
    sales: {
        type: Number,
        default: 0,
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    rating: {
        type: Number,
        default: 0
    },
    ratingCount: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0,
    }

}, { timestamps: true });

ProductSchema.set('toJSON', { getters: true, virtuals: true });
ProductSchema.set('toObject', { getters: true, virtuals: true });

ProductSchema.virtual('priceFormatted').get(function () {
    if (!this.price) return null;
    return `₹${Number(this.price).toFixed(2)}`;
});

ProductSchema.index({ name: 'text', description: 'text' }, {
    name: 'product_text_index',
    weights: { name: 3, description: 1 },
    default_language: 'english'
});

ProductSchema.index({ price: 1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ vendorId: 1 });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ createdAt: -1 });
// ProductSchema.index({ 'rating.average': 1 });
ProductSchema.index({ discount: 1 });
ProductSchema.index({ status: 1 });

export const Product = mongoose.model('Product', ProductSchema);