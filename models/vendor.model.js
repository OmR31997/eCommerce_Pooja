import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, `'userId' field must be required`]
    },
    type: {
        type: String,
        trim: true,
        required: [true, `'type' field must be required`],
    },
    status: {
        type: String,
        trim: true,
        enum: ['approved', 'pending', 'rejected'],
        default: 'pending',
    },
    businessName: {
        type: String,
        trim: true,
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
    officeAddress: {
        type: String,
        required: [true, `'officeAddress' field must be required`],
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
    additionalDoc: {
        type: [String],
    }
}, { timestamps: true });

export const Vendor = mongoose.model('Vendor', VendorSchema);