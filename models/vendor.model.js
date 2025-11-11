import mongoose from 'mongoose';

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
        enum: ['approved', 'pending', 'rejected'],
        default: 'pending',
        index: true,
    },
    businessName: {
        type: String,
        trim: true,
        unique: true,
        required: [true, `'businessName' field must be required`],
    },
    businessDescription: {
        type: String, 
        trim: true,
        required: [true, `'businessDescription' field must be required`]
    },
    businessEmail: {
        type: String,
        unique: true,
        required: [true, `'businessEmail' field must be required`],
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
    documents: {
        type: [String],
    }
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