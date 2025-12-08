import { CreateAdmin, DeleteAdmin, UpdateAdmin, ManageProduct, ManageStaff, ManageUser, ManageVendor, GetAdmin } from "./admin.service.js";
import { Refund } from "../../common_models/refund.model.js"
import { Order } from "../order/order.model.js";
import { ErrorHandle_H } from "../../utils/helper.js";

/*      * create_admin handler *      */
export const create_admin = async (req, res) => {
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
        const handle = ErrorHandle_H(error);

        if (handle?.status)
            return res.status(handle.status).json({ success: false, error: handle.error, errors: handle.errors });

        return res.status(500).json({ success: false, error: error.message });
    }
}

/*      * get_admin handler *      */
export const get_admin = async (req, res) => {
    try {
        const { status, success, data, message } = await GetAdmin(req.user);

        return res.status(status).json({ message, data, success });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }

}

/*      * get_admin handler *      */
export const update_profile = async (req, res) => {

    try {
        const { role, id } = req.user;

        const {
            name, email,
            adminId = req.user.id
        } = req.body;

        if (role === 'admin' && id !== adminId) {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to update another`,
            }
        }

        const adminData = { name, email }

        const { status, success, data, message } = await UpdateAdmin(adminData, adminId);

        return res.status(status).json({ message, data, success });

    } catch (error) {
        const handle = ErrorHandle_H(error);

        if (handle?.status)
            return res.status(handle.status).json({ success: false, error: handle.error, errors: handle.errors });

        return res.status(500).json({ success: false, error: error.message });
    }
}

/*      * delete_admin handler *      */
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

/*      * manage_staff handler *      */
export const manage_staff = async (req, res) => {

    try {
        const staffId = req.params.id;

        const status = req.body.status;

        if (!status) {
            throw {
                status: 400,
                message: `'status' field must be required!`
            }
        }

        const { status: statusCode, success, data, message } = await ManageStaff(status, staffId);

        return res.status(statusCode).json({ message, data, success });

    } catch (error) {
        const handle = ErrorHandle_H(error);

        if (handle?.status)
            return res.status(handle.status).json({ success: false, error: handle.error, errors: handle.errors });

        return res.status(500).json({ success: false, error: error.message });
    }
}

/*      * manage_vendor handler *      */
export const manage_vendor = async (req, res) => {

    try {
        const vendorId = req.params.id;

        const status = req.body.status;

        if (!status) {
            throw {
                status: 400,
                message: `'status' field must be required!`
            }
        }

        const { status: statusCode, success, data, message } = await ManageVendor(vendorId, status);

        return res.status(statusCode).json({ message, data, success });

    } catch (error) {
        const handle = ErrorHandle_H(error);

        if (handle?.status)
            return res.status(handle.status).json({ success: false, error: handle.error, errors: handle.errors });

        return res.status(500).json({ success: false, error: error.message });
    }
}

/*      * manage_user handler *      */
export const manage_user = async (req, res) => {

    try {
        const userId = req.params.id;

        const status = req.body.status;

        if (!status) {
            throw {
                status: 400,
                message: `'status' field must be required!`
            }
        }

        const { status: statusCode, success, data, message } = await ManageUser(status, userId);

        return res.status(statusCode).json({ message, data, success });

    } catch (error) {

        const handle = ErrorHandle_H(error);

        if (handle?.status)
            return res.status(handle.status).json({ success: false, error: handle.error, errors: handle.errors });

        return res.status(500).json({ success: false, error: error.message });
    }
}

/*      * manage_product handler *      */
export const manage_product = async (req, res) => {

    try {
        const productId = req.params.pId;

        const status = req.body.status;

        if (!status) {
            throw {
                status: 400,
                message: `'status' field must be required!`
            }
        }

        const { status: statusCode, success, data, message } = await ManageProduct(productId, status);

        return res.status(statusCode).json({ message, data, success });
    } catch (error) {
        const handle = ErrorHandle_H(error);

        if (handle?.status)
            return res.status(handle.status).json({ success: false, error: handle.error, errors: handle.errors });

        return res.status(500).json({ success: false, error: error.message });
    }
}

/*      * manage_user handler *      */
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

export const ApproveRefund = async (req, res) => {
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
