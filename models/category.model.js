import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
}, {timestamps: true});

//Auto generates slug via name if not provided case
CategorySchema.pre('save', function(next) {
    if(!this.slug && this.name) {
        this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
    }
    next();
});

export const Category = mongoose.model('category', CategorySchema);