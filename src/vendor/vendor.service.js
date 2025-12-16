import mongoose from 'mongoose';
import { ENV } from '../../config/env.config.js';
import { Order } from '../order/order.model.js';
import { Vendor } from '../vendor/vendor.model.js';
import { User } from '../customer/user.model.js';
import { DeleteLocalFile_H, } from '../../utils/fileHelper.js';
import { ToDeleteFromCloudStorage_H } from '../../utils/cloudUpload.js';
import { Notify } from '../notification/notification.service.js';
import { BuildQuery_H, FindVendorFail_H, Pagination_H, success, ToDeleteFilesParallel_H, ToDeleteSelectedFiles_H, UploadFilesWithRollBack_H, UploadImageWithRollBack_H } from '../../utils/helper.js';

export const GetVendorById = async (keyVal) => {

    const vendor = await FindVendorFail_H(keyVal);

    return success({
        message: 'Vendor account fetched successfully.',
        data: vendor
    });
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

    return success({
        message: 'Data fetched successfully',
        data: vendors || [],
        pagination,
    });
}

export const UpdateVendor = async (keyVal, reqData, filePayload = {}) => {

    const { removeDocPaths, ...rest } = reqData;
    const { logoFile, documents } = filePayload;

    let uploaded = {
        logoUrl: null,
        documents: []
    }

    let updateOps = { $set: {}, $push: {}, $pull: {} };

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const vendor = await FindVendorFail_H(keyVal, "documents logoUrl");

        if (logoFile) {

            // Only upload logo
            uploaded.logoUrl = await UploadImageWithRollBack_H(logoFile, "eCommerce/logoUrls");

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
        const updated = await Vendor.findOneAndUpdate(
            keyVal,
            updateOps,
            { new: true, runValidators: true }
        );

        return { status: 200, message: 'Vendor profile updated successfully', data: updated, success: true };

    } catch (error) {

        if (session.inTransaction()) {
            await session.abortTransaction();
        }

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

        throw error;
    } finally {
        session.endSession();
    }
}

export const RemoveVendor = async (keyVal) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Step 1: Fetch vendor WITH session
        const vendor = await FindVendorFail_H(
            keyVal,
            "userId role logoUrl documents",
            session
        );

        // Step 2: Remove vendor role from User
        if (vendor.userId && vendor.role) {
            await User.findByIdAndUpdate(
                vendor.userId,
                { $pull: { roles: vendor.role } },
                { session });
        }

        // Step 3: Collect Logo & Documents paths (if exists)
        const filesToDelete = [];
        if (vendor.logoUrl) filesToDelete.push(vendor.logoUrl);

        if (Array.isArray(vendor.documents)) {
            filesToDelete.push(...vendor.documents);   //Spread all documents
        }


        // Step 4: Delete vendor record WITH session
        const deleted = await Vendor.findOneAndDelete(keyVal, { session });

        // Step 5: Commit transaction
        await session.commitTransaction()

        // Step 6: External side-effects AFTER commit
        if (filesToDelete.length > 0) {
            await ToDeleteFilesParallel_H(filesToDelete);
        }

        // Step 7: Notify to heads
        if (deleted) {
            await Notify.admin({
                title: 'Vendor Delete',
                message: `Vendor who has ID: ${deleted._id} deleted by admin`,
                type: 'delete'
            });
        }

        return success({
            message: 'Vendor deleted successfully',
            data: deleted
        });

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        throw error;
    } finally {
        session.endSession();
    }
}

export const RemoveAllVendors = async () => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        // Step 1: Fetch vendors WITH session
        const vendors = await Vendor.find()
            .select("_id userId role logoUrl documents")
            .session(session)
            .lean();

        if (vendors.length === 0) {
            throw {
                status: 404,
                message: "Vendor not found for deleted"
            }
        }

        const filesToDelete = [];
        const roleRemovals = [];

        // Step 2: Collect roleId & Logo & Documents paths from vendor (if exists)
        for (const vendor of vendors) {
            if (vendor.userId && vendor.role) {

                roleRemovals.push({
                    updateOne: {
                        filter: { _id: vendor.userId },
                        update: { $pull: { roles: vendor.role } }
                    }
                });
            }

            // Collect logo & document files
            if (vendor.logoUrl) filesToDelete.push(vendor.logoUrl);

            if (Array.isArray(vendor.documents)) {
                filesToDelete.push(...vendor.documents);
            }
        }

        // Step 2: Apply role removal updates in bulk if any
        if (roleRemovals.length > 0) {
            await User.bulkWrite(roleRemovals, { session });
        }

        // Step 4: Delete vendor record WITH session
        const deleted = await Vendor.deleteMany({}, { session });

        // Step 5: Commit transaction
        await session.commitTransaction();

        // Step 6: External side-effects AFTER commit (Delete files (logo & document from cloud))
        if (filesToDelete.length > 0) {
            await ToDeleteFilesParallel_H(filesToDelete);
        }

        // Step 7: Notify to heads
        if (deleted.deletedCount > 0) {
            await Notify.admin({
                title: "Vendor Cleared",
                message: `Deleted ${deleted.deletedCount} vendors`,
                type: "Delete"
            });
        }

        return success({
            message: `All vendor cleared successfully.`,
            data: { deletedCount: deleted.deletedCount }
        });

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        throw error;
    } finally {
        session.endSession();
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
