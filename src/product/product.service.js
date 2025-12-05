import mongoose from "mongoose";
import { BuildPopulateStages, BuildQuery, GenerateSku, Pagination, ValidateImages } from "../../utils/fileHelper.js";
import { Product } from "./product.model.js";
import { Category } from "../category/category.model.js";
import { ToUploadParallel } from "../../utils/cloudUpload.js";
import { FindProductFail_H } from "../../utils/helper.js";

// READ
export const GetSecuredProducts = async (keyVal = {}, options = {}) => {
    const { filter = {}, pagingReq = {}, populates = {}, baseUrl } = options;

    const matchedQuery = BuildQuery(filter, "product");
    const populateStages = BuildPopulateStages(populates);

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

        delete matchedQuery.$or;
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

    if (keyVal.Authority) {   //ADMIN | STAFF(PRODUCT MANAGER) VIEW
        pipeline.push({
            $project: {
                _id: 1,
                name: 1,
                features: 1,
                description: 1,
                sku: 1,
                images: 1,
                price: 1,
                discount: 1,
                stock: 1,
                status: 1,
                vendorId: 1,
                categoryId: 1,
                createdAt: 1,
                updatedAt: 1,

                category: {
                    name: "$category.name",
                    status: "$category.status"
                },
                vendor: {
                    name: "$vendor.businessName",
                    email: "$vendor.businessEmail",
                    status: "$vendor.status"
                }
            }
        })
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

    let pagination = Pagination(pagingReq.page, pagingReq.limit, undefined, total, baseUrl, filter);
    delete pagination.skip;

    return { status: 200, success: true, message: "Data fetched successfully", total, pagination, data: products }
}

export const GetSecuredProductByIdOrSku = async (keyVal = {}, populates = {}, select = undefined) => {

    let result = Product.findOne(keyVal);

    if (select) result = result = result.select(select)
    if (populates.vendor) result = result.populate(populates.vendor);
    if (populates.category) result = result.populate(populates.category);

    const product = await result.lean();

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

// CREATE
export const CreateProduct = async (productData, filePayload) => {

    // 1: Check Category
    const category = await Category.findById(productData.categoryId).lean().select('name');

    // 2: Not exit case 
    if (!category) {
        throw {
            status: 404,
            message: `Category not found for '${productData.categoryId}'`,
            success: false
        }
    }

    // Generate SKU
    productData.sku = GenerateSku(category.name, productData.vendorId, productData.name);

    // 3: Validate & Upload Images 
    if (filePayload?.images?.length > 0) {

        await ValidateImages(filePayload.images, 3);

        let uploadedImages = [];

        // Upload to cloud (already returns array of objects)
        uploadedImages = await ToUploadParallel(
            filePayload.images,
            'eCommerce/Product/Images',
            'PROD'
        );

        // IMPORTANT: images must be an array of {secure_url, public_id}
        productData.images = uploadedImages;
    }

    // Record created inside the db.controllers
    const data = await Product.create(productData);

    return { status: 201, message: 'Product created successfully', data, productData, success: true };
}

// UPDATE
export const UpdateProduct = async (keyVal = {}, productData = {}) => {

    const { images } = productData;

    if (!images)
        if (files && files.length > 0) {
            const productImages = await UpdateImages(files, product.sku, product.images, product.vendorId);
            productData.images = productImages;
        }
    // productData, { key, files: files || [], user: req.user }
    const product = await Product.findOneAndUpdate(keyVal, productData, { new: true });

    if (!product) {
        throw {
            status: 404,
            message: `Product not found for '${keyVal.productId}'`
        }
    }

    return { status: 200, message: 'Product deleted successfully', data: product, success: true };
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

// DELETE
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

// ------------PUBLIC

export const GetPublicProducts = async (options = {}) => {

    const { pagingReq = {}, baseUrl } = options;
    const total = await Product.countDocuments();

    const pagination = Pagination(pagingReq.page, pagingReq.limit, undefined, total, baseUrl, {});

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

    const matchedQuery = BuildQuery(filter);

    const total = await Product.countDocuments(matchedQuery);

    const pagination = Pagination(
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