import mongoose from 'mongoose';
import crypto from "crypto";
import { ENV } from '../../config/env.config.js';
import { Order } from '../order/order.model.js';
import { Vendor } from '../vendor/vendor.model.js';
import { User } from '../customer/user.model.js';
import { BuildVendorQuery, DeleteLocalFile, Pagination, ValidateDocs, ValidateLogo } from '../../utils/fileHelper.js';
import { ToDeleteFilesParallel, ToDeleteFromCloudStorage, ToSaveCloudStorage, ToUploadParallel } from '../../utils/cloudUpload.js';
import { Notify } from '../notification/notification.service.js';

export const GetVendor = async (userId) => {
    const vendor = await Vendor.findById(userId);

    if (!vendor) {
        throw {
            status: 404,
            message: `Account not found for ID: ${userId}`,
            success: false
        }
    }

    return { status: 200, message: 'Vendor account fetched successfully.', data: vendor, success: false };
}

export const GetAllVendors = async (baseUrl, pagingReq, filterReq) => {
    const total = await Vendor.countDocuments();

    // Count total vendors
    if (total === 0)
        throw { status: 400, message: 'No one vendor registered', success: false };

    const { skip, nextUrl, prevUrl, totalPages, currentPage } = Pagination(
        pagingReq.page,
        pagingReq.limit,
        pagingReq.offset,
        total,
        baseUrl, filterReq
    );

    // Sorting
    const sortField = ['businessName', 'businessDescription', 'createdAt'].includes(pagingReq.sortBy) ? pagingReq.sortBy : 'createdAt';
    const sortDirection = pagingReq.orderSequence === 'asc' ? 1 : -1;
    const sortOption = { [sortField]: sortDirection };

    // Build Mongo query
    const query = BuildVendorQuery(filterReq);

    const vendors = await Vendor.find(query).lean()
        .skip(skip)
        .limit(pagingReq.limit)
        .sort(sortOption);

    return {
        status: 200,
        message: 'Vendor fetched successfully',
        pagination: {
            count: total,
            prevUrl,
            nextUrl,
            currentPage,
            totalPages
        },
        success: true,
        data: vendors
    }
}

export const UpdateVendor = async (vendorData, filePayload, vendorId) => {
    const { logoUrl = null, documents = [], removeDocuments = [] } = filePayload;

    let updateOps = { $set: {}, $push: {}, $pull: {} };

    let uploadedDocs = [];
    let uploadedLogo = null;

    // Assign normal field for operation
    for (const [key, val] of Object.entries(vendorData)) {
        if (val !== undefined) updateOps.$set[key] = val;
    }

    // Validate logo & docs
    if (documents?.length > 0) ValidateDocs(documents);

    if (logoUrl) ValidateLogo(logoUrl);

    try {
        // Handle: removeDocument Case
        if (removeDocuments?.length > 0) {
            const vendor = await Vendor.findById(vendorId).select("documents");

            const docsToRemove = vendor.documents.filter(
                idx => removeDocuments.includes(idx.secure_url)
            );

            // Remove from cloud / local storage
            await ToDeleteFilesParallel(docsToRemove);

            // Remove from cloud/dev
            updateOps.$pull.documents = { secure_url: { $in: removeDocuments } }
        }

        if (documents?.length > 0) {

            uploadedDocs = await ToUploadParallel(
                documents,
                'eCommerce/Vendors/Documents',
                'DOC-'
            );

            updateOps.$push.documents = { $each: uploadedDocs }
        }

        // Add in not exist or Replace while exist logo
        if (logoUrl) {
            const vendor = await Vendor.findById(vendorId).select('logoUrl');

            if (vendor.logoUrl?.public_id && ENV.IS_PROD)
                await ToDeleteFromCloudStorage(vendor.logoUrl.public_id);
            else if (vendor.logoUrl?.secure_url)
                await DeleteLocalFile(vendor.logoUrl.secure_url);

            uploadedLogo = ENV.IS_PROD
                ? await ToSaveCloudStorage(
                    logoUrl,
                    'eCommerce/Vendors/LogoUrls',
                    `LOGO-${crypto.randomBytes(12).toString('hex')}`
                )
                : { secure_url: logoUrl.path, public_id: null }

            updateOps.$set.logoUrl = uploadedLogo;
        }

        // Remove empty operators   
        if (!updateOps.$push.documents) delete updateOps.$push;
        if (!updateOps.$pull.documents) delete updateOps.$pull;

        if (Object.keys(updateOps.$set).length === 0) delete updateOps.$set;

        // Finalae Update
        const result = await Vendor.findByIdAndUpdate(vendorId, updateOps, { new: true });

        if (!result) {
            throw {
                status: 404,
                message: `Vendor account not found for ID: ${vendorId}`,
                success: false
            }
        }

        return { status: 200, message: 'Vendor profile updated successfully', data: result };
    } catch (error) {

        // ROLLBACK

        if (uploadedDocs.length > 0) {
            await ToDeleteFilesParallel(uploadedDocs)
        }

        if (uploadedLogo?.public_id) {
            await ToDeleteFromCloudStorage(uploadedLogo.public_id);
        }
        else if (uploadedLogo?.secure_url && ENV.IS_DEV) {
            await DeleteLocalFile(uploadedLogo.secure_url);
        }

        throw error;
    }
}

export const RemoveVendor = async (vendorId) => {

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
        throw {
            status: 404,
            message: `Vendor account not found for '${vendorId}'`,
            success: false
        }
    }

    // Remove vendor role from User
    await User.findByIdAndUpdate(vendor.userId, { $pull: { roles: vendor.role } });

    // Delete Logo (if exists)
    if (vendor?.logoUrl?.public_id) {
        if (ENV.IS_PROD) {
            await ToDeleteFromCloudStorage(vendor.logoUrl.public_id);
        } else {
            // secure_url contains local file path
            await DeleteLocalFile(vendor.logoUrl.secure_url || vendor.logoUrl.public_id);
        }
    }

    if (vendor?.documents?.length > 0) {
        await ToDeleteFilesParallel(vendor.documents)
    }

    const deletedVendor = await Vendor.findByIdAndDelete(vendorId);

    await Notify.super({
        title: 'Vendor Delete',
        message: `Vendor who has ID: ${deletedVendor._id} deleted by admin`,
        type: 'delete'
    });

    return {
        status: 200,
        message: 'Vendor deleted successfully',
        data: deletedVendor,
        success: true,
    };
}

export const RemoveAllVendors = async () => {
    const vendors = await Vendor.find().populate('role').lean();

    if (vendors.length === 0) {
        return {
            status: 400,
            error: 'No vendor found to delete',
            success: false,
        };
    }

    await Promise.all(vendors.map(vendor =>
        User.findByIdAndUpdate(
            vendor.userId,
            { $pull: { roles: vendor.role?._id } },
            { new: true })));

    for (const vendor of vendors) {
        // Delete logo
        if (ENV.IS_PROD) {
            if (vendor?.logoUrl?.public_id) {
                await ToDeleteFromCloudStorage(vendor.logoUrl.public_id);
            }
        } else {
            if (vendor?.logoUrl?.secure_url) {
                await DeleteLocalFile(vendor.logoUrl.secure_url);
            }
        }


        if (vendor?.documents?.length > 0) {
            if (ENV.IS_PROD) {
                const publicIds = vendor.documents
                    .filter(doc => doc.public_id)
                    .map(doc => doc.public_id)

                if (publicIds.length > 0) {
                    await ToDeleteFilesParallel(publicIds);
                }
            }
            else {
                await Promise.all(vendor.documents
                    .filter(doc => doc.secure_url)
                    .map(doc => DeleteLocalFile(doc.secure_url))
                )
            }
        }
    }
    const result = await Vendor.deleteMany({});

    if (result.deletedCount === 0) {
        return {
            status: 404,
            error: 'No vendors found to delete',
            success: false,
        };
    }

    return {
        status: 200,
        message: `All vendors cleared successfully (${result.deletedCount} deleted)`,
        success: true,
    };
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
