import { Admin } from '../admin/admin.model.js';
import { Notification } from './notification.model.js';

export const ToAdmin = async (notifyData) => {
    const emails = [
        process.env.ADMIN_EMAIL ?? 'admin@support.com',
        process.env.SUPER_ADMIN_EMAIL ?? 'super@admin.com'
    ].filter(Boolean); //remove undefined values

    const admins = await Admin.find({ email: { $in: emails } }).populate({ path: 'role', select: 'name' });

    for (const admin of admins) {
        const dataToSave = {
            ...notifyData,
            receiverId: admin._id,
            role: admin.role.name
        };

        await Notification.create(dataToSave);
    }
}

export const Notify = (() => ({
    super: async (notifyData) => {
        try {
            const admin = await Admin.findOne({email: 'super@admin.com'}).select("_id");
            await Notification.create({
                ...notifyData,
                receiverId: admin._id,
                role: 'admin'
            })
        } catch (error) {
            
        }
    },
    admin: async (notifyData) => {
        try {
            await ToAdmin(notifyData);
        } catch (error) {
            throw new Error(`Admin notification failed: ${error.message}`);
        }
    },
    vendor: async (vendorId, notifyData) => {
        try {

            await Notification.create({
                ...notifyData,
                receiverId: vendorId,
                role: 'vendor'
            });
        } catch (error) {
            throw new Error(`Vendor notification failed: ${error.message}`);
        }
    },
    user: async (userId, notifyData) => {
        try {

            await Notification.create({
                ...notifyData,
                receiverId: userId,
                role: 'user/customer'
            });
        } catch (error) {
            throw new Error(`User notification failed: ${error.message}`)
        }
    }
}))();

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

    const result = await Notification.findByIdAndUpdate(notifyId, { read: true }, { new: true });

    if (!result) {
        throw {
            status: 404,
            message: 'No notification'
        }
    }

    return { status: 200, message: 'Read marked successfully', data:result, success: true };
}