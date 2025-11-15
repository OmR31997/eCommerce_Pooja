import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, `'name' field must be required`],
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        required: [true, `'email' field must be required`],
    },
    phone: {
        type: String,
        trim: true,
        unique: true,
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
    permissions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Permission'
        },
    ],
    isActive: {
        type: Boolean,
        default: false,
    }

}, { timestamps: true });

export const Staff = mongoose.model('Staff', StaffSchema);