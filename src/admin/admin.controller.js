import { CreateAdmin, DeleteAdmin, UpdateAdmin, ManageProduct, ManageStaff, ManageUser, ManageVendor, GetAdmin, MangeReturn } from "./admin.service.js";
import { Refund } from "../refund/refund.model.js";
import { Order } from "../order/order.model.js";
import { ErrorHandle_H } from "../../utils/helper.js";

// CREATE CONTROLLERS---------------------------|
export const create_admin = async (req, res, next) => {
    try {
        const { name, email, password, } = req.body;

        if (req.user.role !== 'super_admin') {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to create admin`
            }
        }

        const adminData = { name, email, password };

        const { status, message, data, success } = await CreateAdmin(adminData);

        return res.status(status).json({ message, data, success });

    } catch (error) {
        next(error);
    }
}

// CREATE CONTROLLERS---------------------------|
export const get_admin = async (req, res, next) => {
    try {
        const { status, success, data, message } = await GetAdmin(req.user);

        return res.status(status).json({ message, data, success });

    } catch (error) {
        next(error);
    }

}

// UPDATE CONTROLLERS---------------------------|
export const update_profile = async (req, res, next) => {

    try {
        const { role, id } = req.user;

        const {
            name, email,
            adminId = id
        } = req.body;

        if (role === 'admin' && id !== adminId) {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to update another admin`,
            }
        }

        if (!name || !email) {
            throw {
                status: 400,
                message: "At least one field must be required to update either 'name' or 'email'"
            }
        }

        const reqData = { name, email }

        const { status, success, data, message } = await UpdateAdmin(adminId, reqData);

        return res.status(status).json({ message, data, success });

    } catch (error) {
        next(error);
    }
}

// UPDATE CONTROLLERS---------------------------|
export const manage_staff = async (req, res, next) => {

    try {
        const staffId = req.params.staffId;

        const reqData = { status: req.body.status };

        if (!reqData.status) {
            throw {
                status: 400,
                message: `'status' field must be required!`
            }
        }

        const { status: statusCode, success, data, message } = await ManageStaff(staffId, reqData);

        return res.status(statusCode).json({ message, data, success });

    } catch (error) {
        next(error);
    }
}

export const manage_vendor = async (req, res, next) => {

    try {
        const vendorId = req.params.vendorId;
        const reqData = { status: req.body.status };

        if (!reqData.status) {
            throw {
                status: 400,
                message: `'status' field must be required!`
            }
        }

        const { status: statusCode, success, data, message } = await ManageVendor(vendorId, reqData);

        return res.status(statusCode).json({ message, data, success });

    } catch (error) {
        next(error);
    }
}

export const manage_user = async (req, res, next) => {

    try {
        const userId = req.params.id;

        const reqData = { status: req.body.status };

        if (!reqData.status) {
            throw {
                status: 400,
                message: `'status' field must be required!`
            }
        }

        const { status: statusCode, success, data, message } = await ManageUser(userId, reqData);

        return res.status(statusCode).json({ message, data, success });

    } catch (error) {

        next(error);
    }
}

export const manage_product = async (req, res, next) => {

    try {
        const productId = req.params.pId;

        const reqData = { status: req.body.status };

        if (!reqData.status) {
            throw {
                status: 400,
                message: `'status' field must be required!`
            }
        }

        const { status: statusCode, success, data, message } = await ManageProduct(productId, reqData);

        return res.status(statusCode).json({ message, data, success });
    } catch (error) {
        next(error)
    }
}

export const manage_return = async (req, res, next) => {
    try {
        const valid = [
            'approved',
            'rejected',
            'refund_received'
        ];

        if(!valid.includes(req.body.status)) {
            throw {
                status: 400,
                message: `'status' field must be required either "approved", "rejected", "received"`
            }
        }

        const keyVal = {
            _id: req.params.returnId,
            orderId: req.params.orderId
        }

        const reqData = { status: req.body.status };
        
        const { status: statusCode, success, message, data } = await MangeReturn(keyVal, reqData);

        return res.status(statusCode).json({
            message,
            data,
            success
        });
    } catch (error) {
        next(error);
    }
}

export const manage_refund = async (req, res) => {
    const { refundId } = req.params;

    const refund = await Refund.findById(refundId);
    if (!refund) return res.status(404).json({ msg: "Refund not found" });

    refund.status = "approved";
    await refund.save();

    const order = await Order.findById(refund.orderId);
    order.refundStatus = "approved";
    await order.save();

    res.json({ msg: "Refund approved" });
};


export const manage_permission = async (req, res) => {
    try {
        const permissionId = req.params.permissionId

        const { addModules, removeModules, actions } = req.body;

        if (!modules && !actions) {
            throw {
                status: 400,
                message: `Either 'modules' or 'action' field must be required!`
            }
        }

        const permissionData = {
            addModules: Array.isArray(addModules)
                ? addModules
                : (typeof addModules === 'object')
                    ? Object.values(addModules)
                    : (typeof addModules === 'string')
                        ? addModules.split(',').map(w => w.trim())
                        : [],
            removeModules: Array.isArray(removeModules)
                ? removeModules
                : (typeof removeModules === 'object')
                    ? Object.values(removeModules)
                    : (typeof removeModules === 'string')
                        ? removeModules.split(',').map(w => w.trim())
                        : [],
            actions: ''
        }

    } catch (error) {
        const handle = ErrorHandle_H(error);

        if (handle?.status)
            return res.status(handle.status).json({ success: false, error: handle.error, errors: handle.errors });

        return res.status(500).json({ success: false, error: error.message });
    }
}
// DELETE CONTROLLERS---------------------------|
export const delete_admin = async (req, res) => {

    try {
        const { role, id } = req.user;
        const adminId = req.params.id;

        if (role === 'admin' && id !== adminId) {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to update another`,
            }
        }

        const { status, success, data, message } = await DeleteAdmin(adminId);

        return res.status(status).json({ message, data, success });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}