import { BuildQuery_H, FindReturnFail_H, GenerateEmail_H, Pagination_H, success } from "../../utils/helper.js";
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

// READ----------------------------------|
export const GetAdmins = async (options) => {

    const { filter = {}, pagingReq = {}, baseUrl, select } = options;

    const matchedQuery = BuildQuery_H(filter, 'admin');

    const total = await Admin.countDocuments(matchedQuery);

    const pagination = Pagination_H(pagingReq.page, pagingReq.limit, undefined, total, baseUrl, matchedQuery);

    const sortField = ['name', 'createdAt'].includes(pagingReq.sortBy) ? pagingReq.sortBy : 'createdAt';
    const sortDirection = pagingReq.orderSequence === 'asc' ? 1 : -1;
    const sortOption = { [sortField]: sortDirection };


    const admins = await Admin.find(matchedQuery)
        .populate({ path: 'role', select: '-permissions' })
        .populate('permission')
        .skip(pagination.skip)
        .limit(pagingReq.limit)
        .sort(sortOption)
        .select(select)
        .lean();;

    return success({ message: 'Date fetched successfully', data: admins || [], pagination });
}

export const GetAdminById = async (keyVal) => {

    const admin = await Admin.findOne(keyVal);

    if (!admin) {
        throw {
            status: 404,
            message: `Admin not found for ID: '${keyVal._id}'`
        }
    }

    return success({ message: "Data fetched successfully", data: admin });
}

// CREATE--------------------------------|
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

// UPDATE SERVICES-------------------------------|
export const UpdateAdmin = async (keyVal, reqData) => {

    const updated = await Admin.findOneAndUpdate(keyVal, reqData, { new: true, runValidators: true });

    if (!updated) {
        throw { status: 404, message: `Admin not found for ID: ${keyVal._id}` };
    }

    return success({ message: 'Admin updated successfully', data: updated });
}

export const ManageStaff = async (keyVal, reqData) => {
    const updatedStaff = await Staff.findOneAndUpdate(keyVal, reqData, { new: true, runValidators: true });

    if (!updatedStaff) {
        throw {
            status: 404,
            message: `Staff account not found for ID: ${keyVal._id}`
        }
    }

    return success({
        message: "Staff managed successfully",
        data: {
            _id: updatedStaff._id,
            name: updatedStaff.name,
            status: updatedStaff.status
        }
    });
}

export const ManageVendor = async (keyVal, reqData) => {

    const updatedVendor = await Vendor.findOneAndUpdate(keyVal, reqData, { new: true, runValidators: true });

    if (!updatedVendor) {
        throw {
            status: 404,
            message: `Vendor account not found for ID: ${keyVal._id}`,
        };
    }

    await Notify.vendor(updatedVendor._id, {
        title: 'Vendor Status Update',
        message: `Your vendor account has been ${updatedVendor.status}.`,
        type: 'vendor'
    });

    return success({
        message: `Vendor managed successfully`,
        data: {
            _id: updatedVendor._id,
            name: updatedVendor.name,
            status: updatedVendor.status
        }
    });
}

export const ManageUser = async (keyVal, reqData) => {
    const updatedUser = await User.findOneAndUpdate(keyVal, reqData, { new: true, runValidators: true });

    if (!updatedUser) {

        throw {
            status: 404,
            message: `User account not found for ID: ${keyVal._id}`
        }
    }

    await Notify.user(updatedUser._id, {
        title: 'User Status Update',
        message: `Your vendor account has been ${updatedUser.status}.`,
        type: 'vendor'
    })

    return success({
        message: `User managed successfully`,
        data: {
            _id: updatedUser._id,
            name: updatedUser.name,
            status: updatedUser.status
        }
    });
}

export const ManageProduct = async (keyVal, reqData) => {

    const updatedProduct = await Product.findOneAndUpdate(keyVal, reqData, { new: true, runValidators: true });

    if (!updatedProduct) {

        throw {
            status: 404,
            message: `Product not found for ID: ${keyVal._id}`
        }
    }

    await Notify.vendor(updatedProduct.vendorId, {
        title: 'Product Status Updated',
        message: `Your product ${updatedProduct.name} has been ${reqData.status}.`,
        type: 'product'
    })

    return success({
        message: 'Product managed successfully',
        data: {
            _id: updatedProduct._id,
            name: updatedProduct.name,
            status: updatedProduct.status
        }
    });
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

        return success({
            message: "Refund initiated successfully",
            data: created
        });

    } else if (returnOrder.status !== "rejected") {
        return success({
            message: "Under processing",
            data: null
        });
    }
    else {
        return success({
            message: "Refund cannot be processed for rejected return",
            data: null
        });
    }
}

// DELETE SERVICES-------------------------------|
export const DeleteAdmin = async (keyVal) => {

    const deletedAdmin = await Admin.findOneAndDelete(keyVal).select('_id name');

    if (!deletedAdmin) {
        throw {
            status: 404,
            message: `Admin not found for ID: ${keyVal._id}`
        }
    }

    return success({
        message: `Admin deleted successfully`,
        data: deletedAdmin,
    });
}