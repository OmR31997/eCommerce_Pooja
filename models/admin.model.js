import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    permission: {
        manageUsers: {
            type: Boolean,
            default: false,
        },
        manageVendors: {
            type: Boolean,
            default: false,
        },
        manageProducts: {
            type: Boolean,
            default: false,
        },
        manageOrders: {
            type: Boolean,
            default: false,
        },
        manageCategories: {
            type: Boolean,
            default: false
        }
    }
}, {timestamps: true});

export const Admin = mongoose.model('Admin', AdminSchema);