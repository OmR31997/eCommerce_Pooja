import { CleanIntoArray_H } from "../../utils/helper.js";
import { ClearRoles, CreateRole, DeleteRole, GetRoleById, GetRoles, UpdateRole } from "./role.service.js";

// READ-----------------------|
export const get_roles = async (req, res, next) => {
    try {
        const {
            page = 1, limit = 10,
            search,
            sortBy = '-createdAt', orderSequence = '-1'
        } = req.query;

        const options = {
            baseUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,

            pagingReq: {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy, orderSequence
            },

            filter: {
                search
            },
        }

        const response = await GetRoles(options);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const get_role_by_id = async (req, res, next) => {
    try {

        const keyVal = { _id: req.params.roleId }

        const response = await GetRoleById(keyVal);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

// CREATE---------------------|
export const create_role = async (req, res, next) => {
    try {
        const { name, permissionsIds, description } = req.body;

        const reqData = {
            name,
            permissions: [...new Set(CleanIntoArray_H(permissionsIds))],
            description
        }

        const response = await CreateRole(reqData);

        return res.status(201).json(response);

    } catch (error) {
        next(error);
    }
}

// UPDATE---------------------|
export const update_role = async (req, res, next) => {
    try {
        const keyVal = { _id: req.params.roleId };
        const { name, addPermissionsIds, removePermissionsIds, description } = req.body;

        const reqData = {
            name,
            addPermissions: [...new Set(CleanIntoArray_H(addPermissionsIds))],
            removePermissions: [...new Set(CleanIntoArray_H(removePermissionsIds))],
            description
        }

        if (!reqData.name && 
            !reqData.description && 
            reqData.addPermissions.length === 0 &&
            reqData.removePermissions.length === 0
        ) {
            throw {
                status: 400,
                message: `'name', 'addPermissionsIds', 'removePermissionsIds', or 'description' field must be provided to update permissions!`
            }
        }

        const response = await UpdateRole(keyVal, reqData);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

// DELETE---------------------|
export const delete_role = async (req, res, next) => {
    try {
        const keyVal = { _id: req.params.roleId };

        const response = await DeleteRole(keyVal);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const clear_all_roles = async (req, res, next) => {
    try {
        const response = await ClearRoles();

        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};