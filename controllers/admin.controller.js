import { Admin } from "../models/admin.model.js";
import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { Vendor } from "../models/vendor.model.js";

export const create_admin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const AdminRoleId = await Role.findOne({ name: 'admin' });
        const AdminPermissons = await Permission.findOne({ name: 'admin' });

        const hashedPassword_Admin = await bcrypt.hash(password, 10);

        await Admin.create({
            name: name || undefined,
            email: email || undefined,
            password: hashedPassword_Admin,
            role: AdminRoleId,
            permissions: AdminPermissons,
        })

        console.log('Admin created successfully!');

    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = {};

            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });

            return res.status(400).json({
                errors,
                message: 'Validation failed',
                success: false,
            });
        }

        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

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

/* **get_admin logic here** */
export const get_admin = async (req, res) => {
    try {

        let admin = undefined;

        if (req.user.role === 'admin')
            admin = await Admin.findById(req.user.id);
        else
            admin = await Admin.find();

        if (!admin || admin.length === 0) {
            return res.status(404).json({
                error: 'Admin not found',
                success: true,
            })
        }

        return res.status(404).json({
            data: admin,
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

/* **update_admin_profile logic here** */
export const update_admin_profile = async (req, res) => {
    try {
        const { name, email, adminId } = req.body;

        const adminData = {
            name: name || undefined,
            email: email || undefined,
        }

        let admin = undefined;
        if (req.user.role === 'admin')
            admin = await Admin.findByIdAndUpdate(req.user.id, adminData);
        else if (req.user === 'super_admin')
            admin = await Admin.findByIdAndUpdate(adminId, adminData);

        if (!admin || admin.length === 0) {
            return res.status(404).json({
                error: 'Admin not found',
                success: true,
            })
        }

        return res.status(404).json({
            message: 'Admin updated successfully',
            data: adminData,
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

/* **update_super_admin_profile logic here** */
export const update_super_admin_profile = async (req, res) => {
    try {
        const { name, email } = req.body;

        const adminData = {
            name: name || undefined,
            email: email || undefined,
        }

        const admin = await Admin.findByIdAndUpdate(req.user.id, adminData);

        if (!admin) {
            return res.status(404).json({
                error: 'Admin not found',
                success: true,
            })
        }

        return res.status(404).json({
            data: admin,
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

/* **delete_admin logic here** */
export const delete_admin = async (req, res) => {
    try {
        const admin_id = req.params.id;

        const deletedAdmin = await Admin.findByIdAndDelete(admin_id);

        if (!deletedAdmin) {
            return res.status(404).json({
                error: 'Admin not found',
                success: true,
            })
        }

        return res.status(200).json({
            message: 'Admin deleted success fully',
            success: true
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}


export const manage_permissions = async (req, res) => {
    try {
        const permissionId = req.params.id;
        const { moduleName, actions } = req.body;

        const permissionData = {
            moduleName: moduleName.charAt(0).toUpperCase()+moduleName.substring(1).toLowerCase() || undefined
        }
        // const response = await findByIdAndUpdate(permissionId, )

        return res.status(200).json({
            message: 'Permission managed successfully',
            data: permissionData,
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

export const manage_roles = async () => {

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