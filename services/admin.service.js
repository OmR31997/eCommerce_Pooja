import { GenerateEmail } from '../utils/fileHelper.js';
import bcrypt from 'bcryptjs';
import { Role } from '../models/role.model.js';
import { Admin } from '../models/admin.model.js';
import { Staff } from '../models/staff.model.js';
import { Vendor } from '../models/vendor.model.js';
import { User } from '../models/user.model.js';
import { CreateNotification } from './notification.service.js';
import { Return } from '../models/return.model.js';

export const CreateAdmin = async (adminData) => {
    const { email, password } = adminData;
    const AdminRoleId = await Role.findOne({ name: 'admin' });

    adminData.role = AdminRoleId;
    adminData.permission = AdminRoleId.permissions[0];
    adminData.email = email ? GenerateEmail(email, 'admin') : undefined;
    adminData.password = password ? await bcrypt.hash(password, 10) : undefined;

    const result = await Admin.create(adminData)

    return { status: 201, success: true, message: 'Admin created successfully!', data: result };
}

export const GetAdmin = async (user) => {
    let admin = undefined;

    if (user.role === 'admin')
        admin = await Admin.findById(user.id).populate({ path: 'role', select: '-permissions' }).populate('permission');
    else
        admin = await Admin.find().populate({ path: 'role', select: '-permissions' }).populate('permission');

    if (!admin || admin.length === 0) {
        throw {
            status: 404,
            message: 'Admin not found'
        }
    }

    return {
        status: 200,
        message: 'Date fetched successfully',
        data: admin,
        success: true
    }
}

export const UpdateAdmin = async (adminData, adminId) => {

    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, adminData);

    if (!updatedAdmin) {
        throw {
            status: 404,
            message: `Admin not found for ID: ${adminId}`
        }
    }

    return {
        status: 200,
        message: 'Admin updated successfully',
        data: adminData,
        success: true,
    };
}

export const DeleteAdmin = async (adminId) => {
    const deletedAdmin = await Admin.findByIdAndDelete(adminId);

    if (!deletedAdmin) {
        throw {
            status: 404,
            message: `Admin not found for ID: ${adminId}`
        }
    }

    return {
        status: 200,
        message: `Admin deleted successfully`,
        data: deletedAdmin,
        success: true
    };
}

export const ManageStaff = async (staffData, staffId) => {
    const updatedStaff = await Staff.findByIdAndUpdate(staffId, staffData);

    if (!updatedStaff) {
        throw {
            status: 404,
            message: `Staff account not found for ID: ${staffId}`
        }
    }

    return {
        status: 200,
        message: `Staff managed successfully`,
        data: updatedStaff,
        success: true
    };
}

export const ManageVendor = async (vendorId, status) => {

    const updatedVendor = await Vendor.findByIdAndUpdate(vendorId, { status }).lean();

    if (!updatedVendor) {
        throw {
            status: 404,
            message: `Vendor account not found for ID: ${vendorId}`,
        };
    }

    try {
        await CreateNotification({
            receiver: {
                receiverId: vendorId,
                role: 'vendor'
            },
            title: 'Account Status Update',
            message: `You vendor account has been ${status}.`,
            type: 'vendor'
        });
    } catch (NotifyError) {
        console.log("Notification failed:", NotifyError.message);
    }

    return {
        status: 200,
        message: `Vendor managed successfully`,
        data: { name: updatedVendor.name, status },
        success: true
    };
}

export const ManageUser = async (userData, userId) => {
    const updatedUser = await User.findByIdAndUpdate(userId, userData);

    if (!updatedUser) {

        throw {
            status: 404,
            message: `User account not found for ID: ${userId}`
        }
    }

    return { status: 200, message: `User managed successfully`, data: staffData, success: true };
}

export const ManageProduct = async (productId, status) => {

    const updatedProduct = await User.findByIdAndUpdate(productId, { status });

    if (!updatedProduct) {

        throw {
            status: 404,
            message: `Product not found for ID: ${productId}`
        }
    }

    try {
        await CreateNotification({
            receiver: {
                receiverId: updatedProduct.vendorId,
                role: 'vendor'
            },
            title: 'Product Status Updated',
            message: `Your product ${updatedProduct.name} has been ${status}.`,
            type: 'vendor'
        });
    } catch (NotifyError) {
        console.log("Notification failed:", NotifyError.message);
    }

    return {
        status: 200,
        message: 'Product managed successfully',
        data: { name: updatedProduct, status },
        success: true
    };
}

export const MangeReturn = async (returnId, returnStatus) => {
    const returnProduct = await Return.findByIdAndUpdate(returnId, { status: returnStatus }, { new: true })
        .populate({ path: 'productId', select: 'vendorId name' });

    if (!returnProduct) {
        throw {
            status: 404,
            message: `Product not found for ID: '${returnId}'`
        }
    }

    const vendorId = returnProduct.productId.vendorId;
    const productName = returnProduct.productId.name;
    try {
        await CreateNotification({
            receiver: {
                receiverId: vendorId,
                role: 'vendor'
            },
            title: 'Product Return Status Updated',
            message: `Your product ${productName} return has been updated to ${returnStatus}.`,
            type: 'return'
        });
    } catch (NotifyError) {
        console.log("Notification failed:", NotifyError.message);
    }

    return { status: 200, message: 'Return status updated successfully', success: true };
}

export const NotifyAdmins = async (options = {}) => {

    const { title, message, type } = options;

    const emails = [
        process.env.ADMIN_EMAIL ?? 'admin@support.com',
        process.env.SUPER_ADMIN_EMAIL ?? 'super@admin.com'
    ].filter(Boolean); //remove undefined values

    const admins = await Admin.find({ email: { $in: emails } }).populate({ path: 'role', select: 'name' });

    const notifyData = { title, message, type }

    for (const admin of admins) {
        notifyData.receiver = {
            receiverId: admin._id,
            role: admin.role.name
        }

        await CreateNotification(notifyData);
    }
}