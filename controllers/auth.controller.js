import { User } from '../models/user.model.js';

export const sign_up = async (req, res) => {
    try {
        const {email, phone} = req.body;

        const existUser = await User.findOne({$or: [{email}, {phone}]});

        if(existUser) {
            return res.status(400).json({
                error: 'Email Phone already registered',
                success: false
            })
        }
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = {};

            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message
            });

            return res.status(400).json({
                errors,
                message: 'Validation failed',
                success: false
            });
        }

        if(error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                error: `${field} already exists`,
                success: false,
            })
        }

        return res.status(500).json({
            error: error.message,
            success: false
        })
    }
}