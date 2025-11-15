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