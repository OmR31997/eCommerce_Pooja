import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String, 
        trim: true,
        required: [true, `'name' field must be required`],
    },
    email: {
        type: String,
        unique: true,
        required: [true, `'email' field must be required`],
    },
    phone: {
        type: String,
        unique: true,
        required: [true, `'phone' field must be required`],
    },
    password: {
        type: String,
        required: [true, `'password' field must be required`],
    },
    role: {
        type: String,
        enum: ['user', 'vendor', 'admin'],
        default: 'user'
    },
    otp: {
        type: String
    },
    otpExpiresAt: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'blocked'],
        default: 'active'
    },
}, {timestamps: true});

export const User = mongoose.model('user', UserSchema);