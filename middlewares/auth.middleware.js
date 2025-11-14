import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { Vendor } from '../models/vendor.model.js';
import { Staff } from '../models/staff.model.js';
import { Admin } from '../models/admin.model.js';
import { getModelByRole } from '../utils/fileHelper.js';


export const authentication = async (req, res, next) => {
    let authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            error: 'Unauthorized: Token not provided',
            success: false,
        });
    }

    // Auto-prepend Bearer if missing
    if (!authHeader.startsWith("Bearer ")) {
        authHeader = `Bearer ${authHeader}`;
    }

    const token = authHeader?.split(' ')[1];

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);

        if (!decode) {
            return res.status(401).json({
                error: 'Invalid or expired token',
            });
        }

        req.user = decode;

        next();

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
        })
    }
}

// Dynamic Authorization
export const authorizationRoles = (allowedRoles = []) => {
    return (req, res, next) => {
        const role = req.user?.role;

        if (!role || !allowedRoles.includes(role)) {
            return res.status(403).json({
                error: `Access denied: [${allowedRoles.join(', ')}] only`,
                success: true,
            });
        }

        next();
    }
}

export const authorizationAccess = (moduleName, actionKey, options = {}) => {
    return async (req, res, next) => {
        try {
            const authId = req.user.id;
            const authRole = req.user.role;

            const { collection } = getModelByRole(authRole);
            const Models = { Admin, Staff, Vendor, User }
            const Model = Models[collection];

            const existing = await Model.findById(authId).populate('role').populate('permissions');

            if (!existing) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const roleName = existing.role?.name || '';

            // Super Admin / Admin Override
            if (['super_admin', 'admin'].includes(roleName)) {
                return next();
            }

            // Self Access Rule (Reusable)
            if (options.allowSelf && req.params.id === authId.toString()) {
                return next();
            }

            // Permission Check
            const hasAccess = existing.permissions.some((perm) => {
                const moduleMatch = Array.isArray(perm.module)
                    ? perm.module.includes(moduleName)
                    : perm.module === moduleName;
                const acctionAllowed = perm.actions?.[actionKey] === true;
                return moduleMatch && acctionAllowed;

            });

            if (!hasAccess) {
                return res.status(403).json({
                    error: `Access denied: You don't have permission to ${actionKey} on ${moduleName}`,
                    success: false,
                });
            }

            next();
        } catch (error) {
            console.error("Authorization error:", error);
            res.status(500).json({ error: "Authorization check failed" });
        }
    }
}

export const filterRestrictedStaffFields = (req, res, next) => {

    const { role, permissions, isActive, status } = req.body;

    // Self-Update Restrictions
    delete req.body.role;
    delete req.body.permissions;
    delete req.body.isActive;
    delete req.body.status;

    next()
}