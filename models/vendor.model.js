import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

const VendorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        immutable: true,
        required: [true, `'userId' field must be required`],
        index: true,
    },
    type: {
        type: String,
        trim: true,
        required: [true, `'type' field must be required`],
        index: true,
    },
    status: {
        type: String,
        trim: true,
        lowercase: true,
        enum: ['approved', 'pending', 'rejected'],
        default: 'approved',
        index: true,
    },
    businessName: {
        type: String,
        trim: true,
        unique: true,
        required: [true, `'businessName' field must be required`],
    },
    password: {
        type: String,
        required: [true, `'password' field must be required`],
        select: false,
    },
    businessDescription: {
        type: String,
        trim: true,
        required: [true, `'businessDescription' field must be required`]
    },
    businessPhone: {
        type: String,
        default: null,
    },
    businessEmail: {
        type: String,
        unique: true,
        required: [true, `'businessEmail' field must be required`],
    },
    permission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission',
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: [true, `'role' field must be provided`],
    },
    gstNumber: {
        type: String,
        default: null,
    },
    address: {
        type: String,
        required: [true, `'address' field must be required`],
    },
    logoUrl: {
        type: String,
        required: false,
    },
    bankDetails: {
        accountNumber: {
            type: String,
            trim: true,
            unique: true,
            required: [true, `'accountNumber' field must be required`],
        },
        ifsc: {
            type: String,
            trim: true,
            required: [true, `'ifsc' field must be required`],
        },
        bankName: {
            type: String,
            trim: true,
            required: [true, `'bankName' field must be required`]
        }
    },
    onTimeDelivery: {
        type: Boolean,
        default: false,
    },
    review: [ReviewSchema],
    documents: {
        type: [String],
    },
    commision: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

VendorSchema.index({
    businessName: 'text',
    businessDescription: 'text',
    address: 'text'
}, {
    name: 'vendor_text_index',
    weights: {
        businessName: 5,
        businessDescription: 3,
        address: 1,
    },
    default_language: 'english',
});

export const Vendor = mongoose.model('Vendor', VendorSchema);
export const Review = mongoose.model('Review', ReviewSchema);