import { ClearPermissions, CreatePermission, DeletePermission, GetPermissionById, GetPermissions, UpdatePermission } from "./permission.service.js";
import { CleanIntoArray_H } from "../../utils/helper.js";

// READ-----------------------|
export const get_permissions = async (req, res, next) => {
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

        const response = await GetPermissions(options);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const get_permission_by_id = async (req, res, next) => {
    try {

        const keyVal = { _id: req.params.permissionId }

        const response = await GetPermissionById(keyVal);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

// CREATE---------------------|
export const create_permissions = async (req, res, next) => {
    try {
        const { name, modules, description, actions } = req.body;

        const cleanedActions = CleanIntoArray_H(actions);

        const reqData = {
            name, 
            modules: [...new Set(CleanIntoArray_H(modules))], 
            description, actions: {}
        }

        // Optional: Validate actions to check if they match predefined action keys
        const validActions = ['create', 'read', 'update', 'delete', 'approve', 'backup'];

        if (cleanedActions.length > 0) {
            const actionObj = {};

            validActions.forEach(action => {
                actionObj[action] = cleanedActions.includes(action);
            });

            reqData.actions = actionObj;
        }

        const response = await CreatePermission(reqData);

        return res.status(201).json(response);
    } catch (error) {
        next(error);
    }
}

// UPDATE---------------------|
export const update_permission = async (req, res, next) => {
    try {
        const keyVal = {
            _id: req.params.permissionId
        };

        const { addModules, removeModules, actions } = req.body;

        const cleanedActions = CleanIntoArray_H(actions);

        const reqData = {
            addModules: CleanIntoArray_H(addModules),
            removeModules: CleanIntoArray_H(removeModules),
            actions: {}
        };

        // Optional: Validate actions to check if they match predefined action keys
        const validActions = ['create', 'read', 'update', 'delete', 'approve', 'backup'];

        if (cleanedActions.length > 0) {
            const actionObj = {};

            validActions.forEach(action => {
                actionObj[action] = cleanedActions.includes(action);
            });

            reqData.actions = actionObj;
        }

        // Check that at least one of addModules, removeModules, or actions is provided
        if (!reqData.addModules.length &&
            !reqData.removeModules.length &&
            cleanedActions.length === 0) {
            throw {
                status: 400,
                message: `'addModules', 'removeModules', or 'actions' field must be provided to update permissions!`
            };
        }

        const response = await UpdatePermission(keyVal, reqData);

        return res.status(200).json(response)
    } catch (error) {
        next(error);
    }
}

// DELETE---------------------|
export const delete_permission = async (req, res, next) => {
    try {
        const keyVal = { _id: req.params.permissionId };

        const response = await DeletePermission(keyVal);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
};

export const clear_all_permissions = async (req, res, next) => {
    try {
        const response = await ClearPermissions();

        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};
