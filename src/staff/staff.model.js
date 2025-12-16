import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, `'name' field must be required`],
    },
    staffEmail: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        required: [true, `'staffEmail' field must be required`],
    },
    staffPhone: {
        type: String,
        trim: true,
        unique: true,
        required: [true, `'staffPhone' field must be required`]
    },
    password: {
        type: String,
        required: [true, `'password' field must be required`],
        select: false,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: [true, `'role' field must be provided`],
    },
    permission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission',
        required: [true, `'permission' field must be provided`],
    },
    status: {
        type: String,
        trim: true,
        lowercase: true,
        enum: ['approved', 'pending', 'rejected'],
        default: 'approved',
        index: true,
    },

}, { timestamps: true });

export const Staff = mongoose.model('Staff', StaffSchema);