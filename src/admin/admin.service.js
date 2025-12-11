import { error, FindOrderFail_H, FindProductFail_H, FindReturnFail_H, GenerateEmail_H, success } from "../../utils/helper.js";
import bcrypt from 'bcryptjs';
import { Role } from '../role/role.model.js';
import { Admin } from './admin.model.js';
import { Staff } from '../staff/staff.model.js';
import { Vendor } from '../vendor/vendor.model.js';
import { User } from '../customer/user.model.js';
import { Product } from '../product/product.model.js';
import { Permission } from '../permission/permission.model.js';
import { Notify } from '../notification/notification.service.js';
import { Refund } from "../refund/refund.model.js";

// CREATE SERVICES-------------------------------|
export const CreateAdmin = async (reqData) => {
    const { email, password } = reqData;
    const roleId = await Role.findOne({ name: 'admin' });
    const permissionId = await Permission({ name: 'admin' })

    reqData.role = roleId;
    reqData.permission = permissionId;
    reqData.email = email ? GenerateEmail_H(email, 'admin') : null;
    reqData.password = password ? await bcrypt.hash(password, 10) : null;

    const result = await Admin.create(reqData);

    return success({ message: 'Admin created successfully!', data: result })
}

// READ SERVICES-------------------------------|
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

    return success({ message: 'Date fetched successfully', data: admin });
}

// UPDATE SERVICES-------------------------------|
export const UpdateAdmin = async (keyVal, reqData) => {

    const updated = await Admin.findOneAndUpdate(keyVal, reqData, { new: true, runValidators: true });

    if (!updated) {
        error({ status: 404, message: `Admin not found for ID: ${keyVal._id}` });
    }

    return success({ message: 'Admin updated successfully', data: updated });
}

export const ManageStaff = async (staffId, reqData) => {
    const updatedStaff = await Staff.findByIdAndUpdate(staffId, reqData, { new: true, runValidators: true });

    if (!updatedStaff) {
        throw {
            status: 404,
            message: `Staff account not found for ID: ${staffId}`
        }
    }

    return {
        status: 200,
        message: `Staff managed successfully`,
        data: {
            _id: updatedStaff._id,
            name: updatedStaff.name,
            status: updatedStaff.status
        },
        success: true
    };
}

export const ManageVendor = async (vendorId, reqData) => {

    const updatedVendor = await Vendor.findByIdAndUpdate(vendorId, reqData, { new: true, runValidators: true });

    if (!updatedVendor) {
        throw {
            status: 404,
            message: `Vendor account not found for ID: ${vendorId}`,
        };
    }

    await Notify.vendor(vendorId, {
        title: 'Vendor Status Update',
        message: `Your vendor account has been ${reqData.status}.`,
        type: 'vendor'
    });

    return {
        status: 200,
        message: `Vendor managed successfully`,
        data: {
            _id: updatedVendor._id,
            name: updatedVendor.name,
            status: updatedVendor.status
        },
        success: true
    };
}

export const ManageUser = async (userId, reqData) => {
    const updatedUser = await User.findByIdAndUpdate(userId, reqData, { new: true, runValidators: true });

    if (!updatedUser) {

        throw {
            status: 404,
            message: `User account not found for ID: ${userId}`
        }
    }

    await Notify.vendor(userId, {
        title: 'User Status Update',
        message: `Your vendor account has been ${reqData.status}.`,
        type: 'vendor'
    })

    return {
        status: 200,
        message: `User managed successfully`,
        data: {
            _id: updatedUser._id,
            name: updatedUser.name,
            status: updatedUser.status
        },
        success: true
    };
}

export const ManageProduct = async (productId, reqData) => {

    const updatedProduct = await Product.findByIdAndUpdate(productId, reqData, { new: true, runValidators: true });

    if (!updatedProduct) {

        throw {
            status: 404,
            message: `Product not found for ID: ${productId}`
        }
    }

    await Notify.vendor(updatedProduct.vendorId, {
        title: 'Product Status Updated',
        message: `Your product ${updatedProduct.name} has been ${reqData.status}.`,
        type: 'vendor'
    })

    return {
        status: 200,
        message: 'Product managed successfully',
        data: {
            _id: updatedProduct._id,
            name: updatedProduct.name,
            status: updatedProduct.status
        },
        success: true
    };
}

export const ManageRefund = async (keyVal) => {

    const returnOrder = await FindReturnFail_H(keyVal, "status");

    if (returnOrder.status === "inspected") {
        const refundAmount = returnOrder.items.reduce((accume, item) => accume + item.subtotal, 0);

        const created = await Refund.create({
            returnId: returnOrder._id,
            orderId: returnOrder.orderId,
            userId: returnOrder.userId,
            amount: refundAmount,
            reason: returnOrder.reason,
            status: "initiated",
            initiatedBy: "admin"
        });

        returnOrder.status = "refund_initiated";
        returnOrder.refundId = created._id;

        await returnOrder.save();

        return {
            status: 201,
            success: true,
            message: "Refund initiated successfully",
            data: created
        }
    } else if (returnOrder.status !== "rejected") {
        return {
            status: 200,
            success: true,
            message: "Under processing",
            data: null
        }
    }
    else {
        return {
            status: 400,
            success: false,
            message: "Refund cannot be processed for rejected return",
            data: null
        }
    }
}

// DELETE SERVICES-------------------------------|
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