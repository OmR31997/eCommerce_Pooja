import mongoose from 'mongoose';
import { ENV } from '../../config/env.config.js';
import { Order } from '../order/order.model.js';
import { Vendor } from '../vendor/vendor.model.js';
import { User } from '../customer/user.model.js';
import { DeleteLocalFile_H, } from '../../utils/fileHelper.js';
import { ToDeleteFromCloudStorage_H } from '../../utils/cloudUpload.js';
import { Notify } from '../notification/notification.service.js';
import { BuildQuery_H, Pagination_H, ToDeleteFilesParallel_H, ToDeleteSelectedFiles_H, UploadFilesWithRollBack_H, UploadImageWithRollBack_H } from '../../utils/helper.js';

export const GetVendor = async (vendorId) => {
    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
        throw {
            status: 404,
            message: `Account not found for ID: ${vendorId}`
        }
    }

    return { status: 200, message: 'Vendor account fetched successfully.', data: vendor, success: false };
}

export const GetVendors = async (options) => {

    const { filter = {}, pagingReq = {}, baseUrl, select } = options;

    const matchedQuery = BuildQuery_H(filter, 'vendor');

    const total = await Vendor.countDocuments(matchedQuery);

    const pagination = Pagination_H(pagingReq.page, pagingReq.limit, undefined, total, baseUrl, matchedQuery);

    const sortField = ['name', 'createdAt'].includes(pagingReq.sortBy) ? pagingReq.sortBy : 'createdAt';
    const sortDirection = pagingReq.orderSequence === 'asc' ? 1 : -1;
    const sortOption = { [sortField]: sortDirection };

    const vendors = await Vendor.find(matchedQuery)
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
        data: vendors || []
    }
}

export const UpdateVendor = async (keyVal={}, reqData={}, filePayload={}) => {

    const { removeDocPaths, ...rest } = reqData;
    const { logoFile, documents } = filePayload;

    let uploaded = {
        logoUrl: null,
        documents: []
    }

    let updateOps = { $set: {}, $push: {}, $pull: {} };

    try {

        const vendor = await Vendor.findOne(keyVal).select("documents logoUrl").lean();

        if (!vendor) {
            throw {
                status: 404,
                message: `Vendor account not found for ID: ${keyVal?.id || keyVal?.businessEmail}`
            }
        }
        if (logoFile) {
            uploaded.logoUrl = await UploadImageWithRollBack_H(logoFile, "eCommerce/logoUrls");

            if (ENV.IS_PROD && vendor?.logoUrl?.public_id) {
                await ToDeleteFromCloudStorage_H(vendor.logoUrl.public_id)
            }

            if (!ENV.IS_PROD && vendor?.logoUrl?.secure_url) {
                await DeleteLocalFile_H(vendor.logoUrl.secure_url)
            }

            updateOps.$set.logoUrl = uploaded.logoUrl
        }

        if (documents?.length > 0) {
            // Only upload documents
            uploaded.documents = await UploadFilesWithRollBack_H(documents, "eCommerce/documents");

            updateOps.$push.documents = { $each: uploaded.documents }
        }

        for (const [key, val] of Object.entries(rest)) {
            if (val !== undefined) updateOps.$set[key] = val;
        }

        // Only remove documents
        if (removeDocPaths?.length > 0) {

            const finalDeletePath = await ToDeleteSelectedFiles_H(removeDocPaths, vendor.documents);

            if (finalDeletePath.length > 0) {
                updateOps.$pull.documents = { $or: finalDeletePath };
            }
        }

        // Remove empty operators   
        if (!updateOps.$push.documents || !updateOps.$push.documents.$each?.length) {
            delete updateOps.$push;
        }

        if (!updateOps.$pull.documents || !updateOps.$pull.documents.$or?.length) {
            delete updateOps.$pull;
        }


        if (Object.keys(updateOps.$set).length === 0) delete updateOps.$set;

        // Final Update
        const updated = await Vendor.findOneAndUpdate(keyVal, updateOps, { new: true, runValidators: true });

        return { status: 200, message: 'Vendor profile updated successfully', data: updated, success: true };

    } catch (error) {

        // ROLLBACK

        if (uploaded.documents?.length > 0) {
            // Rollback uploaded cloud files
            if (ENV.IS_PROD) {
                await Promise.all(uploaded.documents.map(uploadedFile => uploadedFile?.public_id ? ToDeleteFromCloudStorage_H(uploadedFile.public_id) : null));
            }

            // Rollback local files
            if (!ENV.IS_PROD) {
                await Promise.all(uploaded.documents.map(uploadedFile => DeleteLocalFile_H(uploadedFile.secure_url)));
            }
        }

        if (uploaded.logoUrl) {
            // Rollback uploaded cloud file
            if (ENV.IS_PROD && uploaded.logoUrl?.public_id) {
                await ToDeleteFromCloudStorage_H(uploaded.logoUrl.public_id);
            }

            // Rollback local file
            if (!ENV.IS_PROD && uploaded.logoUrl?.secure_url) {
                await DeleteLocalFile_H(uploaded.logoUrl.secure_url);
            }
        }

        throw {
            status: error.status || 500,
            message: error.message || "Internal Server Error"
        };
    }
}

export const RemoveVendor = async (keyVal) => {

    try {
        // Fetch vendor
        const vendor = await Vendor.findOne(keyVal).lean();
        if (!vendor) {
            throw {
                status: 404,
                message: `Vendor account not found for '${keyVal?._id || keyVal?.businessEmail}'`,
            }
        }

        // Remove vendor role from User
        if (vendor.userId && vendor.role) {
            await User.findByIdAndUpdate(vendor.userId, { $pull: { roles: vendor.role } });
        }

        // Delete Logo & Documents (if exists)
        const filesToDelete = [];
        if (vendor.logoUrl) filesToDelete.push(vendor.logoUrl);
        if (vendor.documents) filesToDelete.push(...vendor.documents);   //Spread all documents

        if (filesToDelete.length > 0) {
            await ToDeleteFilesParallel_H(filesToDelete);
        }

        // Delete vendor record
        const deleted = await Vendor.findOneAndDelete(keyVal);

        if (deleted) {
            await Notify.super({
                title: 'Vendor Delete',
                message: `Vendor who has ID: ${deleted._id} deleted by admin`,
                type: 'delete'
            });
        }

        return {
            status: 200,
            message: 'Vendor deleted successfully',
            data: deleted,
            success: true,
        };
    } catch (error) {
        throw {
            status: error.status || 500,
            message: error.message || "Internal Server Error"
        };
    }
}

export const RemoveAllVendors = async () => {
    try {
        const vendors = await Vendor.find().populate('role').lean();

        if (vendors.length === 0) {
            return {
                status: 400,
                error: 'No vendor found to delete',
                success: false,
            };
        }

        const filesToDelete = [];
        const roleRemovals = [];

        for (const vendor of vendors) {
            if (vendor.userId && vendor.role) {

                // Collect role for update to user
                roleRemovals.push({
                    updateOne: {
                        filter: { _id: vendor.userId },
                        update: { $pull: { roles: vendor.role } }
                    }
                });
            }

            // Collect logo & document files
            if (vendor.logoUrl) filesToDelete.push(vendor.logoUrl);
            if (vendor.documents) filesToDelete.push(...vendor.documents);
        }

        // Apply role removal updates in bulk if any
        if (roleRemovals.length > 0) {
            await User.bulkWrite(roleRemovals);
        }

        // Delete files (logo & document from cloud)
        if (filesToDelete.length > 0) {
            await ToDeleteFilesParallel_H(filesToDelete);
        }

        const deleted = await Vendor.deleteMany({});

        if (deleted.deletedCount > 0) {
            await Notify.super({
                title: "Vendor Cleared",
                message: `Deleted ${deleted.deletedCount} vendors`,
                type: "Delete"
            });
        }

        return {
            status: 200,
            message: `All vendors cleared successfully (${deleted.deletedCount} deleted)`,
            success: true,
        };
    } catch (error) {
        throw {
            status: error.status || 500,
            message: error.message || "Internal Server Error"
        };
    }
}

// ------------------------------------------------------------------------

export const GetVendorDetails = async (vendorId) => {
    const vendorObjectId = new mongoose.Types.ObjectId(vendorId);

    // Fetch Static Vendor Information
    const vendor = await Vendor.findById(vendorId).lean();
    if (!vendor) return { status: 400, error: 'Vendor not found' };

    // Aggregate Order Stats
    const orderStats = await Order.aggregate([
        { $match: { vendorId: vendorObjectId } },
        {
            $facet: {
                totalOrders: [
                    { $count: 'count' },
                ],
                deliveredOrders: [
                    { $match: { status: 'delivered' } },
                    { $count: 'count' },
                ],
                failedOrders: [
                    { $match: { status: { $in: ['cancelled'] } } }, { $count: 'count' }

                ],
                totalEarning: [
                    { $match: { status: 'delivered' } },
                    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
                ],
                avgDispatchTime: [
                    { $match: { status: 'delivered' } },
                    { $group: { _id: null, total: { $avg: '$dispatchTime' } } }
                ],
                monthlyRevenue: [
                    { $match: { status: 'delivered' } },
                    {
                        $group: {
                            _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                            revenue: { $sum: '$totalAmount' }
                        }
                    }
                ],
                recentOrders: [{ $sort: { createdAt: -1 } }, { $limit: 5 }],
            }
        }
    ]);

    const monthlyRevenue = (orderStats[0].monthlyRevenue || []).map(mth => ({
        month: mth._id?.month ?? null,
        year: mth._id?.year ?? null,
        revenue: mth.revenue ?? 0,
    }));

    //Aggregate Review Stats 
    const reviewStats = await Review.aggregate([
        { $match: { vendorId: vendorObjectId } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, totalReviews: { $count: {} } } },
    ])

    return {
        data: {
            ...vendor,
            totalOrders: orderStats[0].totalOrders[0]?.count || 0,
            deliveredOrders: orderStats[0].deliveredOrders[0]?.count || 0,
            failedOrders: orderStats[0].failedOrders[0]?.count || 0,
            recentOrders: orderStats[0].recentOrders || [],
            totalEarning: orderStats[0].totalEarning[0]?.total || 0,
            avgDispatchTime: orderStats[0].totalEarning[0]?.avgDispatchTime || 0,
            totalReviews: reviewStats[0]?.totalReviews || 0,
            monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue : 'No Revenue Yet'
        },
        success: true,
        status: 200,
    }
}
