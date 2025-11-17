import { User } from '../models/user.model.js';
import { Vendor } from '../models/vendor.model.js';
import bcrypt from 'bcryptjs'
import { BuildUserQuery, Pagination } from '../utils/fileHelper.js';
import { getUserDetails } from '../services/user.service.js';

export const get_me = async (req, res) => {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({
            error: 'Data not found',
            success: false,
        });
    }

    return res.status(200).json({
        message: 'Data fetched successfully',
        data: user,
        success: true,
    })
}

/* **get_users logic here** */
export const get_users = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            offset,
            status = 'active',
            sortBy = 'createdAt',
            orderSequence = 'desc' } = req.query;

        const parsedLimit = parseInt(limit);

        // Build Query
        const filter = {};

        // Handle Status
        if (status) filter.status = status;

        // Count total records
        const total = await User.countDocuments({ ...filter, role: { $nin: ['admin', 'vendor'] } });

        const { skip, nextUrl, prevUrl, totalPages, currentPage } = Pagination(
            parseInt(page),
            parsedLimit,
            offset,
            total,
            `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`, filter);

        // Sorting
        const sortField = ['name', 'totalSpents', 'createdAt'].includes(sortBy) ? sortBy : 'createdAt';
        const sortDirection = orderSequence === 'asc' ? 1 : -1;
        const sortOption = { [sortField]: sortDirection };

        const users = await User.find({ ...filter, role: { $nin: ['admin', 'vendor'] } })
            .skip(skip)
            .limit(parsedLimit)
            .sort(sortOption)

        if (users.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                success: false,
            });
        }

        return res.status(200).json({
            message: 'Users fetched successfully.',
            pagination: {
                count: total,
                prevUrl,
                nextUrl,
                currentPage,
                totalPages,
                success: true,
            },
            data: users,
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

/* **get_user_byId logic here** */
export const get_user_byId = async (req, res) => {
    try {
        const userId = req.params.id;
        const { role } = req.user;

        if (role === 'staff' || role === 'admin' || role === 'super_admin') {
            const user = await getUserDetails(userId);

            return res.status(user.status).json({
                data: user.data,
                success: user.success,
            });
        }

        return res.status(400).json({
            message: 'Unauthorized: user cannot access',
            success: false,
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

/* **update_user_profile logic here** */
export const update_user_profile = async (req, res) => {
    try {
        const { password, currentPassword, status, isVerified, ...rest } = req.body;
        const userId = req.params.id;
        const { id, role } = req.user;

        if (role === 'user' && userId !== id) {
            return res.status(400).json({
                error: 'You can update only own profile',
                success: false,
            });
        }

        const errors = [];

        if (status && role === 'user') errors.push(`You cannot update 'status' field — please talk with admin`);
        if (isVerified) errors.push(`Please do not include 'isVerified' field`);
        if (rest.role) delete rest.role;

        if (errors.length > 0) {
            return res.status(400).json({
                errors,
                success: false,
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                success: false,
            });
        }

        if (password) {
            if (!currentPassword) {
                return res.status(400).json({
                    error: 'Current password required to set a new password',
                    success: false,
                });
            }

            const validPassword = bcrypt.compare(currentPassword, user.password);

            if (!validPassword) {
                return res.status(400).json({
                    error: 'Password mistmatched',
                    success: false,
                });
            }

            user.password = await bcrypt.hash(password, 10);
        }


        Object.keys(rest).forEach((key) => {
            user[key] = rest[key];
        });

        const updatedUser = await user.save();

        return res.status(200).json({
            message: 'User updated successfully',
            data: updatedUser._doc,
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

/* **update_user_profile logic here** */
export const update_user_status = async (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

/* **delete_user_profile logic here** */
export const remove_user_profile = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({
                error: `User not found for ID: '${userId}'`,
                success: false,
            });
        }

        await Vendor.findOneAndDelete({ userId });

        return res.status(200).json({
            message: 'User deleted successfully',
            data: user,
            success: true,
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

/* **clear_users logic here** */
export const clear_users = async (req, res) => {
    try {
        const users = await User.find();

        if (users.length === 0) {
            return res.status(404).json({
                error: 'No user found to delete',
                success: false,
            });
        }

        for (const user of users) {
            await Vendor.findByIdAndDelete(user._id);
        }

        const result = await User.deleteMany({});

        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: 'No users found to delete',
                success: false,
            });
        }

        return res.status(200).json({
            message: `All user cleared successfully (${result.deletedCount} deleted)`,
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

export const users_filters = async (req, res) => {
    try {
        const {
            search,
            name, email, phone, segment, joinRange, updatedRange, address, status = 'active',
            page = 1, limit = 10, offset,
            sortBy = 'createdAt', orderSequence = 'desc'
        } = req.query;

        // Build Filters 
        const filters = {
            search: search || '',
            name: name || '',
            email: email || '',
            phone: phone || '',
            segment: segment || '',
            address: address || '',
            joinRange: joinRange ? joinRange.split(',').map(i => i.trim()) : undefined,
            updatedRange: updatedRange ? updatedRange.split(',').map(i => i.trim()) : undefined,
            status: status || 'active',
        };

        const parsedLimit = parseInt(limit);

        // Build Mongo query
        const query = BuildUserQuery(filters);

        // Count Total Docs
        const total = await User.countDocuments({ role: 'user', ...query });

        const { skip, nextUrl, prevUrl, totalPages, currentPage } = Pagination(
            parseInt(page),
            parsedLimit,
            offset,
            total,
            `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,
            filters,
        );

        // Sorting
        const sortField = ['name', 'address', 'createdAt'].includes(sortBy) ? sortBy : 'createdAt';
        const sortDirection = orderSequence === 'asc' ? 1 : -1;
        const sortOption = { [sortField]: sortDirection };

        const customers = await User.find({ role: 'user', ...query })
            .skip(skip)
            .limit(parsedLimit)
            .sort(sortOption)

        return res.status(200).json({
            message: 'Customers fetched successfully',
            pagination: {
                count: total,
                prevUrl,
                nextUrl,
                currentPage,
                totalPages,
            },
            data: customers,
            success: true,
        });

    } catch (error) {
        console.error('Error in customer_filters:', error);
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
};