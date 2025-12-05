import mongoose from 'mongoose';
import bcrypt from "bcryptjs";
import { Staff } from "./staff.model.js";
import { Role } from '../role/role.model.js';
import { Permission } from '../permission/permission.model.js';
import { ErrorHandle_H } from '../../utils/helper.js';

export const CreateStaff = async (staffData) => {
    try {

        const { permissions, role } = staffData;

        if (role && !mongoose.Types.ObjectId.isValid(role)) return { status: 400, success: false, error: `Invalid permission IDs detected from 'role' field` };

        const isExistRole = await Role.findById(role);

        if (!isExistRole) return { status: 404, success: false, error: 'role not found' };

        let permissionIds = [];
        if (permissions && permissions.length > 0) {
            const invalidIds = permissions.filter((id) => !mongoose.Types.ObjectId.isValid(id));

            if (invalidIds.length > 0) {
                return {
                    status: 400,
                    success: false,
                    error: 'Invalid permission IDs detected',
                }
            }

            const found = await Permission.find({ _id: { $in: permissions } });

            if (found.length !== permissions.length)
                return { status: 400, success: false, error: 'Some permissions not found' };

            permissionIds = found.map(p => p._id);
        }

        if (staffData.password) {
            staffData.password = await bcrypt.hash(staffData.password, Number(process.env.HASH_SALT));
        }

        const response = await Staff.create({ ...staffData, permissions: permissionIds });

        return { status: 200, success: true, data: response, message: 'Staff Created Successfully' };

    } catch (error) {
        console.log(error.message);
        const handled = await ErrorHandle_H(error, 'CreateStaff');
        return handled || { status: 500, success: false, error: 'Internal Server Error' };
    }
}

export const UpdateStaff = async (staffData, staffId) => {
    try {
        const { permissions } = staffData;

        let permissionIds = [];
        if (permissions && permissions.length > 0) {

            const invalidIds = permissions.filter((id) => !mongoose.Types.ObjectId.isValid(id));

            if (invalidIds.length > 0) {
                return {
                    status: 400,
                    success: false,
                    error: 'Invalid permission IDs detected',
                }
            }

            const found = await Permission.find({ _id: { $in: permissions } })

            if (found.length !== permissions.length)
                return { status: 400, success: false, error: 'Some permissions not found' };

            permissionIds = found.map(p => p._id);
        }

        if (staffData.password) {
            staffData.password = await bcrypt.hash(staffData.password, Number(process.env.HASH_SALT));
        }

        const updatedStaff = await Staff.findByIdAndUpdate(staffId, staffData);

        if (!updatedStaff)
            return {
                status: 404,
                error: 'Staff not found',
                success: false,
            }

        return { status: 200, message: 'Staff updated Successfully', success: true, data: { staffId, ...staffData } };

    } catch (error) {

        console.log(error.message)
        const handle = ErrorHandle_H(error, 'UpdateStaff');
        return { status: 500, success: false, error: handle ? handle?.error : handle.errors || 'Internal Server Error' };
    }
}