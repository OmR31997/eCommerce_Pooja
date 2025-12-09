import mongoose from 'mongoose';
const RecieverSchema = new mongoose.Schema({
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    role: {
        type: String,
        enum: ['user/customer', 'vendor', 'admin', 'super_admin'],
        required: true
    }
}, { _id: false });

const NotificationSchema = new mongoose.Schema({
    receiver: RecieverSchema,
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: [
            'order', 'stock', 'vendor', 
            'system', 'complaint', 'payout', 
            'order_payment', 'delete'
        ],
        default: 'system'
    }
}, { timestamps: true });

export const Notification = mongoose.model('Notification', NotificationSchema);