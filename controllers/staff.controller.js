import { Staff } from '../models/staff.model.js';
import { CreateStaff, UpdateStaff } from '../services/staff.service.js';
import { Pagination } from '../utils/fileHelper.js';

export const create_staff = async (req, res) => {
    const { role: m_role } = req.user;

    const {
        name, email, phone, password,
        role, permissions, isActive,
    } = req.body;

    const staffData = {
        name: name || undefined,
        email: email || undefined,
        password: password || undefined,
        phone: phone || undefined,
        role: role || '6915c8771a4ca360ff3c32d2',
        permissions: Array.isArray(permissions) ? permissions : [permissions],
        isActive: isActive === 'true' ? true : false,
    }

    if (m_role === 'super_admin' || m_role === 'admin') {

        const { status, error, errors, success, message, data } = await CreateStaff(staffData);

        if (!success) {
            return res.status(status).json({ errors, error, message, })
        }

        return res.status(status).json({ message, data, success });
    }

    return res.status(403).json({
        success: false,
        message: 'Unauthorized: only super_admin or admin can create staff',
    });
}

export const read_staffs = async (req, res) => {
    try {
        const {
            page = 1, limit = 10, offset,
            sortBy = 'createdAt', orderSequence = 'desc' } = req.query;

        const parsedLimit = parseInt(limit);

        // Count total records
        const total = await Staff.countDocuments();

        const { skip, nextUrl, prevUrl, totalPages, currentPage } = Pagination(
            parseInt(page),
            parsedLimit,
            offset,
            total,
            `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`, {});

        const sortField = ['name', 'email', 'createdAt'].includes(sortBy) ? sortBy : 'createdAt';
        const sortDirection = orderSequence === 'asc' ? 1 : -1;
        const sortOption = { [sortField]: sortDirection };

        const staffs = await Staff.find()
            .skip(skip)
            .limit(parsedLimit)
            .sort(sortOption);

        if (staffs.length === 0) {
            return res.status(404).json({
                error: 'Staff not found',
                success: false,
            });
        }

        return res.status(200).json({
            message: 'Staff fetched successfully.',
            pagination: {
                count: total,
                prevUrl,
                nextUrl,
                currentPage,
                totalPages,
                success: true,
            },
            data: staffs,
        });

    } catch (error) {
        console.log(`Errorr in 'ReadStaff'`, error.message);
        return { status: 500, success: false, error: 'Internal Server Error' };
    }
}

export const read_staff_byId = async (req, res) => {
    try {
        const staffId = req.params.id;
        const { id, role } = req.user;

        if (role === 'staff' && staffId !== id) {
            return res.status(400).json({
                error: 'You can access only own data',
                success: false,
            });
        }

        const staff = await Staff(staffId);

        if (!deletedStaff) {
            return res.status(404).json({
                error: 'Staff not found to delete',
                success: false,
            });
        }

        return res.status(user.status).json({
            data: staff,
            success: user.success,
        });

    } catch (error) {
        console.log(`Errorr in 'read_staff'`, error.message);
        return { status: 500, success: false, error: 'Internal Server Error' };
    }
}

export const update_staff = async (req, res) => {
    const staffId = req.params.id;
    const { id, role: m_role } = req.user;

    const {
        name, email, phone,
        role, permissions, isActive,
    } = req.body;

    const staffData = {
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        role: role || undefined,
        permissions: permissions ? Array.isArray(permissions) ? permissions : [permissions] : undefined,
        isActive: typeof isActive === 'string' ? isActive.toLowerCase() === 'true' : Boolean(false),
    }

    if (m_role === 'staff') {
        if (staffId !== id) return res.status(409).json({ message: 'Staff can update only own profile', data: staff, success: true });
        staffData.isActive = delete staffData.isActive;
    }

    const { status, error, errors, success, message, data } = await UpdateStaff(staffData, staffId);

    if (!success) {
        return res.status(status).json({ errors, error, message })
    }

    return res.status(status).json({ message, data, success });
}

export const remove_staff = async (req, res) => {
    try {
        const staffId = req.params.id;
        const { id, role } = req.user;

        if (role === 'staff') {
            if (id !== staffId)
                return res.status(409).json({ error: `You can delete own profile only`, success: false });

            await Staff.findByIdAndUpdate(staffId, { isActive: false });
        }

        const deletedStaff = await Staff.findByIdAndDelete(staffId);

        if (!deletedStaff) {
            return res.status(404).json({
                error: 'Staff not found to delete',
                success: false,
            });
        }

        return res.status(200).json({
            message: 'Staff deleted successfully',
            success: true,
        })
    } catch (error) {

    }
}

export const clear_staff = async (req, res) => {
    try {
        const result = await Staff.deleteMany();

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
