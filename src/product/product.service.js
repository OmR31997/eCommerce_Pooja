import mongoose from "mongoose";
import { Product } from "./product.model.js";
import { Category } from "../category/category.model.js";
import { BuildPopulateStages_H, BuildQuery_H, FindCategoryFail_H, FindProductFail_H, GenerateSku_H, Pagination_H, ToDeleteFilesParallel_H, ToDeleteSelectedFiles_H, UploadImagesWithRollBack_H } from "../../utils/helper.js";
import { Notify } from "../notification/notification.service.js";

// CREATE PRODUCT SERVICES-----------------------------------|
export const CreateProduct = async (reqData, filePayload = {}) => {

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
        session.endSession();

        return {
            status: 200,
            message: "Product created successfully",
            data: created,
            success: true
        }
    } catch (error) {

        await session.abortTransaction();
        session.endSession();

        if (uploadedImages?.length > 0) {
            await ToDeleteFilesParallel_H(uploadedImages);
        }

        throw error
    }
}

// UPDATE PRODUCT SERVICES-----------------------------------|
export const UpdateProduct = async (keyVal = {}, reqData = {}, filePayload = {}) => {

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
        session.endSession()

        return {
            status: 200,
            message: "Product updated successfully",
            data: updated,
            success: true
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        if(uploadedImages.length > 0) {
            await ToDeleteFilesParallel_H(uploadedImages);
        }

        throw error;
    }
}

export const UpdateRating = async (keyVal, newRating) => {

    const product = await FindProductFail_H(keyVal, 'rating ratingCount');

    product.rating = ((product.rating * product.ratingCount) + newRating) / (product.ratingCount + 1);

    product.ratingCount += 1;

    const update = await product.save();

    return {
        status: 200,
        message: `Rating submitted successfully`,
        data: { rating: update.rating, ratingCount: update.ratingCount },
        success: true
    }
}

export const UpdateStock = async (keyVal = {}, stockChange) => {
    const product = await FindProductFail_H(keyVal, 'stock');

    const newStock = product.stock + stockChange;

    product.stock = newStock;

    const updated = await product.save();

    return { status: 200, message: "Stock updated successfully", data: updated.stock, success: true }
}

// READ PRODUCT SERVICES-----------------------------------|
// PRIVATE
export const GetSecuredProducts = async (keyVal = {}, options = {}) => {
    const { filter = {}, pagingReq = {}, populates = {}, baseUrl } = options;
    
    const matchedQuery = BuildQuery_H(filter, "product");
    
    const populateStages = BuildPopulateStages_H(populates);

    const pipeline = [
        { $match: matchedQuery },
        ...populateStages
    ];

    // ---- APPLY SEARCH BEFORE ANY GROUPING ----
    if (filter.search && matchedQuery.$or) {
        pipeline.push({
            $match: {
                $or: matchedQuery.$or,
            }
        });

        // delete matchedQuery.$or;
    }

    if (keyVal.userId) {    //CUSTOMER VIEW WHO HAS USER_ID
        delete matchedQuery.status;
        pipeline.push(
            {
                $match: {
                    status: "approved",
                    "category.status": "active",
                    "vendor.status": "approved"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    product: {
                        $first: {
                            _id: "$_id",
                            name: "$name",
                            features: "$features",
                            description: "$description",
                            price: "$price",
                            sku: "$sku",
                            images: "$images",
                            discount: "$discount",
                            stock: "$stock"
                        }
                    },
                    category: {
                        $first: "$category.name"
                    },
                    vendor: {
                        $first: {
                            name: "$vendor.businessName",
                            email: "$vendor.businessEmail"
                        }
                    }
                },
            })
    }

    if (keyVal.vendorId) {  //VENDOR VIEW
        pipeline.push({
            $match: {
                vendorId: new mongoose.Types.ObjectId(keyVal.vendorId),
                "category.status": "active"
            },
        }, {
            $group: {
                _id: "$_id",
                product: {
                    $first: {
                        _id: "$_id",
                        name: "$name",
                        features: "$features",
                        description: "$description",
                        price: "$price",
                        sku: "$sku",
                        images: "$images",
                        discount: "$discount",
                        stock: "$stock"
                    }
                },
                category: { $first: "$category.name" },
                vendor: {
                    $first: {
                        name: "$vendor.businessName",
                        email: "$vendor.businessEmail"
                    }
                }
            },
        });
    }

    if (keyVal.main) {   //ADMIN | STAFF(PRODUCT MANAGER) VIEW
        pipeline.push({
            $group: {
                _id: "$_id",
                product: {
                    $first: {
                        _id: "$_id",
                        name: "$name",
                        sku: "$sku",
                        features: "$features",
                        description: "$description",
                        price: "$price",
                        stock: "$stock",
                        status: "$status",
                        images: "$images",
                        discount: "$discount",

                    }
                },
                category: {
                    $first: {
                        _id: "$category._id",
                        name: "$category.name",
                        status: "$category.status"
                    }
                },
                vendor: {
                    $first: {
                        _id: "$vendor._id",
                        name: "$vendor.businessName",
                        email: "$vendor.businessEmail",
                        email: "$vendor.businessPhone",
                        status: "$vendor.status",
                        isVerified: "$vendor.isVerified",
                    }
                }
            },
        });

        // pipeline.push({
        //     $project: {
        //         _id: 1,
        //         name: 1,
        //         features: 1,
        //         description: 1,
        //         sku: 1,
        //         images: 1,
        //         price: 1,
        //         discount: 1,
        //         stock: 1,
        //         status: 1,
        //         vendorId: 1,
        //         categoryId: 1,
        //         createdAt: 1,
        //         updatedAt: 1,

        //         category: {
        //             name: "$category.name",
        //             status: "$category.status"
        //         },
        //         vendor: {
        //             name: "$vendor.businessName",
        //             email: "$vendor.businessEmail",
        //             status: "$vendor.status"
        //         }
        //     }
        // })
    }

    pipeline.push(

        {   // ---- Pagination Meta ----
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    {
                        $sort: {
                            [pagingReq.sortBy || "createdAt"]: pagingReq.orderSequence === "asc" ? 1 : -1
                        }
                    },
                    {
                        $skip: (pagingReq.page - 1) * pagingReq.limit
                    },
                    {
                        $limit: pagingReq.limit
                    },
                ],
            }
        }
    );

    const result = await Product.aggregate(pipeline);

    const total = result[0]?.metadata[0]?.total || 0;

    const products = result[0]?.data || [];

    const pagination = Pagination_H(pagingReq.page, pagingReq.limit, undefined, total, baseUrl, matchedQuery);
    delete pagination.skip;

    return {
        status: 200,
        success: true,
        message: "Data fetched successfully",
        count: total,
        pagination,
        data: products
    }
}

export const GetSecuredProductByIdOrSku = async (keyVal = {}) => {

    let query = Product.findOne(keyVal);

    if(keyVal.userId) {
        query = query
        .populate({path: "vendorId", select: "businessName businessEmail"})
        .populate({path: "categoryId", select: "name"})
    }

    if(keyVal.vendorId) {
        query = query
        .populate({path: "vendorId", select: "businessName businessEmail"})
        .populate({path: "categoryId", select: "name"})
    }

    if(keyVal.main) {
        delete keyVal.main
        query = Product.find(keyVal)
        .populate({path: "vendorId", select: "businessName businessEmail status"})
        .populate({path: "categoryId", select: "name status"})
    }

    const product = await query;

    if (!product) {

        const formatSet = Object.entries(keyVal).map(([key, val]) => `${key}: ${val}`).join(' :: ');

        throw {
            status: 404,
            message: `Product not found for filters: '${formatSet}'`,
            success: false
        }
    }

    // CASE
    if (keyVal.userId && product.stock <= 0) {
        throw {
            status: 404,
            message: `Product out of stock for ID: '${keyVal.productId}'`
        }
    }

    return { status: 200, message: 'Data fetched successfully', data: product, success: true };
}

// PUBLIC
export const GetPublicProducts = async (options = {}) => {

    const { pagingReq = {}, baseUrl } = options;
    const total = await Product.countDocuments();

    const pagination = Pagination_H(pagingReq.page, pagingReq.limit, undefined, total, baseUrl, {});

    const sortField = ['name', 'createdAt'].includes(pagingReq.sortBy) ? pagingReq.sortBy : 'createdAt';
    const sortDirection = pagingReq.orderSequence === 'asc' ? 1 : -1;
    const sortOption = { [sortField]: sortDirection };

    const products = await Product.find()
        .skip(pagination.skip)
        .limit(pagingReq.limit)
        .sort(sortOption)
        .populate({ path: 'vendorId', select: '-_id businessName' })
        .populate({ path: 'categoryId', select: '-_id name' })
        .lean();

    return {
        status: 200,
        message: 'Data fetched successfully',
        count: total,
        pagination,
        success: true,
        data: products
    }
}

export const GetPublicProductById = async (productId) => {

    const product = await Product.findOne({ _id: productId, status: 'approved' })
        .populate({ path: 'vendorId', select: '-_id businessName' })
        .populate({ path: 'categoryId', select: 'name' })
        .lean();

    if (!product) {
        throw {
            status: 404,
            message: `Product not found for ID: '${productId}'`,
            success: false
        }
    }

    return { status: 200, message: 'Data fetched successfully', data: product, success: true };
}

export const ProductFilter = async (options = {}) => {

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
    return { status: 200, message: 'Data fetched successfully', count: total, pagination, data: products };
}

// DELETE PRODUCT SERVICES-----------------------------------|
export const DeleteProduct = async (keyVal = {}) => {

    const deleted = await Product.findOneAndDelete(keyVal);

    if (!deleted) {
        throw {
            status: 404,
            message: 'Product not found for delete'
        }
    }

    return { status: 200, success: true, message: `Product deleted successfully`, data: deleted }
}

export const ClearProducts = async (vendorId) => {
    try {
        let result = await Product.deleteMany({ vendorId });

        if (result.deletedCount === 0) {
            return {
                status: 404,
                error: 'No product found to delete',
                success: false,
            }
        }

        return {
            status: 200,
            message: `All user cleared successfully (${result.deletedCount} deleted)`,
            success: true,
        };
    } catch (error) {
        const handle = await ErrorHandle(error, 'DeleteProduct');
        return handle;
    }
}