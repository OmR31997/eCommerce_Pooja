import mongoose from "mongoose";

const ComplainerSchema = new mongoose.Schema({
    complainerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    role: {
        type: String,
        enum: ['customer', 'vendor'],
        required: true
    }
}, { _id: false });

const File = new mongoose.Schema({
    public_id: { type: String, default: null },
    secure_url: { type: String, default: null },
}, { _id: false });


const ComplaintSchema = new mongoose.Schema({
    complainer: ComplainerSchema,
    message: {
        type: String,
        required: [true, `'message' field must be required`],
    },
    image: File
}, {timestamps: true});

export const Complaint = mongoose.model('complaint', ComplaintSchema);