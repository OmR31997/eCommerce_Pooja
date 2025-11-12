import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, `'name' field must be required`],
    },
    segment: {
        type: String,
        default: null,
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        required: [true, `'email' field must be required`],
    },
    phone: {
        type: String,
        unique: true,
        sparse: true,
        required: [true, `'phone' field must be required`],
    },
    password: {
        type: String,
        required: [true, `'password' field must be required`],
    },
    role: {
        type: String,
        trim: true,
        lowercase: true,
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
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    totalSpents: {
        type: Number,
        default: 0,
    },
    shippedOrders: {
        type: Number,
        default: 0,
    },
    rejectedOrders: {
        type: Number,
        default: 0,
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
        trim: true,
        lowercase: true,
        enum: ['active', 'inactive', 'blocked', 'vip', 'new', 'at_risk'],
        default: 'active'
    },
    address: {
        type: String,
        index: true,
        required: [true, `'address' field must be required`],
    }
}, { timestamps: true });

UserSchema.index({
    name: 'text',
    address: 'text'
}, {
    name: 'user_text_index',
    weights: {
        name: 3,
        address: 1,
    },
    default_language: 'english',
});

/* Compound Index for Admin Filters */
UserSchema.index({ role: 1, status: 1 });

export const User = mongoose.model('User', UserSchema);