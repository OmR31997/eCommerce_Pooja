import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { Vendor } from "../models/vendor.model.js";

/* **get_admin_dashboard logic here** */
export const get_admin_dashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalVendors = await Vendor.countDocuments();
        const pendingVendors = await Vendor.countDocuments({ isApproved: false });
        const blockedUsers = await User.countDocuments({ status: 'blocked' });
        const inactiveCategory = await Category.countDocuments({ status: 'inactive' });

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
        const { status } = req.body;
        const vendorId = req.params.id;
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Access denied. Only admin can perform this action.',
                success: false,
            });
        }

        const vendor = await Vendor.findById(vendorId);

        if (!vendor) {
            return res.status(404).json({
                error: `Vendor not found for ID: ${vendorId}`,
                success: false,
            });
        }

        // Toggle Approval Status
        vendor.status = status;

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

/* **manage_product logic here** */
export const manage_product = async (req, res) => {
    try {
        const key = req.params.id;
        const { status } = req.body;


        const filter = key.startsWith('SKU-') ? { sku: key } : { _id: key };

        const product = await Product.findOne(filter);
        if (!product) {
            return res.status(404).json({
                error: 'Product not found',
                success: false,
            });
        }

        if (!status) {
            return res.status(400).json({
                error: `Please provide 'status' field (e.g., 'pending', 'approved', 'rejected', 'inactive')`,
                success: false,
            });
        }

        product.status = status;

        const updateRespnse = await product.save();

        return res.status(200).json({
            message: 'Product status updated successfully',
            data: updateRespnse,
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

/* **manage_staff logic here** */
export const manage_staff = async (req, res) => {
    try {
        const key = req.params.id;
        const { status } = req.body;


        const filter = key.startsWith('SKU-') ? { sku: key } : { _id: key };

        const product = await Product.findOne(filter);
        if (!product) {
            return res.status(404).json({
                error: 'Product not found',
                success: false,
            });
        }

        if (!status) {
            return res.status(400).json({
                error: `Please provide 'status' field (e.g., 'pending', 'approved', 'rejected', 'inactive')`,
                success: false,
            });
        }

        product.status = status;

        const updateRespnse = await product.save();

        return res.status(200).json({
            message: 'Product status updated successfully',
            data: updateRespnse,
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