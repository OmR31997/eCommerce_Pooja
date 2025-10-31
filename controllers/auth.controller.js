import { User } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'

// **In-Memory Cache (for testing in small project)
const otpStore = new Map();

const resetTokenStore = new Map();

export const set_otp = (key, otp, ttlMs) => {
    otpStore.set(key, {
        otp,
        expiresAt: Date.now() + ttlMs
    });

    setTimeout(() => otpStore.delete(key), ttlMs);
}

export const verifyOtp = (key, otp) => {
    const entry = otpStore.get(key);
    if (!entry) {
        return {
            valid: false,
            reason: 'OTP expired or not found',
        }
    }

    if (Date.now() > entry.expiresAt) {
        otpStore.delete(key);
        return {
            reason: 'OTP expired',
            valid: false,
        }
    }

    if (entry.otp !== otp) {
        return {
            reason: 'Invalid OTP',
            valid: false,
        }
    }

    otpStore.delete(key);

    return { valid: true };
};
/* **End In-Memory** */

export const send_otp = async (req, res) => {
    try {
        const { phone, email } = req.body;

        if (!phone && !email) {
            return res.status(400).json({
                error: 'Please provide phone or email to send OTP',
                success: false,
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const ttlMs = 5 * 60 * 1000;
        const otpExpiresAt = new Date(Date.now() + ttlMs);
        const key = phone || email

        set_otp(key, otp, ttlMs);

        console.log({
            otp,
            otpExpiresAt,
        });

        return res.status(200).json({
            message: 'OTP generated successfully',
            expiresIn: '5 minutes'
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false
        })
    }
}

export const sign_up = async (req, res) => {
    try {
        const { email, phone, otp, password } = req.body;

        if (!otp) {
            return res.status(400).json({
                error: `'otp' field must be required`,
                message: 'Validation failed',
                success: false
            });
        }

        const existUser = await User.findOne({ $or: [{ email }, { phone }] });

        if (existUser) {
            return res.status(409).json({
                error: 'Email/Phone already registered',
                success: false
            });
        }

        const otpKey = phone || email;
        const verification = verifyOtp(otpKey, otp);

        if (!verification.valid) {
            return res.status(400).json({
                error: verification.reason,
                success: false
            });
        }

        const userData = {
            ...req.body,
            password: await bcrypt.hash(password, 10),
            isVerified: true,
        };

        const response = await User.create(userData);

        return res.status(200).json({
            data: {
                message: 'User created successfully with OTP verification',
                ...response,
                success: true
            },
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
                success: false
            });
        }

        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                error: `${field} already exists`,
                success: false,
            })
        }

        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false
        })
    }
}

export const sign_in = async (req, res) => {
    const { email, phone, password, otp } = req.body;
    const errors = [];

    if ((email && phone) || !(email || phone)) {
        errors.push(`Field either 'email' or 'phone' must be required`);
    }

    if (!password)
        errors.push(`'password' field must be required`);

    if (!otp)
        errors.push(`'otp' field must be required`);

    if (errors.length > 0) {
        return res.status(400).json({
            errors,
            message: 'Validatior failed',
            success: false,
        })
    }

    try {
        const existUser = await User.findOne({ $or: [{ email }, { phone }] });

        if (!existUser) {
            return res.status(404).json({
                error: 'Invalid Email/Phone',
                success: false
            });
        }

        if (existUser.status === 'blocked') {
            return res.status(403).json({
                error: 'Account has been blocked. Please contact support team',
                success: false
            })
        }
        const otpKey = phone || email;
        const verification = verifyOtp(otpKey, otp);

        if (!verification.valid) {
            return res.status(400).json({
                error: verification.reason,
                success: false,
            });
        }

        const isValidPassword = await bcrypt.compare(password, existUser.password);

        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Invalid Password',
                success: false,
            })
        }

        const accessToken = await jwt.sign({
            userId: existUser._id,
            role: existUser.role,
        }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({
            accessToken,
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false
        });
    }
}

export const forgor_password = async (req, res) => {
    try {
        const { email, phone } = req.body;

        if ((email && phone) || !(email || phone)) {
            return res.status(400).json({ error: `Field either 'email' or 'phone' must be required` });
        }

        const existUser = await User.findOne({ $or: [{ email }, { phone }] });

        if (!existUser) {
            return res.status(404).json({
                error: 'Entered Email/Phone Based User Not Exist',
                success: false
            });
        }

        if (existUser.status === 'blocked') {
            return res.status(403).json({
                error: 'Account has been blocked. Please contact first to the support team',
                success: false
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const key = email || phone;
        set_otp(key, otp, 5 * 60 * 1000);

        console.log({
            otp,
            message: 'Otp Expires in 5 minutes'
        });

        return res.status(200).json({
            message: 'OTP generated successfully',
            expiresIn: '5 minutes'
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false
        });
    }
}

export const reset_password = async (req, res) => {
    const { otp, newPassword, phone, email } = req.body;

    const errors = [];

    if ((email && phone) || !(email || phone)) {
        errors.push(`Field either 'email' or 'phone' must be required`);
    }

    if (!otp)
        errors.push(`'otp' field must be required`);

    if (!newPassword)
        errors.push(`'newPassword' field must be required`);

    if (errors.length > 0) {
        return res.status(400).json({
            errors,
            message: 'Validatior failed',
            success: false,
        })
    }

    try {
        const otpKey = phone || email;
        const verification = verifyOtp(otpKey, otp);

        if (!verification.valid) {
            return res.status(400).json({
                error: verification.reason,
                success: false,
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const filter = email ? { email } : { phone };
        const response = await User.findOneAndUpdate(filter, {$set: {password: hashedPassword, resetRequestedAt: new Date()}}, {new: true});

        return res.json({
            message: 'Password Updated successfully',
            data: response,
            success: true,
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false
        });
    }
}