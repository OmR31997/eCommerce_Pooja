import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shopName: {
        type: String,
        trim: true,
        required: true,
    },
    gstNumber: {
        type: String,
        trim: true,
        required: true,
    },
    businessEmail: {
        type: String,
        required: true,
    },
    logoUrl: {
        type: String,
        required: true,
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
            required: true,
        },
        ifsc: {
            type: String,
            trim: true,
            required: true,
        },
        bankName: {
            type: String,
            trim: true,
            required: true
        }
    }
}, { timestamps: true });

export const Vendor = mongoose.model('vendor', VendorSchema);