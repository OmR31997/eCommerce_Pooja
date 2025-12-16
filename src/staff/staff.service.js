import bcrypt from "bcryptjs";
import { Staff } from "./staff.model.js";
import { BuildQuery_H, FindRoleFail_H, Pagination_H, Permission_H, success } from '../../utils/helper.js';

export const GetStaffs = async (options) => {
    const { filter = {}, pagingReq = {}, baseUrl } = options;

    const matchedQuery = BuildQuery_H(filter, 'staff');

    const total = await Staff.countDocuments(matchedQuery);

    const pagination = Pagination_H(pagingReq.page, pagingReq.limit, undefined, total, baseUrl, matchedQuery);

    const sortField = ['name', 'createdAt'].includes(pagingReq.sortBy) ? pagingReq.sortBy : 'createdAt';
    const sortDirection = pagingReq.orderSequence === 'asc' ? 1 : -1;
    const sortOption = { [sortField]: sortDirection };


    const staffs = await Staff.find(matchedQuery)
        .populate({ path: "role", select: "name" })
        .skip(pagination.skip)
        .limit(pagingReq.limit)
        .sort(sortOption)
        .lean();

    delete pagination.skip;
    return success({ 
        message: 'Date fetched successfully', 
        data: staffs || [], 
        pagination });
}

export const GetStaffByID = async (keyVal) => {
    const staff = await Staff.findOne(keyVal)
        .populate({ path: "role", select: "name" });

    if (!staff) {
        throw {
            status: 404,
            message: `Staff not found for ID: '${keyVal._id}'`
        }
    }

    return success({ message: "Data fetched successfully", data: staff });
}

export const CreateStaff = async (reqData) => {

    const { permissionName, password, ...rest } = reqData;
    const role = await FindRoleFail_H({ name: "staff" }, "_id");

    const permissionId = await Permission_H(permissionName);

    const staffData = {
        ...rest,
        role: role._id,
        permission: permissionId
    }

    if (password) {
        staffData.password = await bcrypt.hash(password, Number(process.env.HASH_SALT));
    }

    const created = await Staff.create(staffData);

    return success({
        message: "Staff Created Successfully",
        data: created,
    });
}

export const UpdateStaff = async (keyVal, reqData) => {
    const { permissionName, role, ...rest } = reqData;

    const staffData = { ...rest };

    if (role) {
        const role = await FindRoleFail_H({ name: "staff" }, "_id");

        staffData.role = role._id;
    }

    if (permissionName) {
        staffData.permission = await Permission_H(permissionName);
    }

    const updated = await Staff.findOneAndUpdate(keyVal, staffData, { new: true, runValidators: true });

    if (!updated) {
        throw {
            status: 404,
            message: `Staff not found for ID: '${keyVal._id}'`
        }
    }

    return success({
        message: 'Staff updated Successfully',
        data: updated
    });
}

export const DeleteStaff = async (keyVal) => {
    const deleted = await Staff.findOneAndDelete(keyVal);

    if (!deleted) {
        throw {
            status: 404,
            message: `Staff not for ID: '${keyVal._id}'`
        }
    }

    return success({
        message: "Staff deleted successfully.",
        data: deleted
    });
}

export const ClearStaff = async () => {
    const result = await Staff.deleteMany({});

    if (result.deletedCount === 0) {
        throw {
            status: 404,
            message: "Staff not found for delete"
        }
    }
    
    return success({
        message: "All staffs have been deleted successfully",
        deletedCount: result.deletedCount
    });
}