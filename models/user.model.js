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
        default: 'user',
        validate: {
            validator: function (value) {
                if (this.allowAdminSeed)
                    return true

                if (this.isNew && value !== 'user')
                    throw new Error(`'role' must be 'user' at the creation time`);

                return true
            }
        },
        message: `'role' must be 'user' at creation time `
    },
    otp: {
        type: String
    },
    otpExpiresAt: {
        type: Date
    },
    isGoogleAuth: {
        type: Boolean,
        default: false,
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
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);