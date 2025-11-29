import mongoose from 'mongoose';

const File = new mongoose.Schema({
    public_id: { type: String, default: null },
    secure_url: { type: String, default: null },
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
        default: 'pending',
    },
    businessName: {
        type: String,
        trim: true,
        unique: true,
        required: [true, `'businessName' field must be required`],
    },
    businessEmail: {
        type: String,
        unique: true,
        required: [true, `'businessEmail' field must be required`],
    },
    businessDescription: {
        type: String,
        trim: true,
        required: [true, `'businessDescription' field must be required`]
    },
    password: {
        type: String,
        required: [true, `'password' field must be required`],
        select: false,
    },
    businessPhone: {
        type: String,
        default: null,
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
    logoUrl: File,
    bankDetails: {
        accountNumber: {
            type: String,
            trim: true,
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
    review: {
        type: Number,
        default: 0
    },
    documents: [File],
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

VendorSchema.index({ status: 1 });

export const Vendor = mongoose.model('Vendor', VendorSchema);