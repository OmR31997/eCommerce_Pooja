import { CreateAdmin, DeleteAdmin, UpdateAdmin, ManageProduct, ManageStaff, ManageUser, ManageVendor, ManageRefund, GetAdmins, GetAdminById } from "./admin.service.js";

// READ-----------------------------|
export const get_admins = async (req, res, next) => {
    try {

        if (req.user.role === "admin") {
            throw {
                status: 405,
                message: "Method Not Allowd"
            }
        }

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

        const response = await GetAdmins(options);

        return res.status(200).json(response);

    } catch (error) {
        next(error)
    }
}

export const get_admin_by_id = async (req, res, next) => {
    try {

        if (req.user.role !== "super_admin") {
            throw {
                status: 401,
                message: "Unauthorized: You don't have permission to access"
            }
        }

        const keyVal = { _id: req.params.id }

        const response = await GetAdminById(keyVal);

        return res.status(200).json(response);

    } catch (error) {
        next(error)
    }
}

// CREATE---------------------------|
export const create_admin = async (req, res, next) => {
    try {
        const { name, email, password, } = req.body;

        if (req.user.role !== 'super_admin') {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to create admin`
            }
        }

        const reqData = { name, email, password };

        const response = await CreateAdmin(reqData);

        return res.status(201).json(response);

    } catch (error) {
        next(error);
    }
}

export const get_me = async (req, res, next) => {
    try {
        const keyVal = { _id: req.user.id }

        const response = await GetAdminById(keyVal);

        if (!response || response?.length <= 0) {
            throw {
                status: 404,
                data: admin,
            }
        }

        return res.status(200).json(response);

    } catch (error) {
        next(error)
    }
}

// UPDATE---------------------------|
export const update_profile = async (req, res, next) => {

    try {
        const adminId = req.query.id;

        const { name, email } = req.body;

        if (adminId && req.user.role === "admin" && adminId !== req.user.id) {
            throw {
                status: 401,
                message: "Unauthorized: You don't have permission to update another admin"
            };
        }

        const keyVal = {
            _id: (req.user.role === "admin" || !adminId)
                ? req.user.id
                : adminId
        }

        if (!name && !email) {
            throw {
                status: 400,
                message: "At least one field must be required to update either 'name' or 'email'"
            };
        }

        const reqData = { name, email }

        const response = await UpdateAdmin(keyVal, reqData);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const manage_staff = async (req, res, next) => {

    try {
        const staffId = req.params.staffId;

        const reqData = { status: req.body.status };

        if (!reqData.status) {
            throw error({
                status: 400,
                message: `'status' field must be required!`
            })
        }

        const response = await ManageStaff(staffId, reqData);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const manage_vendor = async (req, res, next) => {

    try {

        const keyVal = {
            _id: req.params.vendorId
        }

        const reqData = { status: req.body.status };

        if (!reqData.status) {
            throw {
                status: 400,
                message: `'status' field must be required!`
            }
        }

        const response = await ManageVendor(keyVal, reqData);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const manage_user = async (req, res, next) => {

    try {
        const keyVal = { _id: req.params.userId };

        const reqData = { status: req.body.status };

        if (!reqData.status) {
            throw {
                status: 400,
                message: `'status' field must be required!`
            }
        }

        const response = await ManageUser(keyVal, reqData);

        return res.status(200).json(response);

    } catch (error) {

        next(error);
    }
}

export const manage_product = async (req, res, next) => {

    try {
        const keyVal = {
            _id: req.params.pId
        }

        const reqData = { status: req.body.status };

        if (!reqData.status) {
            throw {
                status: 400,
                message: `'status' field must be required!`
            }
        }

        const response = await ManageProduct(keyVal, reqData);

        return res.status(200).json(response);
    } catch (error) {
        next(error)
    }
}

export const manage_refund = async (req, res) => {
    const keyVal = { _id: req.params.returnId };

    const response = await ManageRefund(keyVal);

    return res.status(200).json(response);
};

// DELETE---------------------------|
export const delete_admin = async (req, res, next) => {
    try {
        const { role, id } = req.user;
        const keyVal = { _id: req.params.id };

        if (role === "super_admin" && keyVal._id === id) {
            throw {
                status: 400,
                message: "Super Admin cannot delete their own profile."
            }
        }

        if (role === 'admin' && id !== keyVal._id) {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to update another`,
            }
        }

        const response = await DeleteAdmin(keyVal);

        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}