import jwt from 'jsonwebtoken';
import { User } from '../src/customer/user.model.js';
import { Vendor } from '../src/vendor/vendor.model.js';
import { Staff } from '../src/staff/staff.model.js';
import { Admin } from '../src/admin/admin.model.js';
import { IdentifyModelByRole_H } from '../utils/helper.js';

export const Authentication = async (req, res, next) => {
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

export const AuthAccess = (moduleName, actionKey, options = {}) => {
  return async (req, res, next) => {
    try {
      const { id: logId, role: logRole } = req.user;

      const { model } = IdentifyModelByRole_H(logRole);

      const Models = { Admin, Staff, Vendor, User };

      const existing = await Models[model].findById(logId).populate('permission');

      // Super Admin Override
      if (logRole?.toLowerCase() === 'super_admin') return next();

      // Self-Access Rule (Reusable)
      if (req.params.id && ['user', 'vendor', 'staff'].includes(logRole) && logId.toString() !== req.params.id) {
        throw {
          status: 401,
          message: `Unauthorized: You don't have permission to access this module`,
          success: false,
        }
      }

      // If This User Type Doesn't Even Have Permissions → Auto deny
      if (!existing.permission) {
        return res.status(403).json({
          error: `Access denied: No permissions assigned for ID: ${logId}`,
          success: false
        });
      }

      // Permission Check
      const hasAccess =
        existing.permission?.modules.includes(moduleName) &&
        existing.permission?.actions?.[actionKey] === true;

      if (!hasAccess) {
        return res.status(403).json({
          error: `Access denied: You don't have permission to ${actionKey} on ${moduleName}`,
          success: false,
        });
      }

      next();
    } catch (error) {

      if (error.name === "StrictPopulateError") {
        return res.status(500).json({
          error: `Invalid populate path: '${error.path}'. Add this field to schema or remove populate().`,
          success: false
        });
      }

      if (error.status) {
        return res.status(error.status).json({ success: false, error: error.message });
      }

      return res.status(500).json({ success: false, error: `Authorization check failed ${error}` });
    }
  }
}