import { User } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateOtp, otpStore, verifyOtp } from '../services/otp.service.js';
import { generateEncryptedToken, resetTokenStore } from '../services/token.service.js';

export const send_otp = async (req, res) => {
    try {
        const { phone, email } = req.body;

        if (!phone && !email) {
            return res.status(400).json({
                error: 'Please provide phone or email to send OTP',
                success: false,
            });
        }

        const key = email || phone;
        const { otp, message, otpExpiresAt } = generateOtp(key)

        console.log({
            otp,
            message,
            otpExpiresAt,
        })

        return res.status(200).json({
            message: 'OTP generated successfully',
            otpExpiresAt,
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

        let otpKey = null;
        if (otpStore.has(email))
            otpKey = email;
        else if (otpStore.has(phone))
            otpKey = phone;

        if (!otpKey) {
            return res.status(400).json({
                error: 'No OTP found for this email or phone. Please request OTP again.',
                success: false
            });
        }
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

        return res.status(201).json({
            data: {
                message: 'User created successfully with OTP verification',
                data: response._doc,
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

        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false
        })
    }
}

export const sign_in = async (req, res) => {
    const { email, phone, password } = req.body;

    const errors = [];

    if ((email && phone) || !(email || phone)) {
        errors.push(`Field either 'email' or 'phone' must be required`);
    }

    if (!password)
        errors.push(`'password' field must be required`);

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

        const isValidPassword = await bcrypt.compare(password, existUser.password);

        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Invalid Password',
                success: false,
            })
        }

        const otpKey = phone || email;
        const { otp, otpExpiresAt, message } = generateOtp(otpKey);

        console.log({
            otp,
            message,
            otpExpiresAt,
        });

        return res.status(200).json({
            message: 'OTP has been sent successfully',
            warning: 'OTP expired in 5 minutes',
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

export const confirm_signIn_otp = async (req, res) => {
    try {
        const { otp, phone, email } = req.body;

        const errors = [];
        if ((email && phone) || !(email || phone)) {
            errors.push(`Field either 'email' or 'phone' must be required`);
        }

        if (!otp)
            errors.push(`'otp' field must be required`);

        if (errors.length > 0) {
            return res.status(400).json({
                errors,
                message: 'Validatior failed',
                success: false,
            });
        }

        const existUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (!existUser) {
            return res.status(404).json({ error: 'User not found', success: false });
        }

        const otpKey = phone || email;
        const verification = verifyOtp(otpKey, otp);

        if (!verification.valid) {
            return res.status(400).json({
                error: verification.reason,
                success: false
            });
        }

        const accessToken = jwt.sign({
            userId: existUser._id,
            role: existUser.role,
        }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({
            message: 'OTP has been verified successfully',
            accessToken,
            success: false,
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

export const forgot_password = async (req, res) => {
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

        /* *Via OTP * */
        const key = email || phone;
        const { otp, message, otpExpiresAt } = generateOtp(key)

        console.log({
            otp,
            message,
            otpExpiresAt,
        })

        /* *Via Token Encryption-Decryption* */
        // const { resetToken, tokenExpiresAt, message } = generateEncryptedToken(existUser._id);

        // console.log({
        //     token: resetToken,
        //     message,
        //     tokenExpiresAt
        // });

        return res.status(200).json({
            message: 'OTP generated successfully',
            otpExpiresAt,
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
    const { otp, token, newPassword, phone, email } = req.body;

    const errors = [];

    /* *In Token Case* */
    // if (!token) {
    //     errors.push(`'token' field must be required`);
    // }

    /* *In OTP Case* */
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
        /* *OTP-Case* */
        const otpKey = phone || email;
        const verification = verifyOtp(otpKey, otp);

        if (!verification.valid) {
            return res.status(400).json({
                error: verification.reason,
                success: false,
            });
        }

        /* *Token-Case* */
        // const tokenData = resetTokenStore.get(token);

        // if (!tokenData) {
        //     return res.status(400).json({
        //         error: 'Invalid or expired token',
        //     });
        // }

        // if (tokenData.expiresAt < Date.now()) {
        //     resetTokenStore.delete(token);
        //     return res.status(400).json({
        //         error: 'Token expired',
        //     });
        // }

        // const existUser = await User.findById(tokenData.userId);

        // if (!existUser) {
        //     return res.status(400).json({
        //         error: `User not found`
        //     })
        // }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        /* *Token-Case* */
        // existUser.password = hashedPassword;
        // const response = await existUser.save();

        /* *OTP-Case* */
        const filter = email ? { email } : { phone };
        const response = await User.findOneAndUpdate(filter, { $set: { password: hashedPassword } }, { new: true });

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