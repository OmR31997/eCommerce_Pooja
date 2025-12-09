import { CreateReturn, GetReturnItemsById, GetReturns, UpdateReturn } from "./return.service.js";

export const get_order_returns = async (req, res) => {
    try {
        const {
            page = 1, limit = 10,
            sortBy = '-createdAt', orderSequence = '-1'
        } = req.query;

        const options = {
            baseUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,

            pagingReq: {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy, orderSequence
            },

            filter: {
                search,
                status: ['admin', 'super_admin'].includes(req.user.role) ? undefined : 'active'
            },
        }

        const { status: statusCode, success, message, count, pagination, data } = await GetReturns(options);

        return res.status(statusCode).json({
            success, message, count, pagination, data
        });

    } catch (error) {
        return res.status(error.status || 500).json({
            error: error.message || `Internal Server Error '${error}'`
        });
    }
}


/*      *get_category_by_slug req/res handler*     */
export const get_return_by_id = async (req, res) => {
    try {

        if(['staff', 'admin', 'super_admin'].includes(req.role.user)) {
            throw {
                status: 401,
                message: "Only staff can update return status"
            }
        }

        const keyVal = {
            _id: req.param.returnId            
        }

        const { status, success, message, data } = await GetReturnItemsById(keyVal);

        return res.status(status).json({ message, data, success });
    } catch (error) {
        return res.status(error.status || 500).json({
            error: error.message || `Internal Server Error '${error}'`
        });
    }
}

export const request_return = async (req, res, next) => {
    try {
        const userId = req.query.userId;
        const {
            orderId, productId,
            quantity, reason
        } = req.body;

        if (userId && req.user.role === "user" && req.user.id !== userId) {
            throw {
                status: 401,
                message: "Unauthorized: You don't have permission for another user"
            }
        }

        const keyVal = {
            userId: req.user.role === "user" ? req.user.id : userId,
            orderId, productId,
        }

        const reqData = {
            quantity, reason
        };

        const { status: statusCode, success, message, data } = await CreateReturn(keyVal, reqData);

        return res.status(statusCode).json({
            message,
            data,
            success
        });

    } catch (error) {
        next(error);
    }
}

export const update_return = async (req, res, next) => {
    try {

        if(['staff', 'admin', 'super_admin'].includes(req.role.user)) {
            throw {
                status: 401,
                message: "Only staff can update return status"
            }
        }

        const {
            status
        } = req.body;

        const valid = [
            'staff-approved', 'staff-rejected', 'inspected'
        ];

        if(!valid.includes(req.body.status)) {
            throw {
                status: 400,
                message:  `'status' must be one of: ${valid.join(', ')}`
            }
        }

        const keyVal = {
            _id: req.params.returnId,
            orderId: req.params.orderId
        }

        const reqData = {
            status
        };

        const { status: statusCode, success, message, data } = await UpdateReturn(keyVal, reqData);

        return res.status(statusCode).json({
            message,
            data,
            success
        });
    } catch (error) {
        next(error);
    }
}
