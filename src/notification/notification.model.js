import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    role: {
        type: String,
        enum: ['user/customer', 'vendor', 'admin', 'super_admin'],
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    read: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: [
            'order', 'stock', 'vendor', 'product',
            'system', 'complaint', 'payout', 
            'order_payment', 'delete'
        ],
        default: 'system'
    }
}, { timestamps: true });

export const Notification = mongoose.model('Notification', NotificationSchema);