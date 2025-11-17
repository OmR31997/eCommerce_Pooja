import mongoose from "mongoose";
import { Permission } from "../models/permission.model.js";
import { Role } from "../models/role.model.js"; // you must have a Role model

export const create_roles = async (req, res) => {
    try {
        const { name, permissionIds, description } = req.body;

        let permissionsArray = [];

        if (permissionIds) {

            if (typeof permissionIds === "string") {
                permissionsArray = permissionIds.split(",").map(id => id.trim());
            }
            else if (Array.isArray(permissionIds)) {
                permissionsArray = permissionIds;
            }
            else {
                return res.status(400).json({
                    message: "permissionIds must be array or comma-separated string",
                    success: false
                });
            }

            for (const id of permissionsArray) {
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    return res.status(400).json({
                        error: `Invalid permission ID: ${id}`,
                        success: false,
                    });
                }
            }

            const foundPermissions = await Permission.find({
                _id: { $in: permissionsArray }
            });

            if (foundPermissions.length !== permissionsArray.length) {
                return res.status(400).json({
                    error: "Some permission IDs do not exist",
                    success: false,
                });
            }
        }

        const roleData = {
            name,
            description: description || "",
            permissions: permissionsArray.length > 0 ? permissionsArray : [],
        };

        const savedRole = await Role.create(roleData);

        return res.status(201).json({
            message: "Role created successfully",
            data: savedRole,
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: "Internal Server Error",
            success: false,
        });
    }
};

export const get_roles = async (req, res) => {
    try {
        const permissions = await Role.find().populate('permissions');

        if (!permissions || permissions.length === 0) {
            return res.status(404).json({
                error: 'Data not found',
                success: false,
            });
        }

        return res.status(200).json({
            message: 'Data fetched successfully',
            data: permissions,
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
            success: false
        });
    }
}

export const update_roles = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, permissionIds, description } = req.body;

        //Find role
        const role = await Role.findById(id);
        if (!role) {
            return res.status(404).json({
                message: "Role not found",
                success: false
            });
        }

        //Process & validate permissionIds (optional)
        if (permissionIds !== undefined) {
            let permissionsArray = [];

            // Convert string to array
            if (typeof permissionIds === "string") {
                permissionsArray = permissionIds.split(",").map(i => i.trim());
            }
            else if (Array.isArray(permissionIds)) {
                permissionsArray = permissionIds;
            }
            else {
                return res.status(400).json({
                    message: "permissionIds must be an array or comma-separated string",
                    success: false
                });
            }

            // Validate each ObjectId
            for (const permId of permissionsArray) {
                if (!mongoose.Types.ObjectId.isValid(permId)) {
                    return res.status(400).json({
                        error: `Invalid permission ID: ${permId}`,
                        success: false,
                    });
                }
            }

            // Validate existence of each permission
            const foundPermissions = await Permission.find({
                _id: { $in: permissionsArray }
            });

            if (foundPermissions.length !== permissionsArray.length) {
                return res.status(400).json({
                    error: "One or more permission IDs do not exist",
                    success: false,
                });
            }

            role.permissions = permissionsArray;
        }

        // Update name if provided
        if (name !== undefined) {
            role.name = name;
        }

        // Update description if provided
        if (description !== undefined) {
            role.description = description;
        }

        // Save role
        const updatedRole = await role.save();

        return res.status(200).json({
            message: "Role updated successfully",
            data: updatedRole,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
            success: false
        });
    }
};

export const delete_role = async (req, res) => {
    const { id } = req.params;

    const role = await Role.findById(id);

    if (!role) {
        return res.status(404).json({
            message: "Data not found",
            success: false
        });
    }

    await Role.findByIdAndDelete(id);

    return res.status(200).json({
        message: "Data deleted successfully",
        data: role,
        success: true
    });

}

export const clear_roles = async (req, res) => {
    try {
        const result = await Role.deleteMany({});

        return res.status(200).json({
            message: "All roles have been deleted successfully",
            data: result,
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
            success: false,
        });
    }
}