import {
    CreateAdmin, DeleteAdmin, ReadAdmin, UpdateAdmin, MONGO_DB_BACKUP,
    ManageProduct, ManageStaff, ManageUser, ManageVendor
} from "../services/admin.service.js";

export const backup_database = async (req, res) => {
    const { status, error, success, message, backupPath, fileName, clearFile } = await MONGO_DB_BACKUP({
        role: req.user.role,
        isSuper: true,
        secureKey: req.headers['x-backup-key']
    });

    if (!success) {
        return res.status(status).json({ error, success });
    }

    res.download(backupPath, fileName, () => clearFile());
    // return res.status(status).json({ message, success });
}

/* **create_admin_dashboard logic here** */
export const create_admin = async (req, res) => {

    const { name, email, password, } = req.body;

    const adminData = {
        name: name || undefined,
        email: email || undefined,
        password: password || undefined,
    };

    const { status, error, errors, success, data, message } = await CreateAdmin(adminData);

    if (!success) {
        return res.status(status).json({ error, errors, message });
    }

    return res.status(status).json({ message, data, success });
}

/* **get_admin logic here** */
export const get_admin = async (req, res) => {

    const { status, error, errors, success, data, message } = await ReadAdmin(req.user);

    if (!success) {
        return res.status(status).json({ error, errors, message });
    }

    return res.status(status).json({ message, data, success });

}

/* **update_admin_profile logic here** */
export const update_profile = async (req, res) => {

    const { role, id } = req.user;
    const { name, email, adminId = req.user.id } = req.body;

    if (role === 'admin' && id !== adminId) {
        return res.status(403).json({
            error: 'You can update only own profile',
            success: false,
        });
    }

    const adminData = {
        name: name || undefined,
        email: email || undefined,
    }

    const { status, error, errors, success, data, message } = await UpdateAdmin(adminData, adminId);

    if (!success) {
        return res.status(status).json({ error, errors, message });
    }

    return res.status(status).json({ message, data, success });
}

/* **delete_admin logic here** */
export const delete_admin = async (req, res) => {

    const { role, id } = req.user;
    const adminId = req.params.id;

    if (role === 'admin' && id !== adminId) {
        return res.status(403).json({
            error: 'You can update only own profile',
            success: false,
        });
    }

    const { status, error, errors, success, data, message } = await DeleteAdmin(adminId);

    if (!success) {
        return res.status(status).json({ error, errors, message });
    }

    return res.status(status).json({ message, data, success });
}

/* **manage_staff logic here** */
export const manage_staff = async (req, res) => {

    const staffId = req.params.id;
    const { status, error, errors, success, data, message } = await ManageStaff(req.body.isActive, staffId);

    if (!success) {
        return res.status(status).json({ error, errors, message });
    }

    return res.status(status).json({ message, data, success });
}

/* **manage_vendor logic here** */
export const manage_vendor = async (req, res) => {

    const vendorId = req.params.id;
    const { status, error, errors, success, data, message } = await ManageVendor(req.body.status, vendorId);

    if (!success) {
        return res.status(status).json({ error, errors, message });
    }

    return res.status(status).json({ message, data, success });
}

/* **manage_user logic here** */
export const manage_user = async (req, res) => {

    const userId = req.params.id;
    const { status, error, errors, success, data, message } = await ManageUser(req.body.status, userId);

    if (!success) {
        return res.status(status).json({ error, errors, message });
    }

    return res.status(status).json({ message, data, success });
}

/* **manage_product logic here** */
export const manage_product = async (req, res) => {

    const key = req.params.id.startsWith('SKU-') ? { sku: key } : { _id: key };

    if (!status) {
        return res.status(400).json({
            error: `Please provide 'status' field with value from either 'pending', 'approved', 'rejected', or, 'inactive'`,
            success: false,
        });
    }

    const { status, error, errors, success, data, message } = await ManageProduct(status, key);

    if (!success) {
        return res.status(status).json({ error, errors, message });
    }

    return res.status(status).json({ message, data, success });
}