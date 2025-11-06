import { Product } from '../models/product.model.js';
import { User } from '../models/user.model.js';
import { Vendor } from '../models/vendor.model.js';
import { Order } from '../models/order.model.js';
import { generateOtp, verifyOtp } from '../services/otp.service.js';
import { ToSaveCloudStorage } from '../services/cloudUpload.service.js';
import { DeleteLocalFile, ValidateFileSize, ValidateImageFileType, } from '../utils/fileHelper.js';

/* **vendor_signup logic here** */
export const vendor_signup = async (req, res) => {
    try {
        const { businessEmail, bankDetails } = req.body;

        const errors = [];

        if (!businessEmail) {
            errors.push(`'businessEmail' field must be required`);
        }

        if (!bankDetails) {
            errors.push(`'bankDetails' must be required`);
        }

        if (errors.length > 0) {
            return res.status(400).json({
                errors,
                message: 'Validation failed',
                success: false,
            })
        }

        const otpKey = businessEmail;
        const { otp, message, otpExpiresAt } = generateOtp(otpKey);

        console.log({
            otp,
            message,
            otpExpiresAt,
        })

        const query = [];

        if (businessEmail) {
            query.push({ businessEmail });
        }

        if (bankDetails?.accountNumber) {
            query.push({ "bankDetails.accountNumber": bankDetails.accountNumber });
        }

        const existVendor = query.length ? await Vendor.findOne({ $or: query }) : null;

        if (existVendor) {
            return res.status(409).json({
                error: `Vendor already registered with this 'businessEmail' or 'bankDetails.accountNumber'`,
                success: false
            });
        }

        return res.status(201).json({
            message: 'OTP has been sent successfully',
            warning: 'OTP expires in 5 minutes',
            data: { ...req.body },
            otpExpiresAt,
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = {};

            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message
            });

            return res.status(400).json({
                errors,
                message: 'Validation failed',
                success: false,
            })
        }

        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        })
    }
}

/* **confirm_otp logic here** */
export const confirm_otp = async (req, res) => {
    try {
        const { otp, shopName, businessEmail } = req.body;
        const { id } = req.user;

        const errors = [];

        if (!otp) {
            errors.push(`'otp' field must be required`);
        }

        if (!businessEmail) {
            errors.push(`'businessEmail' field must be required`);
        }

        if (errors.length > 0) {
            return res.status(400).json({
                errors,
                message: 'Validation failed',
                success: false,
            })
        }

        const verification = verifyOtp(businessEmail, otp);

        if (!verification.valid) {
            return res.status(400).json({
                error: verification.reason,
                success: false,
            });
        }

        const vendorData = {
            ...req.body,
            userId: id,
        };

        if (file) {

            if (!ValidateImageFileType(file.mimetype)) {
                DeleteLocalFile(file.path);
                return res.status(400).json({
                    error: 'Invalid file type. Only images allowed.',
                    success: false,
                });
            }

            if (!ValidateFileSize(file.size, 1)) {
                DeleteLocalFile(file.path);
                return res.status(400).json({
                    error: 'File size exceeds 2MB limit',
                    success: false,
                });
            }

            const secured_url = process.env.NODE_ENV !== 'development'
                ? await ToSaveCloudStorage(file.filePath, `eCommerce/${shopName.replaceAll(' ', '_')}/LogoUrls`, filename)
                : `/public/uploads/${file.filename}`;

            vendorData.logoUrl = secured_url;
        }

        const responseVendor = await Vendor.create(vendorData);

        const responseUser = await User.findByIdAndUpdate(id, { $set: { role: 'vendor' } }, { new: true });;

        return res.status(202).json({
            responseVendor,
            responseUser
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

/* **get_vendor_dashboard logic here** */
export const get_dashboard = async (req, res) => {
    try {
        const vendorId = req.user.id;

        const totalProducts = await Product.countDocuments({ vendorId });
        const totalOrders = await Order.countDocuments({ vendorId });

        const revenue = await Order.aggregate([
            { $match: { vendorId } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
        ]);

        return res.status(200).json({
            data: {
                totalProducts,
                totalOrders,
                totalRevenue: revenue[0]?.totalRevenue || 0,
            },
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

export const update_profile = (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

export const get_revenue_via_duration = (req, res) => {

}