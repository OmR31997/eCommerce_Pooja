import { User } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { ChangePassword, ConfirmOtp, ForgotPassword, GoogleCallback, Refresh_Token, ResetPassword, SendOtp, SignIn, SignOut, SignOutAll, SignUp, SignWithGoogle, VendorRegistration } from '../services/auth.service.js';
import { ErrorHandle } from '../utils/fileHelper.js';

/*  *test_protected handler*  */
export const test_protected = async (req, res) => {
    try {
        return res.status(200).json({
            message: 'You have access',
            user: req.user
        });
    } catch (error) {
        if (err.status) {
            return res.status(err.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

/*  *refresh_token handler*  */
export const refresh_token = async (req, res) => {
    const REFRESH_TOKEN_COOKIE_NAME = process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken";
    const cookieName = REFRESH_TOKEN_COOKIE_NAME;
    const token = req.cookies?.[cookieName] || req.body?.refreshToken;

    if (!token) return res.status(401).json({ error: 'No refresh token.', success: false });

    const tokenData = {
        token,
        ip: req.ip,
        res,
    }

    const { status, error, success, accessToken, refreshToken } = await Refresh_Token(tokenData);

    if (!success) {
        return res.status(status).json({ error, success });
    }

    return res.status(200).json({ accessToken, refreshToken, success: true });
}

/*  *sign_in handler*  */
export const sign_in = async (req, res) => {
    try {
        const { email, phone,
            businessEmail, businessPhone,
            staffEmail, staffPhone,
            password } = req.body;

        const identifiers = [email, staffEmail, staffPhone, businessEmail, businessPhone, phone].filter(Boolean);

        if (identifiers.length !== 1) {
            throw {
                status: 400,
                success: false,
                message: `Provide exactly ONE login field: email, phone, staffEmail, staffPhone, businessEmail, or businessPhone.`
            };
        }

        const errors = [];
        if (!password)
            errors.push(`'password' field must be required`);

        if (errors.length > 0) {
            return res.status(400).json({
                errors,
                message: 'Validatior failed',
                success: false,
            })
        }

        const logKey = {};

        if (email) logKey.email = email;
        if (phone) logKey.phone = phone;
        if (businessEmail) logKey.businessEmail = businessEmail;
        if (businessPhone) logKey.businessPhone = businessPhone;
        if (businessEmail) logKey.staffEmail = staffEmail;
        if (businessPhone) logKey.staffPhone = staffPhone;


        const { status, success, message, tokens } = await SignIn(res, logKey, password, req.ip);

        return res.status(status).json({ message, tokens, success });
    } catch (error) {

        const handle = ErrorHandle(error);

        if (handle?.status)
            return res.status(handle.status).json({ error: handle.error, errors: handle.errors, success: false });

        return res.status(500).json({ error: error.message });

    }
}

/*  *confirm_signIn_otp handler*  */
export const confirm_signIn_otp = async (req, res) => {
    const { email, phone, otp } = req.body;

    const errors = [];

    if ((email && phone) || !(email || phone)) {
        errors.push(`Field either 'email' or 'phone' must be required`);
    }

    if (!otp) errors.push(`'otp' field must be required`);

    if (errors.length > 0) {
        return res.status(400).json({
            errors,
            message: 'Validatior failed',
            success: false,
        });
    }

    const { status, success, error, tokens, message } = await ConfirmOtp(res, { email, otp }, req.ip);

    if (!success) return res.status(status).json({ error, success });

    return res.status(status).json({ message, tokens, success });
}

/*  *Log-out*  */

/*  *logout handler*  */
export const sign_out = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({
            error: 'No refresh token',
            success: false,
        });
    }

    const { status, error, success, message } = await SignOut(refreshToken);

    if (!success) {
        return res.status(status).json({ error, success, message });
    }

    res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'Strict' });

    return res.status(status).json({
        message,
        success,
    })
}

/*  *logout_all_devices handler*  */
export const sign_out_all_devices = async (req, res) => {

    const { status, success, error, message } = await SignOutAll(req.ip, req.user);

    if (!success) {
        return res.status(status).json({ error, success })
    }

    return res.status(status).json({
        message,
        success
    })
}


/*  **New Registration**  */

/*  *send_otp handler*  */
export const send_otp = async (req, res) => {
    const { email, phone } = req.body;

    if (!email && !phone) {
        return res.status(400).json({
            error: `Please provide either 'phone' or 'email' to send OTP`,
            success: false,
        });
    }

    const otpKey = phone ? { phone } : { email };

    const { status, error, message, success } = await SendOtp(otpKey);

    if (!success) {
        return res.status(status).json({ error, success });
    }

    return res.status(status).json({ message, success });
}

/*  *sign_up handler*  */
export const sign_up = async (req, res) => {
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
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        password: password || undefined,
        permission: undefined,
        roles: [],
        segment: segment || null,
        address: address || undefined,
        otp: otp,
        isVerified: true,
    }

    const { status, error, errors, success, message, data } = await SignUp(userData);

    return res.status(status).json({ error, errors, message, data, success });

}

/*      * vendor_registration handler *      */
export const vendor_registration = async (req, res) => {
    try {
        const {
            businessName, businessEmail, businessPhone, password,
            businessDescription,
            accountNumber, ifsc, bankName,
            gstNumber, address, type,
        } = req.body;

        const files = req.files || {};
        const filePayload = {
            logoUrl: files.logoUrl?.[0] || null,
            documents: files.documents || []
        }

        const { role } = req.user;
        const userId = req.query.userId;

        if (userId && role === 'user' && req.user.id !== userId) {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission`
            }
        }

        const { status, success, message, data } = await VendorRegistration({
            userId: role === 'user' ? req.user.id : userId,
            businessName, businessEmail, businessPhone,
            businessDescription, password, gstNumber,
            status: ['admin', 'super_admin', 'staff'].includes(req.user.role) ? 'approved' : 'pending',
            bankDetails: {
                accountNumber,
                ifsc,
                bankName
            },
            type, address
        }, filePayload);

        return res.status(status).json({
            message, data, success
        });

    } catch (error) {

        const handle = ErrorHandle(error);

        if (handle?.status)
            return res.status(handle.status).json({ error: handle.error, errors: handle.errors, success: false });

        return res.status(500).json({ error: error.message });
    }
}

/*  *sign_in_withGoogle handler*  */
export const sign_in_withGoogle = async (req, res) => {
    const { status, success, error, authUrl } = await SignWithGoogle();

    if (!success) return { status, error, success };

    return res.status(status).redirect(authUrl);
}

/*  *google_Callback handler*  */
export const google_Callback = async (req, res) => {

    const code = req.query.code;

    const { status, success, tokens, message } = await GoogleCallback(res, code, req.ip)

    if (!success) {
        return res.status(status).json({ error, success });
    }

    return res.status(status).json({ message, tokens, success });

}

/*  *change_passowrd handler*  */
export const change_passoword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!oldPassword || !newPassword || !newPassword) {
            return res.status(400).json({ error: `All three fields 'oldPassword' and 'newPassword' fields must be required`, success: false })
        }

        if (newPassword !== confirmPassword) {
            return res.status(409).json({
                error: `Password mistmatch`,
                success: false,
            });
        };

        const { status, success, message } = await ChangePassword({ oldPassword, newPassword }, req.user);

        return res.status(status).json({ message, success });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error or 'ChangePasswrod' - ${error}` });
    }
}

/* **forgot_password logic here** */
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
                success: false
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
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error or 'ForgotPasswrod' - ${error}` });
    }
}

/* **reset_password logic here** */
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
            `Provide exactly ONE login field: 
                email, phone, 
                staffEmail, staffPhone, 
                businessEmail, or businessPhone`.replace(/\s+/g, ' ');

        /*   *In OTP Case*   */
        if (!otp)
            errors.push(`'otp' field must be required`);

        /*   *End OTP Case*   */

        if (!newPassword || !confirmPassword)
            errors.push(`Both 'newPassword' and 'newPassword' fields must be required`);

        if (errors.length > 0) {
            return res.status(400).json({
                errors,
                message: 'Validatior failed',
                success: false,
            })
        }

        if (newPassword !== confirmPassword)
            throw {
                status: 409,
                message: `Password mistmatch`,
                success: false
            };

        const logKey = {};

        if (email) logKey.email = email;
        if (phone) logKey.phone = phone;
        if (businessEmail) logKey.businessEmail = businessEmail;
        if (businessPhone) logKey.businessPhone = businessPhone;
        if (businessEmail) logKey.staffEmail = staffEmail;
        if (businessPhone) logKey.staffPhone = staffPhone;

        const { status, success, message } = await ResetPassword(logKey, otp, newPassword);

        return res.status(status).json({
            message,
            success
        })
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: `Internal Server Error or 'ForgotPasswrod' - ${error}` });
    }
}