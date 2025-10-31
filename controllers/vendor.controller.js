import { Vendor } from '../models/vendor.model.js';

export const create_vendor = async (req, res) => {
    try {
        const {
            businessEmail,
            bankDetails,
        } = req.body;
        const { userId } = req.user;

        const existVendor = await Vendor.findOne({$or: [ {businessEmail}, {"bankDetails.accountNumber": bankDetails.accountNumber}] })
        
        if(existVendor) {
            return res.status(409).json({
                error: `Vendor already registered with this 'businessEmail' or 'bankDetails.accountNumber'`,
                success: false
            });
        }

        const vendorData = {
            userId,
            ...req.body,
        }

        const response = await Vendor.create(vendorData);
        return res.status(201).json({
            message: 'Application submitted successfully',
            data: response
        })
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