import path from 'path';
import fs from 'fs';
import { exec } from "child_process";
import util from 'util';
import { ErrorHandle, GenerateEmail } from '../utils/fileHelper.js';
import bcrypt from 'bcryptjs';
import { Role } from '../models/role.model.js';
import { Permission } from '../models/permission.model.js';
import { Admin } from '../models/admin.model.js';
import { Staff } from '../models/staff.model.js';
import { Vendor } from '../models/vendor.model.js';
import { User } from '../models/user.model.js';

const execPromise = util.promisify(exec);

export const MONGO_DB_BACKUP = async (user) => {
    try {
        const { role, isSuper, secureKey } = user;
        if (role !== 'admin' || !isSuper) {
            return { status: 403, error: 'Unauthorized', success: false };
        }

        if (secureKey !== process.env.BACKUP_SECRET) {
            return { status: 403, error: 'Invalid backup key', success: false }
        }

        const fileName = `backup-${Date.now()}.gz`;
        const dir = path.join(process.cwd(), 'tmp')

        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const backupPath = path.join(dir, fileName);

        const cmd = `mongodump --uri="${process.env.DB_URI}" --archive="${backupPath}" --gzip`;

        await execPromise(cmd);

        const clearFile = () => {
            if (fs.existsSync(backupPath)) {
                fs.unlinkSync(backupPath);
            }
        };

        return { status: 200, success: true, backupPath, fileName, clearFile };
    } catch (error) {
        console.log(error.message);
        const handled = await ErrorHandle(error, 'CreateStaff');
        return handled || { status: 500, success: false, error: 'Internal Server Error' };
    }
}

export const CreateAdmin = async (adminData) => {
    try {
        const { email, password } = adminData;
        const AdminRoleId = await Role.findOne({ name: 'admin' });
        const AdminPermissons = await Permission.findOne({ name: 'admin' });

        adminData.role = AdminRoleId;
        adminData.permissions = AdminPermissons;
        adminData.email = email ? GenerateEmail(email, 'admin') : undefined;
        adminData.password = password ? await bcrypt.hash(password, 10) : undefined;

        const result = await Admin.create(adminData)

        return { status: 201, success: true, message: 'Admin created successfully!', data: result };
    } catch (error) {
        console.log(error.message);
        const handled = await ErrorHandle(error, 'CreateAdmin');
        return handled || { status: 500, success: false, error: 'Internal Server Error' };
    }
}

export const ReadAdmin = async (user) => {
    try {

        let admin = undefined;

        if (user.role === 'admin')
            admin = await Admin.findById(user.id);
        else
            admin = await Admin.find();

        if (!admin || admin.length === 0) {
            return {
                status: 404,
                error: 'Admin not found',
                success: false,
            }
        }

        return {
            status: 200,
            message: 'Date fetched successfully',
            data: admin,
            success: true
        }
    } catch (error) {
        console.log(error.message);
        const handled = await ErrorHandle(error, 'ReadAdmin');
        return handled || { status: 500, success: false, error: 'Internal Server Error' };
    }
}

export const UpdateAdmin = async (adminData, adminId) => {
    try {

        const updatedAdmin = await Admin.findByIdAndUpdate(adminId, adminData);

        if (!updatedAdmin) {
            return {
                status: 404,
                error: `Admin not found for ID: ${adminId}`,
                success: false,
            }
        }

        return {
            status: 200,
            message: 'Admin updated successfully',
            data: adminData,
            success: true,
        };

    } catch (error) {
        console.log(error.message);
        const handled = await ErrorHandle(error, 'UpdateAdmin');
        return handled || { status: 500, success: false, error: 'Internal Server Error' };
    }
}

export const DeleteAdmin = async (adminId) => {
    try {

        const deletedAdmin = await Admin.findByIdAndDelete(adminId);

        if (!deletedAdmin) return { status: 404, error: `Admin not found for ID: ${adminId}`, success: false };

        return { status: 200, message: `Admin deleted successfully`, data: deletedAdmin, success: true };

    } catch (error) {
        console.log(error.message);
        const handled = await ErrorHandle(error, 'DeleteAdmin');
        return handled || { status: 500, success: false, error: 'Internal Server Error' };
    }
}

export const ManageStaff = async (staffData, staffId) => {
    try {

        const updatedStaff = await Staff.findByIdAndUpdate(staffId, staffData);

        if (!updatedStaff) return { status: 404, error: `Staff not found for ID: ${staffId}`, success: false }

        return { status: 200, error: `Staff managed successfully`, data: staffData, success: true };

    } catch (error) {
        console.log(error.message);
        const handled = await ErrorHandle(error, 'ManageStaff');
        return handled || { status: 500, success: false, error: 'Internal Server Error' };
    }
}

export const ManageVendor = async (vendorData, vendorId) => {
    try {

        const updatedVendor = await Vendor.findByIdAndUpdate(vendorId, vendorData);

        if (!updatedVendor) return {
            status: 400,
            error: `Vendor not found for ID: ${vendorId}`,
            data: vendorData, success: false
        };

        return { status: 200, error: `Vendor managed successfully`, data: staffData, success: true };

    } catch (error) {
        console.log(error.message);
        const handled = await ErrorHandle(error, 'ManageVendor');
        return handled || { status: 500, success: false, error: 'Internal Server Error' };
    }
}

export const ManageUser = async (userData, userId) => {
    try {

        const updatedUser = await User.findByIdAndUpdate(userId, userData);

        if (!updatedUser) return {
            status: 200,
            error: `User not found for ID: ${userId}`,
            data: userData, success: false
        };

        return { status: 200, error: `User managed successfully`, data: staffData, success: true };


    } catch (error) {
        console.log(error.message);
        const handled = await ErrorHandle(error, 'ManageUser');
        return handled || { status: 500, success: false, error: 'Internal Server Error' };
    }
}

export const ManageProduct = async (productData, productId) => {
    try {

        const updatedProduct = await User.findByIdAndUpdate(productData, productId);

        if (!updatedProduct) return { 
            status: 404, 
            error: `Product not found for ID: ${productId}`, 
            success: false, }

        return {
            status: 200,
            message: '{Product managed successfully',
            data: updatedUser,
            success: true
        };

    } catch (error) {
        console.log(error.message);
        const handled = await ErrorHandle(error, 'ManageProduct');
        return handled || { status: 500, success: false, error: 'Internal Server Error' };
    }
}
