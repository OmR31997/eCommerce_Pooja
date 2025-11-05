import { Category } from "../models/category.model.js";
import { User } from "../models/user.model.js";
import { Vendor } from "../models/vendor.model.js";

/* **get_admin_dashboard logic here** */
export const get_admin_dashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalVendors = await User.countDocuments({ role: 'vendor' });
        const pendingVendors = await Vendor.countDocuments({ isApproved: false });
        const blockedUsers = await User.countDocuments({ status: 'blocked' });
        const inactiveCategory = await Category.countDocuments({ status: 'inactive'});

        return res.status(200).json({
            data: { totalUsers, totalVendors, pendingVendors, blockedUsers, inactiveCategory },
            success: true,
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

/* **manage_vendor logic here** */
export const manage_vendor = async (req, res) => {
    try {
        const vendorId = req.params.vendorId;

        if(req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Access denied. Only admin can perform this action.',
                success: false,
            });
        } 

        const vendor = await Vendor.findById(vendorId);

        if(!vendor) {
            return res.status(404).json({
                error: `Vendor not found for ID: ${vendorId}`,
                success: false,
            });
        }

        // Toggle Approval Status
        vendor.isApproved = !vendor.isApproved;

        const responseUpdate = await vendor.save();

        return res.status(200).json({
            message: `Vendor ${vendor.isApproved ? 'approved' : 'disapproved'} successfully`,
            data: responseUpdate,
            success: true,
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}