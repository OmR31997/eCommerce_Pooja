import { ErrorHandle_H } from '../../utils/helper.js';
import { ChangePassword, ConfirmOtp, ForgotPassword, GoogleCallback, Refresh_Token, ResetPassword, SendOtp, SignIn, SignOut, SignOutAll, SignUp, SignWithGoogle, VendorRegistration } from './auth.service.js';

// READ CONTROLLERS--------------------------------|
export const test_protected = async (req, res) => {
    try {
        return res.status(200).json({
            message: 'You have access',
            user: req.user
        });
    } catch (error) {

        return res.status(error.status || 500).json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
}

export const refresh_token = async (req, res) => {
    try {
        const REFRESH_TOKEN_COOKIE_NAME = process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken";

        const cookieName = REFRESH_TOKEN_COOKIE_NAME;
        const token = req.cookies?.[cookieName] || req.body?.refreshToken;

        if (!token) return res.status(400).json({ error: 'No refresh token.', success: false });

        const tokenData = {
            token,
            ip: req.ip,
            res,
        }

        const { status, success, accessToken, refreshToken } = await Refresh_Token(tokenData);

        return res.status(status).json({ accessToken, refreshToken, success });

    } catch (error) {

        try {
            ErrorHandle_H(error);
        } catch (handled) {
            return res.status(handled.status || 500).json({
                success: false,
                message: handled.message,
                errors: handled.errors || null
            });
        }
    }
}

export const sign_in = async (req, res, next) => {
    try {
        const { 
            email, phone,
            businessEmail, businessPhone,
            staffEmail, staffPhone,
            password } = req.body;

        const identifiers = [email, staffEmail, staffPhone, businessEmail, businessPhone, phone].filter(Boolean);
 
        if (identifiers.length !== 1) {
            throw {
                status: 400,
                message: `Provide exactly ONE login field: email, phone, staffEmail, staffPhone, businessEmail, or businessPhone.`
            };
        }

        const errors = [];
        if (!password)
            errors.push(`'password' field must be required`);

        if (errors.length > 0) {
            throw {
                status: 400,
                message: `Validatior failed`,
                errors
            }
        }

        const logKey = {};

        if (email) logKey.email = email;
        if (phone) logKey.phone = phone;
        if (businessEmail) logKey.businessEmail = businessEmail;
        if (businessPhone) logKey.businessPhone = businessPhone;
        if (staffEmail) logKey.staffEmail = staffEmail;
        if (staffPhone) logKey.staffPhone = staffPhone;


        const { status, success, message, tokens } = await SignIn(res, logKey, password, req.ip);

        return res.status(status).json({ message, tokens, success });

    } catch (error) {
        console.log(error)
        next(error)
    }
}

export const confirm_signIn_otp = async (req, res) => {
    try {
        const { email, phone, otp } = req.body;

        const errors = [];

        if ((email && phone) || !(email || phone)) {
            errors.push(`Field either 'email' or 'phone' must be required`);
        }

        if (!otp) errors.push(`'otp' field must be required`);

        if (errors.length > 0) {
            throw {
                status: 400,
                errors,
                message: 'Validation failed',
            }
        }

        const { status, success, error, tokens, message } = await ConfirmOtp(res, { email, otp }, req.ip);

        if (!success) return res.status(status).json({ error, success });

        return res.status(status).json({ message, tokens, success });
    } catch (error) {
        return res.status(error.status || 500).json({
            errors: error.errors,
            error: error.message || `Internal Server Error: ${error}`,
            success: false
        })
    }
}

export const sign_out = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({
                error: 'No refresh token',
                success: false,
            });
        }

        const { status, success, message } = await SignOut(refreshToken);

        res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'Strict' });

        return res.status(status).json({
            message,
            success,
        })
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error: error.message || `Internal Server Error: '${error}'`,
        });
    }
}

export const sign_out_all_devices = async (req, res) => {

    try {
        const { status, success, message } = await SignOutAll(req.ip, req.user);

        return res.status(status).json({
            message,
            success
        })

    } catch (error) {
        return res.status(error.status).json({
            success: false,
            error: error.message || `Internal Server Error: '${error}'`
        });
    }
}

// CREATE CONTROLLERS--------------------------------|
export const send_otp = async (req, res) => {
    try {
        const { email, phone } = req.body;

        if (!email && !phone) {
            throw {
                status: 400,
                message: `Please provide either 'phone' or 'email' to send OTP`
            }
        }

        const otpKey = phone ? { phone } : { email };

        const { status, message, success } = await SendOtp(otpKey);

        return res.status(status).json({ message, success });

    } catch (error) {

        return res.status(error.status).json({
            success: false,
            error: error.message || `Internal Server Error: '${error}'`
        });
    }
}

export const sign_up = async (req, res) => {
    try {
        const {
            name, email, phone,
            segment,
            address,
            password, otp
        } = req.body;

        if (!otp) {
            return res.status(400).json({
                error: `'otp' field must be required`,
                message: 'Validation failed',
                success: false
            });
        }

        const userData = {
            name,
            email, phone,
            password,
            permission, segment,
            address,
            otp: otp,
            isVerified: true,
        }

        const { status, success, message, data } = await SignUp(userData);

        return res.status(status).json({ message, data, success });

    } catch (error) {
        const handle = ErrorHandle_H(error);

        if (handle?.status) {
            return res.status(handle.status).json({
                error: handle.error,
                errors: handle.errors,
                success: false
            });
        }

        return res.status(error.status || 500).json({
            success: false,
            error: error.message || `Internal Server Error: '${error}'`
        });
    }
}

export const vendor_registration = async (req, res) => {
    try {
        const {
            businessName, businessEmail, businessPhone, password,
            businessDescription,
            accountNumber, ifsc, bankName,
            gstNumber, address, type,
        } = req.body;

        const userId = req.query.userId;

        if (userId && req.user.role === 'user' && req.user.id !== userId) {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission`
            }
        }

        const reqData = {
            userId: req.user.role === 'user' ? req.user.id : userId,
            businessName, businessEmail, businessPhone,
            businessDescription, password, gstNumber,
            type, address,
            bankDetails: {
                accountNumber,
                ifsc,
                bankName
            },
            status: ['admin', 'super_admin', 'staff'].includes(req.user.role) ? 'approved' : 'pending',
        }

        const filePayload = {
            logoFile: req.files.logoUrl?.[0] || null,
            documents: req.files.documents || []
        }

        const { status, success, message, data } = await VendorRegistration(reqData, filePayload);

        return res.status(status).json({
            message, data, success
        });

    } catch (error) {
        try {
            ErrorHandle_H(error);
        } catch (handled) {
            return res.status(handled.status || 500).json({
                success: false,
                message: handled.message,
                errors: handled.errors || null
            });
        }
    }
}

// Step-1
export const sign_in_withGoogle = async (req, res) => {
    try {
        const { status, success, authUrl } = await SignWithGoogle();

        return res.status(status).redirect(authUrl, success);

    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error: error.message || `Internal Server Error: '${error}'`,
        });
    }
}

// Step-2
export const google_Callback = async (req, res) => {

    try {
        const code = req.query.code;

        const { status, success, tokens, message } = await GoogleCallback(res, code, req.ip)

        return res.status(status).json({ message, tokens, success });

    } catch (error) {

        return res.status(error.status || 500).json({
            success: false,
            error: error.message || `Internal Server Error: '${error}'`,
        });
    }

}

// UPDATE CONTROLLERS--------------------------------|

export const change_passoword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            throw {
                status: 400,
                message: `All three fields 'oldPassword', 'newPassword' and, 'confirmPassword' fields must be required`
            }
        }

        if (newPassword !== confirmPassword) {
            throw {
                status: 409,
                message: `Password mistmatch`
            };
        };

        const { status, success, message } = await ChangePassword({ oldPassword, newPassword }, req.user);

        return res.status(status).json({ message, success });

    } catch (error) {

        return res.status(error.status || 500).json({
            success: false,
            error: error.message || `Internal Server Error: '${error}'`,
        });
    }
}

export const forgot_password = async (req, res) => {
    try {
        const { email, phone,
            staffEmail, staffPhone,
            businessEmail, businessPhone,
        } = req.body;

        const identifiers = [email, staffEmail, staffPhone, businessEmail, businessPhone, phone].filter(Boolean);

        if (identifiers.length !== 1) {
            throw {
                status: 400,
                message: `Provide exactly ONE login field: 
                email, phone, 
                staffEmail, staffPhone, 
                businessEmail, or businessPhone`.replace(/\s+/g, ' '),
            }
        }

        const logKey = {};

        if (email) logKey.email = email;
        if (phone) logKey.phone = phone;
        if (businessEmail) logKey.businessEmail = businessEmail;
        if (businessPhone) logKey.businessPhone = businessPhone;
        if (businessEmail) logKey.staffEmail = staffEmail;
        if (businessPhone) logKey.staffPhone = staffPhone;

        const { status, success, message } = await ForgotPassword(logKey);

        return res.status(status).json({ message, success });

    } catch (error) {

        return res.status(error.status || 500).json({
            success: false,
            error: error.message || `Internal Server Error: '${error}'`,
        });
    }
}

export const reset_password = async (req, res) => {
    try {

        const { email, phone,
            staffEmail, staffPhone,
            businessEmail, businessPhone,
            newPassword, confirmPassword,
            otp
        } = req.body;

        const identifiers = [email, staffEmail, staffPhone, businessEmail, businessPhone, phone].filter(Boolean);

        const errors = [];

        if (identifiers.length !== 1)
            errors.push(`Provide exactly ONE login field: 
                email, phone, 
                staffEmail, staffPhone, 
                businessEmail, or businessPhone`.replace(/\s+/g, ' '))

        /*   *In OTP Case*   */
        if (!otp)
            errors.push(`'otp' field must be required`);

        /*   *End OTP Case*   */

        if (!newPassword || !confirmPassword)
            errors.push(`Both 'newPassword' and 'newPassword' fields must be required`);

        if (errors.length > 0) {
            throw {
                status: 400,
                errors,
                message: 'Validation failed'
            }
        }

        if (newPassword !== confirmPassword)
            throw {
                status: 409,
                message: `Password mistmatch`,
            };

        const logKey = {};

        if (email) logKey.email = email;
        if (phone) logKey.phone = phone;
        if (businessEmail) logKey.businessEmail = businessEmail;
        if (businessPhone) logKey.businessPhone = businessPhone;
        if (businessEmail) logKey.staffEmail = staffEmail;
        if (businessPhone) logKey.staffPhone = staffPhone;

        const { status, success, message } = await ResetPassword(logKey, otp, newPassword);

        return res.status(status).json({ message, success });

    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            errors: error.errors,
            error: error.message || `Internal Server Error: '${error}'`,
        });
    }
}