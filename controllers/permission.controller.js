import { Permission } from "../models/permission.model.js";

export const create_permissions = async (req, res) => {
    try {
        const { name, modulesName, description, actions } = req.body;
        
        // Normalize modules
        let modules = [];
        if (Array.isArray(modulesName)) {
            modules = modulesName.map(m => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase());
        } else if (typeof modulesName === "string") {
            modules = modulesName
                .split(',')
                .map(m => m.trim())
                .map(m => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase());
        }

        // Validate actions format (must be object according to schema)
        const actionObject = {
            isCreate: actions?.isCreate ?? false,
            isRead: actions?.isRead ?? true,
            isUpdate: actions?.isUpdate ?? false,
            isDelete: actions?.isDelete ?? false,
            isApproved: actions?.isApproved ?? false,
        };

        const permissionData = {
            name,
            module: modules,
            description: description || '',
            actions: actionObject,
        };

        const savedPermission = await Permission.create(permissionData);

        return res.status(201).json({
            message: "Permission created successfully",
            data: savedPermission,
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

export const update_permission = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, modulesName, description, actions } = req.body;

        const permission = await Permission.findById(id);
        if (!permission) {
            return res.status(404).json({
                message: "Permission not found",
                success: false
            });
        }

        // -----------------------------
        // 1️⃣ Update name
        // -----------------------------
        if (name) permission.name = name;


        // -----------------------------
        // 2️⃣ Update modules
        // -----------------------------
        if (modulesName) {

            let modules = [];

            if (Array.isArray(modulesName)) {
                modules = modulesName.map(m =>
                    m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()
                );
            } else if (typeof modulesName === "string") {
                modules = modulesName
                    .split(",")
                    .map(m => m.trim())
                    .map(m =>
                        m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()
                    );
            }

            permission.module = modules;
        }


        // -----------------------------
        // 3️⃣ Update description
        // -----------------------------
        if (description !== undefined) {
            permission.description = description;
        }


        // -----------------------------
        // 4️⃣ Update actions (partial allowed)
        // -----------------------------
        if (actions && typeof actions === "object") {
            const allowedKeys = [
                "isCreate",
                "isRead",
                "isUpdate",
                "isDelete",
                "isApproved"
            ];

            for (const key of allowedKeys) {
                if (actions[key] !== undefined) {
                    permission.actions[key] = actions[key];
                }
            }
        }


        // Save updated data
        await permission.save();

        return res.status(200).json({
            message: "Permission updated successfully",
            data: permission,
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

export const delete_permission = async (req, res) => {
    try {
        const { id } = req.params;

        const permission = await Permission.findById(id);

        if (!permission) {
            return res.status(404).json({
                message: "Permission not found",
                success: false
            });
        }

        await Permission.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Permission deleted successfully",
            deletedPermission: permission,
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

export const clear_all_permissions = async (req, res) => {
    try {
        const result = await Permission.deleteMany({});

        return res.status(200).json({
            message: "All permissions have been deleted successfully",
            deletedCount: result.deletedCount,
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
            success: false,
        });
    }
};
