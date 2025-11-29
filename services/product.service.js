import { populate } from "dotenv";
import { ENV } from "../config/env.config.js";
import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import { ToUploadParallel } from "../utils/cloudUpload.js";
import { BuildProductQuery, ErrorHandle, GenerateSku, Pagination, ValidateImages } from "../utils/fileHelper.js";
import mongoose from "mongoose";

export const GetSecuredProductByIdOrSku = async (filter = {}, populate = {}) => {

    const query = {};

    if (filter.productId) query._id = filter.productId;
    if (filter.sku) query.sku = filter.sku;
    if (filter.vendorId) query.vendorId = filter.vendorId;

    // Build Populate Options
    let dbQuery = Product.findOne(query).populate({ path: 'vendorId', select: 'businessName status' });

    if (populate.category) {
        dbQuery = dbQuery.populate({ path: 'vendorId', select: 'businessName status' })
    }

    const existing = await dbQuery.lean();

    if (!existing) {
        const readableForm = Object.entries(filter).map(([key, val]) => `${key}: ${val}`).join(' :: ');

        throw {
            status: 404,
            message: `Product not found for filters: '${readableForm}'`,
            success: false
        }
    }

    return { status: 200, message: 'Data fetched successfully', data: existing, success: true };
}

export const GetSecuredAllProducts = async (baseUrl, pagingReq, populate = {}, options = {}) => {

    const { filter = {} } = options;

    const query = BuildProductQuery(filter);

    const total = await Product.countDocuments(query);
    
    // // Count total vendors
    if (total === 0)
        throw { status: 404, message: 'No product available', success: false };

    const { skip, nextUrl, prevUrl, totalPages, currentPage } = Pagination(
        pagingReq.page,
        pagingReq.limit,
        pagingReq.offset,
        total,
        baseUrl, filter);

    // // Sorting
    const sortField = ['name', 'price', 'sales', 'views', 'rating', 'createdAt'].includes(pagingReq.sortBy) ? pagingReq.sortBy : 'createdAt';
    const sortDirection = pagingReq.orderSequence === 'asc' ? 1 : -1;
    const sortOption = { [sortField]: sortDirection };

    // // Final
    let dbQuery = Product.find(query)
        .skip(skip)
        .limit(pagingReq.limit)
        .sort(sortOption);

    // // Condition based populate
    if (populate.vendor) dbQuery = dbQuery.populate(populate.vendor);
    if (populate.category) dbQuery = dbQuery.populate(populate.category);

    const existing = await dbQuery;

    return {
        status: 200,
        message: 'Data fetched successfully',
        pagination: {
            count: total,
            prevUrl,
            nextUrl,
            currentPage,
            totalPages
        },
        success: true,
        data: existing
    }
}

export const GetPublicProductById = async (productId, populate = {}, options = {}) => {

    const { filter = {} } = options;

    let query = Product.findById(productId);

    if (populate.vendor) {
        query = query.populate(populate.vendor);
    }

    if (populate.category) {
        query = query.populate(populate.category);
    }

    let existing = await query;

    if (!existing) {
        throw {
            status: 404,
            message: `Product not found for ID: '${productId}'`,
            success: false
        }
    }

    // Extract vendor & category status after populate
    if (existing.vendorId?._id) {
        existing.vendorStatus = existing.vendorId.status;
    }

    if (existing.categoryId?._id) {
        existing.categoryStatus = existing.categoryId.status;
    }

    for (let key in filter) {
        const value = filter[key];
        if (typeof value === 'object' && value !== null && '$gte' in value) {
            if (existing[key] < value.$gte) {
                throw {
                    status: 404,
                    message: `Product out of stock for ID: '${productId}'`,
                    success: false
                };
            }
            continue;
        }

        if (existing[key]?.toString() !== value?.toString()) {
            throw {
                status: 404,
                message: `Product does not match required filters for ID: '${productId}'`,
                success: false
            };
        }
    }

    return { status: 200, message: 'Data fetched successfully', data: existing, success: true };
}

export const GetPublicProducts = async (baseUrl, pagingReq, options = {}) => {
    const { filter = {} } = options;

    const matchedQuery = BuildProductQuery(filter);

    const categoryIds = matchedQuery.categoryId?.$in
        ? matchedQuery.categoryId.$in.map(id => new mongoose.Types.ObjectId(id))
        : [];

    // Remove categoryId from matchedQuery to prevent conflict
    delete matchedQuery.categoryId;

    const pipeline = [
        ...(categoryIds.length > 0
            ? [{ $match: { categoryId: { $in: categoryIds } } }]
            : []
        ),
        { $match: matchedQuery },

        // Join Vendor
        {
            $lookup: {
                from: 'vendors',
                localField: 'vendorId',
                foreignField: '_id',
                as: 'vendor'
            }
        },
        { $unwind: '$vendor' },

        // Join Category
        {
            $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category'
            }
        },
        { $unwind: '$category' },
        {
            $match: {
                'vendor.status': filter['vendorId.status'] || 'approved',
                'category.status': filter['categoryId.status'] || 'active',
                ...(filter['storeName']
                    ? { 'vendor.businessName': { $regex: filter['storeName'], $options: 'i' } }
                    : {})
            }
        },

        //Total Count (before pagination)
        {
            $facet: {
                metadata: [
                    { $count: 'total' }
                ],
                data: [
                    {
                        $sort: {
                            [pagingReq.sortBy || 'createdAt']: pagingReq.orderSequence === 'asc' ? 1 : -1
                        }
                    },
                    {
                        $skip: (pagingReq.page - 1) * pagingReq.limit
                    },
                    {
                        $limit: pagingReq.limit
                    },
                    // Projection
                    {
                        $project: {
                            vendorId: 0,
                            // categoryId: 0,
                            __v: 0,

                            // Vendor fields
                            'vendor._id': 0,
                            'vendor.userId': 0,
                            'vendor.createdAt': 0,
                            'vendor.updatedAt': 0,
                            'vendor.businessEmail': 0,
                            'vendor.password': 0,
                            'vendor.businessPhone': 0,
                            'vendor.bankDetails': 0,
                            'vendor.businessDescription': 0,
                            'vendor.permission': 0,
                            'vendor.role': 0,
                            'vendor.gstNumber': 0,
                            'vendor.documents': 0,
                            'vendor.commision': 0,
                            'vendor.__v': 0,
                            'vendor.logoUrl': 0,

                            // Category fields
                            'category.name': 0,
                            'category.imageUrl': 0,
                            'category.parent': 0,
                            'category.createdAt': 0,
                            'category.updatedAt': 0,
                        }
                    }
                ],
            }
        }
    ];

    let result = await Product.aggregate(pipeline);

    const total = result[0]?.metadata[0]?.total || 0;
    const products = result[0]?.data || [];
    const currentPage = pagingReq.page;
    const totalPages = Math.ceil(total / pagingReq.limit);

    if (total === 0) {
        throw { status: 404, message: "No products available", success: false };
    }

    const pagination = {
        count: total,
        prevUrl: currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}&limit=${pagingReq.limit}` : null,
        nextUrl: currentPage < totalPages ? `${baseUrl}?page=${currentPage + 1}&limit=${pagingReq.limit}` : null,
        currentPage,
        totalPages
    }
    return {
        status: 200,
        message: 'Data fetched successfully',
        pagination,
        success: true,
        data: products
    }
}

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

export const UpdateProduct = async (productData, others) => {
    try {
        const { key, files, user } = others;

        let product = undefined;

        if (key.startsWith('SKU')) {
            product = await Product.findOne({ sku: key })

            if (!product) {
                return { status: 404, error: `Data not found for sku: '${key}'` }
            }
        }
        else {
            product = await Product.findById(key)

            if (!product) {
                return { status: 404, error: `Data not found for productId: '${key}'` }
            }
        }

        if (user.role === 'vendor' && product.vendorId.toString() !== user.id) {
            return {
                status: 403,
                error: 'You are not authorized to modify this product.',
                success: false,
            };
        }

        if (files && files.length > 0) {
            const productImages = await UpdateImages(files, product.sku, product.images, product.vendorId);
            productData.images = productImages;
        }

        await Product.findByIdAndUpdate(product._id, productData);

        return { status: 200, message: `Product updated successfully`, data: productData, success: true };

    } catch (error) {
        const handle = await ErrorHandle(error, 'UpdateProduct');
        return handle;
    }
}

export const DeleteProduct = async (key) => {
    try {

        let product = undefined;
        if (key.startsWith('SKU')) {
            product = await Product.findOneAndDelete({ sku: key })

            if (!product) {
                return { status: 404, error: `Data not found for sku: '${key}'`, success: false }
            }
        }
        else {
            product = await Product.findByIdAndDelete(key)

            if (!product) {
                return { status: 404, error: `Data not found for productId: '${key}'`, success: false }
            }
        }

        return { status: 200, message: `Product deleted successfully`, data: product, success: true };

    } catch (error) {
        const handle = await ErrorHandle(error, 'DeleteProduct');
        return handle;
    }
}

export const ClearProducts = async (user) => {
    try {
        const { role, id } = user;

        let result = undefined;

        if (role === 'vendor') {
            result = await Product.deleteMany({ vendorId: id });
        }
        else if (role === 'super_admin') {
            result = await Product.deleteMany();
        }


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