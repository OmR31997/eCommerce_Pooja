import mongoose from "mongoose";
import { Product } from "./product.model.js";
import { buildProductPipeline_H, BuildQuery_H, FindCategoryFail_H, FindProductFail_H, GenerateSku_H, Pagination_H, success, ToDeleteFilesParallel_H, ToDeleteSelectedFiles_H, UploadImagesWithRollBack_H } from "../../utils/helper.js";
import { Notify } from "../notification/notification.service.js";

// CREATE-----------------------------------|
export const createProduct = async (reqData, filePayload = {}) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    let uploadedImages = []

    try {
        // Check Category (It will throw error when record founnd) 
        const category = await FindCategoryFail_H({ _id: reqData.categoryId });

        const imageFiles = filePayload.imageFiles;

        if (imageFiles?.length > 0) {
            uploadedImages = await UploadImagesWithRollBack_H(imageFiles, "eCommerce/Product/images");

            reqData.images = uploadedImages;
        }

        reqData.sku = GenerateSku_H(category.name, reqData.vendorId, reqData.name);

        const [created] = await Product.create([reqData], { session });

        await session.commitTransaction();

        return success({
            message: "Product created successfully",
            data: created
        });
    } catch (error) {

        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        if (uploadedImages?.length > 0) {
            await ToDeleteFilesParallel_H(uploadedImages);
        }

        throw error
    } finally {
        session.endSession();
    }
}

// UPDATE-----------------------------------|
export const updateProduct = async (keyVal = {}, reqData = {}, filePayload = {}) => {

    const { removeImagePaths, ...rest } = reqData;
    const { imageFiles } = filePayload;

    let uploadedImages = [];

    let updateOps = { $set: {}, $push: {}, $pull: {} };

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const product = await FindProductFail_H(keyVal);

        if (imageFiles.length > 0) {
            uploadedImages = await UploadImagesWithRollBack_H(imageFiles, "eCommerce/Product/images");

            updateOps.$push.images = { $each: uploadedImages }
        }

        for (const [key, val] of Object.entries(rest)) {
            if (val !== undefined) updateOps.$set[key] = val;
        }

        if (removeImagePaths && removeImagePaths.length > 0) {
            const finalDeletePath = await ToDeleteSelectedFiles_H(removeImagePaths, product.images);

            if (finalDeletePath.length > 0) {
                updateOps.$pull.images = { $or: finalDeletePath };
            }
        }

        if (!updateOps.$push.images || !updateOps.$push.images.$each?.length) {
            delete updateOps.$push;
        }

        if (!updateOps.$pull.images || !updateOps.$pull.images.$or?.length) {
            delete updateOps.$pull;
        }

        if (Object.keys(updateOps.$set).length === 0) delete updateOps.$set;

        // Final update
        const updated = await Product.findOneAndUpdate(keyVal, updateOps, { new: true, runValidators: true, session });

        await session.commitTransaction();

        return success({
            message: "Product updated successfully",
            data: updated
        });

    } catch (error) {

        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        if (uploadedImages.length > 0) {
            await ToDeleteFilesParallel_H(uploadedImages);
        }

        throw error;
    } finally {
        session.endSession();
    }
}

export const updateRating = async (keyVal, newRating) => {

    const product = await FindProductFail_H(keyVal, 'rating ratingCount');

    product.rating = ((product.rating * product.ratingCount) + newRating) / (product.ratingCount + 1);

    product.ratingCount += 1;

    const updated = await product.save();

    return success({
        message: `Rating submitted successfully`,
        data: {
            rating: updated.rating,
            ratingCount: updated.ratingCount
        }
    });
}

export const updateStock = async (keyVal = {}, stockChange) => {
    const product = await FindProductFail_H(keyVal, 'stock');

    const newStock = product.stock + stockChange;

    product.stock = newStock;

    const updated = await product.save();

    return success({
        message: "Stock updated successfully",
        data: updated.stock
    });
}

// READ-----------------------------------|
// PRIVATE
export const getSecuredProducts = async (keyVal = {}, options = {}) => {

    const { filter, baseUrl, pagingReq } = options;

    const pipeline = buildProductPipeline_H(keyVal, options, false, "private");

    const result = await Product.aggregate(pipeline);

    const total = result[0]?.metadata[0]?.total || 0;

    const products = result[0]?.data || [];

    const pagination = Pagination_H(pagingReq.page, pagingReq.limit, undefined, total, baseUrl, filter);

    delete pagination.skip;

    return success({
        message: "Data fetched successfully",
        pagination,
        data: products
    });
}

export const getSecuredProductByIdOrSku = async (keyVal = {}) => {

    const { vendorId, ...filter } = keyVal;

    const pipeline = buildProductPipeline_H(keyVal, { filter }, true, "private");

    const result = await Product.aggregate(pipeline);
    const product = result[0];

    if (!product) {
        throw {
            status: 404,
            message: `Product not found for ID: '${keyVal._id}'`
        }
    }

    return success({
        message: 'Data fetched successfully',
        data: product
    });
}

// PUBLIC
export const getPublicProducts = async (options = {}) => {

    const { filter = {}, baseUrl, pagingReq } = options;

    const pipeline = buildProductPipeline_H(undefined, options, false, "public");

    const result = await Product.aggregate(pipeline);

    const total = result[0]?.metadata[0]?.total || 0;

    const products = result[0]?.data || [];

    const pagination = Pagination_H(pagingReq.page, pagingReq.limit, undefined, total, baseUrl, filter);
    delete pagination.skip;

    return success({
        message: 'Data fetched successfully',
        pagination,
        data: products
    });
}

export const getPublicProductByIdOrSku = async (keyVal) => {

    const matchedQuery = BuildQuery_H(keyVal);

    const pipeline = buildProductPipeline_H(undefined, matchedQuery, true, "public");

    const result = await Product.aggregate(pipeline);
    const product = result[0];

    if (!product) {
        throw {
            status: 404,
            message: `Product not found for ID: '${keyVal._id || keyVal.sku}'`
        }
    }

    return success({
        message: 'Data fetched successfully',
        data: product
    });
}

export const productFilter = async (options = {}) => {

    const { filter = {}, pagingReq = {}, baseUrl } = options;

    const matchedQuery = BuildQuery_H(filter);

    const total = await Product.countDocuments(matchedQuery);

    const pagination = Pagination_H(
        pagingReq.page, pagingReq.limit, undefined, total, baseUrl, matchedQuery);

    // Sorting
    const sortField = ['name', 'price', 'createdAt'].includes(pagingReq.sortBy) ? pagingReq.sortBy : 'createdAt';
    const sortDirection = pagingReq.orderSequence === 'asc' ? 1 : -1;
    const sortOption = { [sortField]: sortDirection };

    const products = await Product.find(matchedQuery)
        .skip(pagination.skip)
        .limit(pagingReq.limit)
        .sort(sortOption)
        .populate({ path: 'vendorId', select: 'name businessName' })
        .populate({ path: 'categoryId', select: 'name slug' });

    delete pagingReq.skip;
    return success({
        message: 'Data fetched successfully',
        pagination,
        data: products
    });
}

// DELETE--------------------------------|
export const deleteProduct = async (keyVal = {}) => {

    const deleted = await Product.findOneAndDelete(keyVal);

    if (!deleted) {
        throw {
            status: 404,
            message: 'Product not found for delete'
        }
    }

    return success({
        message: `Product deleted successfully`,
        data: deleted
    });
}

export const clearProducts = async (keyVal) => {
    try {
        let result = await Product.deleteMany(keyVal);

        if (result.deletedCount === 0) {
            throw {
                status: 404,
                error: 'No product found to delete'
            }
        }

        return success({
            message: `All user cleared successfully.`,
            data: { deletedCount: result.deletedCount }
        });
    } catch (error) {
        throw error;
    }
}