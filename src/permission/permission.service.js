import mongoose from "mongoose";
import { Permission } from "./permission.model.js";
import { BuildQuery_H, Pagination_H, success } from "../../utils/helper.js";

// READ---------------------|
export const GetPermissions = async (options) => {

    const { filter = {}, pagingReq = {}, baseUrl, select } = options;

    const matchedQuery = BuildQuery_H(filter, 'admin');

    const total = await Permission.countDocuments(matchedQuery);

    const pagination = Pagination_H(pagingReq.page, pagingReq.limit, undefined, total, baseUrl, matchedQuery);

    const sortField = ['name', 'createdAt'].includes(pagingReq.sortBy) ? pagingReq.sortBy : 'createdAt';
    const sortDirection = pagingReq.orderSequence === 'asc' ? 1 : -1;
    const sortOption = { [sortField]: sortDirection };


    const permissions = await Permission.find(matchedQuery)
        .skip(pagination.skip)
        .limit(pagingReq.limit)
        .sort(sortOption)
        .select(select)
        .lean();;

    return success({ message: 'Date fetched successfully', data: permissions || [], pagination });
}

export const GetPermissionById = async (keyVal) => {
    const permission = await Permission.findOne(keyVal);

    if (!permission) {
        throw {
            status: 404,
            message: `Permission not found for ID: '${keyVal._id}'`
        }
    }

    return success({ message: "Data fetched successfully", data: permission });
}

// CREATE-------------------|
export const CreatePermission = async (reqData) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const created = await Permission.create([reqData], { session });

        await session.commitTransaction();

        return success({ message: "Permission created successfully", data: created[0] });

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

// UPDATE-------------------|
export const UpdatePermission = async (keyVal, reqData) => {

    const { addModules = [], removeModules = [], actions = {}, ...rest } = reqData;

    const session = await mongoose.startSession();
    session.startTransaction()

    try {
        const permission = await Permission.findOne(keyVal).session(session);

        if (!permission) {
            throw {
                status: 404,
                message: `Permission not found ID: '${keyVal._id}'`
            }
        }

        // Initialize update operations for modules and actions
        let updateOps = { $set: {}, $push: {}, $pull: {} };

        // 1. Handle Add Modules:
        if (addModules.length > 0) {
            updateOps.$addToSet = { modules: { $each: addModules } };
        }

        // 2. Handle Remove Modules:
        if (removeModules.length > 0) {
            updateOps.$pull.modules = { $in: removeModules };
        }

        // 3. Handle Actions (set true/false for the actions)
        if (Object.keys(actions).length > 0) {
            Object.keys(actions).forEach(actionKey => {
                updateOps.$set[`actions.${actionKey}`] = actions[actionKey];
            });
        }

        // 4. Handle rest
        for (const [key, val] of Object.entries(rest)) {
            if (val !== undefined) updateOps.$set[key] = val;
        }

        if (Object.keys(updateOps).length === 0) {
            throw {
                status: 400,
                message: "Nothing to update"
            };
        }

        if (updateOps.$addToSet && updateOps.$addToSet.modules.length === 0) delete updateOps.$addToSet;
        if (updateOps.$pull && updateOps.$pull.modules.length === 0) delete updateOps.$pull
        if (Object.keys(updateOps.$set).length === 0) delete updateOps.$set;

        const updated = await Permission.findOneAndUpdate(keyVal, updateOps, { new: true, runValidators: true, session });

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

// DELETE-------------------|
export const DeletePermission = async (keyVal) => {
    const session = await mongoose.startSession();
    session.startTransaction()
    try {


        const deleted = await Permission.findOneAndDelete(keyVal, { session }).select('name');

        if (!deleted) {
            throw {
                status: 404,
                message: `Permission not found for ID: '${keyVal._id}'`
            }
        }
        await session.commitTransaction();
        return success({
            message: "Permission deleted successfully",
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

export const ClearPermissions = async (keyVal) => {
    const result = await Permission.deleteMany({});

    return success({
        message: "All permissions have been deleted successfully",
        data: {deletedCount: result.deletedCount}
    });
}