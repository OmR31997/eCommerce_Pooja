import { GetNotificationById, GetNotifications, MarkReadNotification } from "./notification.service.js";

// READ------------------------------------|
export const get_all_notifications = async (req, res, next) => {
    try {

        const {
            page = 1, limit = 10, role,
            sortBy = 'createdAt',
            orderSequence = 'desc'
        } = req.query;

        if (!["admin", "super_admin"].includes(req.user.role)) {
            throw {
                status: 401,
                message: `You don't have permission to access`
            }
        }

        const options = {
            baseUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,

            pagingReq: {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy, orderSequence
            },

            filter: {
                role,
            },
        }

        const response = await GetNotifications(options);

        return res.status(200).json(response);

    } catch (error) {

        next(error);
    }
}

export const get_notifications = async (req, res, next) => {
    try {
        
        const {
            page = 1, limit = 10,
            sortBy = 'createdAt',
            orderSequence = 'desc'
        } = req.query;

        const keyVal = {
            receiverId: req.user.id
        }

        const options = {
            baseUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,

            pagingReq: {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy, orderSequence
            }
        }

        const response = await GetNotifications(keyVal, options)

        return res.status(200).json(response);

    } catch (error) {

        next(error);
    }
}

export const get_notification_by_id = async (req, res, next) => {
    try {
        const keyVal = {
            _id: req.params.notifyId,
            receiverId: (["admin", "super_admin"].includes(req.user.role) ? null : req.user.id)
        }

        const response = await GetNotificationById(keyVal);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

// UPDATE----------------------------------|
export const mark_read_notification = async (req, res, next) => {
    try {

        const keyVal = {
            _id: req.params.notifyId,
            receiverId: req.user.id
        }

        const response = await MarkReadNotification(keyVal);

        return res.status(200).json(response);

    } catch (error) {

        next(error);
    }
}

