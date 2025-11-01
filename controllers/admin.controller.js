import { User } from "../models/user.model.js";
import { Vendor } from "../models/vendor.model.js";

export const get_admin_dashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalVendors = await User.countDocuments({ role: 'vendor' });
        const pendingVendors = await User.countDocuments({ isApproved: false });
        const blockedUsers = await User.countDocuments({ status: 'blocked' });

        return res.status(200).json({
            data: { totalUsers, totalVendors, pendingVendors, blockedUsers },
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

export const vendor_approval = async (req, res) => {
    const { businessEmail } = req.body;

    if (!businessEmail) {
        return res.status(400).json({
            error: `'businessEmail' field must be required`,
            success: false,
        });
    }

    try {
        const responseVendor = await Vendor.findOneAndUpdate({businessEmail}, { $set: { isApproved: true } }, { new: true });

        if(!responseVendor) {
            return res.status(404).json({
                error: 'Vendor not found',
                success: false,
            });
        }

        return res.status(200).json({
            message: 'Vendor has been approved successfully',
            responseVendor,
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