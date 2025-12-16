import { ErrorHandle_H } from "../../utils/helper.js";
import { ClearCategories, CreateCategory, DeleteCategory, GetCategories, GetCategoryById, UpdateCategory } from "./category.service.js";

// READ --------------------------------|
export const get_categories = async (req, res, next) => {
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
                search,
                status: ['admin', 'super_admin'].includes(req.user.role) ? undefined : 'active'
            },
        }

        const response = await GetCategories(options);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const get_category_by_id = async (req, res, next) => {
    try {

        const isAdmin = ['admin', 'super_admin'].includes(req.user.role);

        const keyVal = {
            _id: req.params.categoryId,
            ...(isAdmin ? {} : {status: 'active'})
        }

        const response = await GetCategoryById(keyVal);

        return res.status(200).json(response);
    } catch (error) {
        next(error)
    }
}

export const get_category_by_slug = async (req, res, next) => {
    try {

        const isAdmin = ['admin', 'super_admin'].includes(req.user.role);

        const keyVal = {
            slug: req.params.slug,
            ...(isAdmin ? {} : {status: 'active'})
        }

        const response = await GetCategoryById(keyVal);

        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

// CREATE-------------------------------|
export const create_category = async (req, res, next) => {
    try {
        const {
            name, description
        } = req.body;

        const reqData = {
            name, description
        }

        const filePayload = {
            imageFile: req.file
        };

        const response = await CreateCategory(reqData, filePayload)

        return res.status(201).json(response);

    } catch (error) {

        next(error);
    }
}

export const create_sub_category = async (req, res, next) => {
    try {
        const {
            name, description
        } = req.body;

        const reqData = {
            name,
            description,
            parent: req.params.parent
        }

        const filePayload = {
            imageFile: req.file
        };

        const response = await CreateCategory(reqData, filePayload)

        return res.status(201).json(response);

    } catch (error) {
        next(error);
    }
}

// UPDATE-------------------------------|
export const update_category = async (req, res, next) => {
    try {

        const { name, description } = req.body;

        const keyVal = { _id: req.params.categoryId }

        const filePayload = {
            imageFile: req.file
        }

        if (!name && !description) {
            throw {
                status: 400,
                message: `Atleast a field required either 'name' or 'description'`
            }
        }

        const reqData = {
            name, description
        }

        const response = await UpdateCategory(keyVal, reqData, filePayload);

        return res.status(200).json(response);

    } catch (error) {
        next(error)
    }
}

// DELETE-------------------------------|
export const delete_category = async (req, res, next) => {
    try {
        const keyVal = {
            _id: req.params.categoryId
        }
        
        const response = await DeleteCategory(keyVal);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const clear_categories = async (req, res, next) => {
    try {

        if(req.user.role !== 'super_admin') {
            throw {
                status: 405,
                message: "Method Not Allowed"
            }
        }

        const response = await ClearCategories();

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}