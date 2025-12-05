import { ErrorHandle_H } from "../../utils/helper.js";
import { ClearCategories, CreateCategory, DeleteCategory, GetCategories, GetCategoryById, UpdateCategory } from "./category.service.js";

// READ CONTROLLERS--------------------------------|
/*      *get_categories req/res handler*     */
export const get_categories = async (req, res) => {
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

            select: ['admin', 'super_admin'].includes(req.user.role)
                ? '_id name description +status'
                : '_id name description',
        }

        const { status: statusCode, success, message, count, pagination, data } = await GetCategories(options);

        return res.status(statusCode).json({
            success, message, count, pagination, data
        });

    } catch (error) {
        return res.status(error.status || 500).json({
            error: error.message || `Internal Server Error '${error}'`
        });
    }
}

/*      *get_category_by_id req/res handler*     */
export const get_category_by_id = async (req, res) => {
    try {
        const keyVal = {
            _id: req.params.categoryId,
        }

        select = ['admin', 'super_admin'].includes(req.user.role)
            ? '_id name slug description +status'
            : '_id name slug description';

        const { status, success, message, data } = await GetCategoryById(keyVal);

        return res.status(status).json({ message, data, success });
    } catch (error) {
        return res.status(error.status || 500).json({
            error: error.message || `Internal Server Error '${error}'`
        });
    }
}

/*      *get_category_by_slug req/res handler*     */
export const get_category_by_slug = async (req, res) => {
    try {
        const keyVal = {
            slug: req.params.slug,
        }

        select = ['admin', 'super_admin'].includes(req.user.role)
            ? '_id name slug description +status'
            : '_id name slug description';

        const { status, success, message, data } = await GetCategoryById(keyVal);

        return res.status(status).json({ message, data, success });
    } catch (error) {
        return res.status(error.status || 500).json({
            error: error.message || `Internal Server Error '${error}'`
        });
    }
}

// CREATE CONTROLLERS------------------------------|
/*      *create_category req/res handler*     */
export const create_category = async (req, res) => {
    try {
        const {
            name, description
        } = req.body;

        const reqData = {
            name, description, parent
        }

        const filePayload = {
            imageFile: req.file
        };

        const { status, success, message, data } = await CreateCategory(reqData, filePayload)

        return res.status(status).json({ success, message, data });

    } catch (error) {


        const handle = ErrorHandle_H(error);

        if (handle?.status)
            return res.status(handle.status).json({ error: handle.error, errors: handle.errors, success: false });

        return res.status(error.status || 500).json({ error: error.message })
    }
}

/*      *create_sub_category req/res handler*     */
export const create_sub_category = async (req, res) => {
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

        const { status, success, message, data } = await CreateCategory(reqData, filePayload)

        return res.status(status).json({ success, message, data });

    } catch (error) {
        const handle = ErrorHandle_H(error);

        if (handle?.status)
            return res.status(handle.status).json({ error: handle.error, errors: handle.errors, success: false });

        return res.status(error.status || 500).json({
            error: error.message || `Internal Server Error: '${error}'`,
            success: false
        });
    }
}

// UPDATE CONTROLLERS------------------------------|
/*      *update_category req/res handler*     */
export const update_category = async (req, res) => {
    try {

        const { name, description } = req.body;

        const keyVal = { _id: req.params.categoryId }

        const filePayload = {
            imageFile: req.file
        }

        if (!name || !description) {
            throw {
                status: 400,
                message: `Atleast a field required either 'name' or 'description'`
            }
        }
        reqData = {
            name, description
        }

        const { status, success, message, data } = await UpdateCategory(keyVal, reqData, filePayload);

        return res.status(status).json({ message, data, success });

    } catch (error) {
        const handle = ErrorHandle_H(error);

        if (handle?.status)
            return res.status(handle.status).json({ error: handle.error, errors: handle.errors, success: false });

        return res.status(error.status || 500).json({
            error: error.message || `Internal Server Error: '${error}'`,
            success: false
        });
    }
}

/*      *delete_category req/res handler*     */
export const delete_category = async (req, res) => {
    try {
        const keyVal = {
            _id: req.params.categoryId
        }

        const { status, message, data, success } = await DeleteCategory(keyVal);

        return res.status(status).json({ message, data, success });

    } catch (error) {
        return res.status(error.status).json({
            error: error.message || `Internal Server Error '${error}'`
        });
    }
}

/*      *clear_Category req/res handler*     */
export const clear_Category = async (req, res) => {
    try {
        const { status, message, success } = await ClearCategories();

        return res.status(status).json({ message, success });

    } catch (error) {
        return res.status(error.status || 500).json({
            error: error.message || `Internal Server Error '${error}'`
        });
    }
}