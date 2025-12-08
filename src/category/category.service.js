import { ENV } from "../../config/env.config.js";
import { ToDeleteFromCloudStorage_H } from "../../utils/cloudUpload.js";
import { DeleteLocalFile_H } from "../../utils/fileHelper.js";
import { BuildQuery_H, GenerateSlug_H, Pagination_H, UploadImageWithRollBack_H } from "../../utils/helper.js";
import { Category } from "./category.model.js";
import { Notify } from "../notification/notification.service.js";

export const GetCategories = async (options = {}) => {
    const { filter = {}, pagingReq = {}, baseUrl, select } = options;

    const matchedQuery = BuildQuery_H(filter, 'category');

    const total = await Category.countDocuments(matchedQuery);

    const pagination = Pagination_H(pagingReq.page, pagingReq.limit, undefined, total, baseUrl, matchedQuery);

    const sortField = ['name', 'slug', 'createdAt'].includes(pagingReq.sortBy) ? pagingReq.sortBy : 'createdAt';
    const sortDirection = pagingReq.orderSequence === 'asc' ? 1 : -1;
    const sortOption = { [sortField]: sortDirection };

    const categories = await Category.find(matchedQuery)
        .skip(pagination.skip)
        .limit(pagingReq.limit)
        .sort(sortOption)
        .select(select)
        .lean();

    delete pagination.skip;
    return {
        status: 200,
        success: true,
        message: 'Data fetched successfully',
        count: total,
        pagination,
        data: categories || []
    }
}

export const GetCategoryById = async (keyVal = {}) => {

    const category = await Category.findOne(keyVal);

    if (!category) {
        throw {
            status: 404,
            message: `Category not found for ID: '${keyVal._id || keyVal.slug}'`
        }
    }

    return { status: 200, message: 'Data fetched successfully', data: category, success: true }
}

export const CreateCategory = async (reqData, filePayload) => {

    let uploadedImage = null;
    try {

        const { imageFile } = filePayload;

        uploadedImage = await UploadImageWithRollBack_H(imageFile, "eCommerce/categories")

        reqData.imageUrl = uploadedImage;

        reqData.slug = await GenerateSlug_H(reqData.name);

        const newCategory = await Category.create(reqData);

        return {
            status: 201,
            message: "Category created successfully",
            data: newCategory,
            success: true
        };

    } catch (error) {

        // Rollback of uploaded image (if DB failed)
        if (uploadedImage) {
            if (ENV.IS_PROD && uploadedImage.public_id) {
                await ToDeleteFromCloudStorage_H(uploadedImage.public_id);
            }

            if (!ENV.IS_PROD && uploadedImage.secure_url) {
                DeleteLocalFile_H(uploadedImage.secure_url)
            }
        }

        throw error;
    }
}

export const UpdateCategory = async (keyVal, reqData, filePayload) => {

    const category = await Category.findOne(keyVal);

    if (!category) {
        throw {
            status: 404,
            message: `Category not found for ID: '${keyVal?._id || keyVal?.slug}'`
        }
    };

    let uploadedImage = null;

    try {
        const { imageFile } = filePayload;

        if (imageFile) {
            uploadedImage = await UploadImageWithRollBack_H(imageFile, "eCommerce/categories");

            // Delete old image (if exists)
            if (ENV.IS_PROD && category.imageUrl?.public_id) {
                await ToDeleteFromCloudStorage_H(category.imageUrl.public_id);
            }

            if (!ENV.IS_PROD && category.imageUrl?.secure_url) {
                await DeleteLocalFile_H(category.imageUrl.secure_url);
            }

            reqData.imageUrl = uploadedImage;
        }

        if (reqData.name) reqData.slug = await GenerateSlug_H(reqData.name);

        const updated = await Category.findOneAndUpdate(keyVal, reqData, { new: true, runValidators: true });

        return { status: 200, message: 'Category update successfully', data: updated }

    } catch (error) {
        // Rollback of uploaded image (if DB failed)
        if (uploadedImage) {
            if (ENV.IS_PROD && uploadedImage.public_id) {
                await ToDeleteFromCloudStorage_H(uploadedImage.public_id);
            }

            if (!ENV.IS_PROD && uploadedImage.secure_url) {
                DeleteLocalFile_H(uploadedImage.secure_url)
            }
        }

        throw error;
    }
}

export const DeleteCategory = async (keyVal) => {
    const category = await Category.findOne(keyVal);

    if (!category) {
        throw {
            status: 404,
            message: `Category not found for ID: '${keyVal?._id || keyVal?.slug}'`
        }
    }

    if (ENV.IS_PROD && category.imageUrl?.public_id) {
        await ToDeleteFromCloudStorage_H(category.imageUrl.public_id);
    }

    if (!ENV.IS_PROD && category.imageUrl?.secure_url) {
        await DeleteLocalFile_H(category.imageUrl.secure_url);
    }

    const deleted = await Category.findOneAndDelete(keyVal);

    // Notify to super_admin
    await Notify.super({
        title: `Category Delete`,
        message: `Category (${deleted.name}) deleted by admin`,
        type: 'delete'
    });

    return { status: 200, message: 'Category deleted successfully', data: deleted, success: true }

}

export const ClearCategories = async () => {
    
    const categories = await Category.find();

    if (categories.length === 0) {
        return res.status(404).json({
            error: 'No categories found to delete',
            success: false,
        });
    }

    for (const category of categories) {
        if (ENV.IS_PROD && category.imageUrl?.public_id) {
            await ToDeleteFromCloudStorage_H(category.imageUrl.public_id);
        }

        if (!ENV.IS_PROD && category.imageUrl?.secure_url) {
            await DeleteLocalFile_H(category.imageUrl.secure_url);
        }
    }

    const result = await Category.deleteMany({});

    return {
        status: 200,
        message: `All categories cleared successfully (${result.deletedCount} deleted)`,
        success: true
    }
}