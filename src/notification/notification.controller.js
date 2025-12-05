import { GetUserNotifications, MarkReadNotification } from "./notification.service.js";


export const get_user_notification = async (req, res) => {
    try {
        const key = req.user.role === 'user'
            ? { userId: req.user.id }
            : req.user.roler === 'vendor'
                ? { vendorId: req.user.id }
                : {};

        const options = {
            key
        }
        const { status, success, message, data } = await GetUserNotifications(options)

        return res.status(status).json({ message, data, success });

    } catch (error) {

        return res.status(error.status || 500).json({ 
            success: false, 
            error: error.message || `Internal Server Error ${error}` 
        });
    }
}

export const mark_read_notification = async (req, res) => {
    try {
        const { status, success, message } = await MarkReadNotification(req.params.id);

        return res.status(status).json({ message, success });

    } catch (error) {

        return res.status(error.status || 500).json({ 
            success: false, 
            error: error.message || `Internal Server Error ${error}` });
    }
}

