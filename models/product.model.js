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
        unique: true,
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
        enum: ['approved', 'pending', 'rejected', 'under_process'],
        default: 'pending',
        validate: {
            validator: function (value) {
                if (this.isNew && value !== 'pending')
                    throw new Error(`'status' must be 'pending' at the creation time`);

                return true;
            }
        }
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
    },
    views: {
        type: Number,
        default: 0,
    }

}, { timestamps: true });

ProductSchema.index({ name: 'text', description: 'text' }, {
    name: 'product_text_index',
    weights: { name: 3, description: 1 },
    default_language: 'english'
});

ProductSchema.index({ price: 1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ 'rating.average': 1 });
ProductSchema.index({ discount: 1 });
ProductSchema.index({ status: 1 });

export const Product = mongoose.model('Product', ProductSchema);