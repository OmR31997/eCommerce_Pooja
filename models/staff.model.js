import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, `'name' field must be required`],
        trim: true,
        unique: true,
    },
    permissions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Permission',
        },
    ],
    description: {
        type: String,
        default: '',
    }

}, { timestamps: true });

export const Role = mongoose.model('Role', RoleSchema);

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
        // immutable: true
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