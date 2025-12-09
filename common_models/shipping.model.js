import mongoose from "mongoose";

export const ShippingSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, `name' field must be required`],
    },
    phone: {
        type: String,
        required: [true, `'phone' field must be required`],
    },
    addressLine: {
        type: String,
        required: [true, `'addressLine' field must be required`],
    },
    addressLine1: String,
    addressLine2: String,
    landmark: String,
    city: {
        type: String,
        required: [true, `'city' field must be required`],
    },
    state: {
        type: String,
        required: [true, `'state' field must be required`],
    },
    postalCode: {
        type: String,
        required: [true, `'postalCode' field must be required`],
    },
    country: { type: String, default: 'India' }
}, { _id: false });