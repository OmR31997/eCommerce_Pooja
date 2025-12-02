import { Notification } from '../models/notification.model.js';

export const CreateNotification = async (notifyData) => {

    const result = await Notification.create(notifyData);

}

export const GetUserNotifications = async (options = {}) => {
    const result = await Notification.find(options)
        .sort({ createdAt: -1 });

    if (result.length === 0) {
        throw {
            status: 404,
            message: 'No Notifications'
        }
    }

    return { status: 200, message: 'Data fetched successfully', data: result, success: true }
}

export const MarkReadNotification = async (notifyId) => {

    const result = await Notification.findByIdAndUpdate(key, { read: true });
    
    if(!result) {
        throw {
            status: 404,
            message: 'No notification'
        }
    }

    return {status: 200, message: 'Read marked successfully', success: true};
}

const result = Notification.create()