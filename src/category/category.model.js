import mongoose from 'mongoose';
import { FileSchema } from "../../common_models/file.model.js";
const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, `'name' field must be required`],
        trim: true,
        validate: {
            validator: function (v) {
                return v != null && v.trim() !== ""; // no null + no blank
            },
            message: `'name' cannot be empty`
        }
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
    },
    description: {
        type: String,
        required: [true, `'description' field must be required`],
    },
    imageUrl: {
        type: FileSchema,
        default: null,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
        immutable: true,
    }
}, { timestamps: true });

// Virtual field to easily populate children
CategorySchema.virtual('subcategories', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent',
});

// Ensure virtuals appear in JSON
CategorySchema.set('toObject', { virtuals: true });
CategorySchema.set('toJSON', { virtuals: true });

CategorySchema.index({ status: 1 });

export const Category = mongoose.model('Category', CategorySchema);