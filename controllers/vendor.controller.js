import { User } from '../models/user.model.js';
import { Vendor } from '../models/vendor.model.js';
import { generateOtp, verifyOtp } from '../services/otp.service.js';

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

export const confirm_otp = async (req, res) => {
    try {
        const { otp, businessEmail } = req.body;
        const { userId } = req.user;

        const errors = [];

        if(!otp) {
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
            userId,
            ...req.body,
        }

        const responseVendor = await Vendor.create(vendorData);

        const responseUser = await User.findByIdAndUpdate(userId, { $set: { role: 'vendor' } }, { new: true });;

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