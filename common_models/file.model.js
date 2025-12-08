import mongoose from "mongoose";

export const FileSchema = new mongoose.Schema({
    public_id: { type: String, default: null },
    secure_url: { type: String, default: [true, `'secure_url' field must be required`] },
}, { _id: false });