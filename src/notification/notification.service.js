import { BuildQuery_H, Pagination_H, success } from '../../utils/helper.js';
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

// CREATE-----------------------------|
export const Notify = (() => ({
    super: async (notifyData) => {
        try {
            const admin = await Admin.findOne({ email: 'super@admin.com' }).select("_id");
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

// READ-------------------------------|
export const GetNotifications = async (keyVal = {}, options = {}) => {

    const { filter = {}, pagingReq = {}, baseUrl, select } = options;
    const matchedQuery = BuildQuery_H(filter);

    if(keyVal?.receiverId) {
        matchedQuery.receiverId = keyVal.receiverId
    }

    const total = await Notification.countDocuments(matchedQuery);
    
    const pagination = Pagination_H(
        pagingReq.page, pagingReq.limit,
        undefined,
        total, baseUrl,
        matchedQuery
    );

    const sortField = ['role', 'createdAt'].includes(pagingReq.sortBy) ? pagingReq.sortBy : 'createdAt';
    const sortDirection = pagingReq.orderSequence === 'asc' ? 1 : -1;
    const sortOption = { [sortField]: sortDirection };

    const notifications = await Notification.find(matchedQuery)
        .skip(pagination.skip)
        .limit(pagingReq.limit)
        .sort(sortOption)
        .select(select)
        .lean();

    delete pagination.skip;

    return success({
        pagination,
        message: 'Data fetched successfully',
        data: notifications || []
    });
}

export const GetNotificationById = async (keyVal) => {

    if(!keyVal.receiverId) {
        delete keyVal.receiverId
    }

    const notification = await Notification.findOne(keyVal);

    if (!notification) {
        throw {
            status: 404,
            message: `Notification not found for ID: ${keyVal._id}`
        }
    }

    return success({
        message: "Data fetched successfully",
        data: notification
    });

}

export const MarkReadNotification = async (keyVal) => {

    const notification = await Notification.findByIdAndUpdate(keyVal,
        { read: true }, { new: true });

    if (!notification) {
        throw {
            status: 404,
            message: `Notification not found for ID: ${keyVal._id}`
        }
    }

    return success({
        message: 'Read marked successfully',
        data: notification
    });
}