import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, `'userId' field must be required`]
    },
    shopName: {
        type: String,
        trim: true,
        required: [true, `'shopName' field must be required`],
    },
    gstNumber: {
        type: String,
        trim: true,
        required: [true, `'gstNumber' field must be required`],
    },
    businessEmail: {
        type: String,
        unique: true,
        required: [true, `'businessEmail' field must be required`],
    },
    logoUrl: {
        type: String,
        required: false,
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    totalEarning: {
        type: Number,
        default: 0,
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
    }
}, { timestamps: true });

export const Vendor = mongoose.model('Vendor', VendorSchema);