import { Pagination_H } from '../../utils/helper.js';
import { Staff } from './staff.model.js';
import { ClearStaff, CreateStaff, DeleteStaff, GetStaffByID, GetStaffs, UpdateStaff } from './staff.service.js';

// READ------------------------------------|
export const get_me = async (req, res, next) => {

    try {
        const keyVal = {
            _id: req.user.id
        }

        const response = await GetStaffByID(keyVal);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const get_staff_by_id = async (req, res, next) => {

    try {
        const keyVal = {
            _id: req.params.id
        }

        const response = await GetStaffByID(keyVal);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const get_staffs = async (req, res, next) => {
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

        const response = await GetStaffs(options);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

// CREATE----------------------------------|
export const create_staff = async (req, res, next) => {
    try {
        const {
            name, staffEmail, staffphone, password,
            permissionName,
        } = req.body;

        if (!["admin", "super_admin"].includes(req.user.role)) {
            throw {
                status: 401,
                message: "Unauthorized: You don't have permission to create staff",
            }
        }

        const reqData = {
            name,
            staffEmail,
            staffphone,
            password, permissionName
        }

        const isValidToCreate = Object.values(reqData).some(val => val === undefined);

        if (isValidToCreate) {

            throw {
                status: 400,
                message: `${Object.keys(reqData).slice(0, -1).join(', ')}, and ` +
                    `${Object.keys(reqData).slice(-1)} fields must be provided to create staff!`
            }
        }

        const response = await CreateStaff(reqData);

        return res.status(201).json(response);

    } catch (error) {
        next(error);
    }
}

export const update_staff = async (req, res, next) => {
    try {

        const {
            name, staffEmail, staffPhone,
            permissionName,
        } = req.body;

        const keyVal = {
            _id: req.params.id
        }

        const reqData = {
            name,
            staffEmail, staffPhone,
            permissionName
        }

        const isValidToUpdate = Object.values(reqData).some(val => val !== undefined);

        if (!isValidToUpdate) {

            throw {
                status: 400,
                message: `Either ${Object.keys(reqData).slice(0, -1).join(', ')}, or ` +
                    `${Object.keys(reqData).slice(-1)} fields must be provided to update staff!`
            }
        }

        const response = await UpdateStaff(keyVal, reqData);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const remove_staff = async (req, res, next) => {
    try {

        if (!["admin", "super_admin"].includes(req.user.role)) {
            throw {
                status: 401,
                message: "Unauthorized: You don't have permission to create staff",
            }
        }

        const keyVal = {
            _id: req.params.id
        }

        const response = await DeleteStaff(keyVal);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const clear_staff = async (req, res, next) => {
    try {
        
        if (req.user.role !== "super_admin") {
            throw {
                status: 401,
                message: "Unauthorized: You don't have permission to create staff",
            }
        }

        const response = await ClearStaff();

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}