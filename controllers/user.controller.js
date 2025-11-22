import { User } from '../models/user.model.js';
import { Vendor } from '../models/vendor.model.js';
import bcrypt from 'bcryptjs'
import { BuildUserQuery, Pagination } from '../utils/fileHelper.js';
import { GetAllUsers, GetUser, RemoveAllUsers, RemoveUser, UpdateUser } from '../services/user.service.js';

/*      *get_me handler*      */
export const get_me = async (req, res) => {
    try {
        const { status, success, message, data } = await GetUser(req.user.id);

        return res.status(status).json({ message, data, success });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

/*      *get_user_byId handler*      */
export const get_user_byId = async (req, res) => {
    try {
        const userId = req.params.id;

        const { status, success, message, data } = await GetUser(userId);

        return res.status(status).json({ message, data, success });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

/* **get_users logic here** */
export const get_users = async (req, res) => {
    try {
        if (req.user.role === 'user')
            throw {
                status: 401,
                message: `Unauthorized: You haven't accessibility`,
                success: false
            }

        const {
            page = 1,
            limit = 10,
            offset,
            sortBy = 'createdAt',
            orderSequence = 'desc' } = req.query;

        const { status, success, message, pagination, data } = await GetAllUsers(
            `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,
            { page: parseInt(page), limit: parseInt(limit), offset, sortBy, orderSequence },
            {}
        );

        return res.status(status).json({ message, pagination, data, success });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

export const users_filters = async (req, res) => {
    try {
        const {
            search = '', status = '',
            name = '', email = '', phone = '', segment = '', joinRange = '', updatedRange = '', address = '',
            page = 1, limit = 10, offset,
            sortBy = 'createdAt', orderSequence = 'desc'
        } = req.query;

        if (req.user.role === 'user')
            throw {
                status: 401,
                message: `Unauthorized: You haven't accessibility`,
                success: false
            }

        const { status: StatusCode, success, message, pagination, data } = await GetAllUsers(
            `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,
            { page: parseInt(page), limit: parseInt(limit), offset, sortBy, orderSequence },
            {
                search, status, name, email, phone, segment, address,
                joinRange: joinRange ? joinRange.split(',').map(i => i.trim()) : undefined,
                updatedRange: updatedRange ? updatedRange.split(',').map(i => i.trim()) : undefined,
            }
        )

        return res.status(StatusCode).json({ message, pagination, data, success });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

/* **update_user_profile logic here** */
export const update_user_profile = async (req, res) => {
    try {
        const {
            name, email, phone,
            segment, address
        } = req.body;

        const userId = req.params.id;

        const userData = {
            name: name || undefined,
            email: email || undefined,
            phone: phone || undefined,
            address: address || undefined,
            segment: segment || undefined,
        }

        const isExist = Object.keys(userData).filter(key => userData[key] !== undefined);

        if(isExist.length === 0) {
            throw {
                status: 400, 
                message: 'Atleast one field must be required for update',
                success: false
            }
        }

        const {status, success, message, data} = await UpdateUser(userData, userId);

        return res.status(status).json({message, data, success});

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

/* **delete_user_profile logic here** */
export const remove_user_profile = async (req, res) => {
    try {
        const userId = req.params.id;

        const {status, success, message, data} = await RemoveUser(userId);

        return res.status(status).json({message, data, success});

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

/* **clear_users logic here** */
export const clear_users = async (req, res) => {
    try {
        if(['admin', 'super_admin'].includes(req.user.role)) {
            const {status, success, message, data} = await RemoveAllUsers();

            return res.status(status).json({message, data, success})
        }

        throw {
            status: 401,
            message: `Unauthorized: You haven't accessibility to clear action`,
            success: false
        }

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}