import mongoose from "mongoose";
import { Role } from "./role.model.js";
import { BuildQuery_H, FindRoleFail_H, Pagination_H, success } from "../../utils/helper.js";

export const GetRoles = async (options) => {

    const { filter = {}, pagingReq = {}, baseUrl, select } = options;

    const matchedQuery = BuildQuery_H(filter, 'admin');

    const total = await Role.countDocuments(matchedQuery);

    const pagination = Pagination_H(pagingReq.page, pagingReq.limit, undefined, total, baseUrl, matchedQuery);

    const sortField = ['name', 'createdAt'].includes(pagingReq.sortBy) ? pagingReq.sortBy : 'createdAt';
    const sortDirection = pagingReq.orderSequence === 'asc' ? 1 : -1;
    const sortOption = { [sortField]: sortDirection };


    const roles = await Role.find(matchedQuery)
        .skip(pagination.skip)
        .limit(pagingReq.limit)
        .sort(sortOption)
        .select(select)
        .lean();;

    delete pagination.skip;
    return success({ message: 'Date fetched successfully', data: roles || [], pagination });
}

export const GetRoleById = async (keyVal) => {

    const role = await FindRoleFail_H(keyVal);

    return success({ message: "Data fetched successfully", data: role });
}

export const CreateRole = async (reqData) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const created = await Role.create([reqData], { session });

        await session.commitTransaction();

        return success({ message: "Role created successfully", data: created[0] });

    } catch (error) {

        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        throw error;
    }
    finally {
        session.endSession();
    }
}

export const UpdateRole = async (keyVal, reqData) => {

    const { addPermissions = [], removePermissions = [], ...rest } = reqData;

    const session = await mongoose.startSession();
    session.startTransaction()

    try {
        const role = await Role.findOne(keyVal).session(session);

        if (!role) {
            throw {
                status: 404,
                message: `Role not found ID: '${keyVal._id}'`
            }
        }

        // Initialize update operations for modules and actions
        let updateOps = { $set: {}, $push: {}, $pull: {} };

        // 1. Handle Add permission IDs
        if (addPermissions.length > 0) {
            updateOps.$addToSet = { permissions: { $each: addPermissions } };
        }

        // 2. Handle remove permission IDs
        if (removePermissions.length > 0) {
            updateOps.$pull.permissions = { $in: removePermissions };
        }

        for (const [key, val] of Object.entries(rest)) {
            if (val !== undefined) updateOps.$set[key] = val;
        }

        if (updateOps.$addToSet && updateOps.$addToSet.permissions?.length === 0) delete updateOps.$addToSet;
        if (updateOps.$pull && updateOps.$pull.permissions?.length === 0) delete updateOps.$pull
        if (Object.keys(updateOps.$set).length === 0) delete updateOps.$set;

        const updated = await Role.findOneAndUpdate(
            keyVal,
            updateOps,
            { new: true, runValidators: true, session }
        );

        await session.commitTransaction();

        return success({ message: "Data fetched successfully", data: updated });

    } catch (error) {

        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        throw error;
    }
    finally {
        session.endSession();
    }
}

export const DeleteRole = async (keyVal) => {
    const session = await mongoose.startSession();
    session.startTransaction()
    try {


        const deleted = await Role.findOneAndDelete(keyVal, { session }).select('name');

        if (!deleted) {
            throw {
                status: 404,
                message: `Role not found for ID: '${keyVal._id}'`
            }
        }
        await session.commitTransaction();
        return success({
            message: "Role deleted successfully",
            data: deleted
        });

    } catch (error) {

        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        throw error;
    }
    finally {
        session.endSession();
    }
}

export const ClearRoles = async (keyVal) => {
    const result = await Role.deleteMany({});

    if(result.deletedCount === 0) {
        throw {
            status: 404,
            message: "Role not found for delete"
        }
    }

    return success({
        message: "All Roles have been deleted successfully",
        deletedCount: result.deletedCount
    });
}