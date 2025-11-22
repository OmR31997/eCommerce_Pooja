import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Blacklist, RefreshToken } from '../models/token.model.js';
import { CreateAccessToken, CreateRefreshTokenString, RevokeRefreshToken, SaveRefreshToken } from '../utils/tokens.js';
import { ClearRefreshCookie, SetRefreshCookie } from '../utils/cookies.js';
import { Admin } from '../models/admin.model.js';
import { ErrorHandle, GetModelByRole, IdentifyModel, IdentifyModelByGoogleEmail } from '../utils/fileHelper.js';
import { SendEmail } from '../utils/sendEmail.js';
import { GenerateOtp, otpStore, VerifyOtp } from '../utils/otp.js';
import { Permission } from '../models/permission.model.js';
import { Role } from '../models/role.model.js';
import { Staff } from '../models/staff.model.js';
import { Vendor } from '../models/vendor.model.js';
import axios from 'axios';
import qs from 'qs';

export const GenerateAndSendToken = async ({ res, logId, logRole, ip }) => {
    try {
        const accessToken = CreateAccessToken({ id: logId, role: logRole })
        const refreshString = CreateRefreshTokenString();

        await SaveRefreshToken({
            tokenString: refreshString,
            logId,
            logRole,
            ip,
        });

        SetRefreshCookie(res, refreshString);       //Required res

        return { accessToken, refreshToken: refreshString };

    } catch (error) {
        throw new Error(`Error in GenerateAndSendToken: ${error.message}`);
    }
}

export const SignInn = async (reqData, signData) => {
    try {
        const existing = await Admin.findOne({ email: signData.email });

        if (!existing) {
            return { status: 404, success: false, error: `Admin not found for email: ${email}` }
        }

        reqData.logId = existing._id;
        reqData.logRole = 'admin';

        const tokens = await GenerateAndSendToken(reqData);

        return {
            status: 200,
            success: true,
            message: 'Logged successfully',
            tokens
        }
    } catch (error) {

        const handled = await ErrorHandle(error, 'SignIn');
        return handled || { status: 500, success: false, error: 'SignIn failed' };
    }
}

export const Refresh_Token = async (tokenData) => {
    try {

        const JWT_SECRET = process.env.JWT_SECRET;
        const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';

        const existing = await RefreshToken.findOne({ token: tokenData.token });

        if (!existing || existing.revokedAt || new Date(existing.expiresAt) <= new Date()) {
            return { status: 401, error: 'Invalid or expired refresh token', success: false };
        }

        const newString = CreateRefreshTokenString();

        await SaveRefreshToken({
            tokenString: newString,
            logId: existing.logId,
            logRole: existing.logRole,
            ip: tokenData.ip,
        });

        await RevokeRefreshToken(existing, tokenData.ip, newString);

        const accessToken = jwt.sign({ id: existing.logId, role: existing.logRole }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN })

        SetRefreshCookie(tokenData.res, newString);

        return { status: 200, accessToken, refreshToken: newString, success: true };

    } catch (error) {
        const handled = await ErrorHandle(error, 'SignIn');
        return handled || { status: 500, success: false, error: 'SignIn failed' };
    }
}

export const SignIn = async (res, logKey, password, ip) => {

    const { model, role } = IdentifyModel(logKey);

    const Models = { Admin, Staff, Vendor, User };

    const existing = await Models[model].findOne(logKey)
        .select(`+password`);

    if (!existing) return { status: 404, message: `Account not found`, success: false };

    if (!['active', 'approved'].includes(existing.status) && !['admin', 'super_admin'].includes(role)) {
        throw {
            status: 403,
            message: 'Account has been blocked/pending. Please contact support team',
            success: false
        };
    }

    const isMatch = await bcrypt.compare(password, existing.password);

    if (!isMatch) return { status: 409, message: `Invalid Password`, success: false };

    if (role !== 'user') {

        const tokens = await GenerateAndSendToken({ res, logId: existing._id, logRole: role, ip });

        return { status: 200, message: 'Sign-In successfully', tokens, success: true };
    }

    const otpKey = logKey.phone ? logKey.phone : logKey.email;

    const responseOtp = GenerateOtp(otpKey);

    const { status, messageId, success } = logKey.phone
        ? ''
        : await SendEmail(
            logKey.email,
            'Your OTP for Sign-Up',
            `<p>Your verification code is <b>${responseOtp.otp}</b>, ${responseOtp.message}</p>`
        );

    console.log({ ...responseOtp, messageId });

    return { status, message: responseOtp.message, success };
}

export const SignOut = async (refreshToken) => {
    try {
        const tokenDoc = await RefreshToken.findOne({ token: refreshToken });

        if (!tokenDoc || tokenDoc.revokedAt) {
            return { status: 403, error: 'Invalid or already revoked token', success: false };
        }

        tokenDoc.revokedAt = new Date();

        await tokenDoc.save();

        return {
            status: 200,
            success: true,
            message: 'Logged out successfully',
        }
    } catch (error) {

        const handled = await ErrorHandle(error, 'SignOut');
        return handled || { status: 500, success: false, error: 'SignOut failed' };
    }
}

export const SignOutAll = async (ip, user) => {
    try {
        await RefreshToken.updateMany({ logId: user.id }, { revokedAt: new Date(), revokedByIp: ip });
        ClearRefreshCookie(res);
        return {
            status: 200,
            success: true,
            message: 'Logged out successfully',
        }
    } catch (error) {

        const handled = await ErrorHandle(error, 'SignOutAll');
        return handled || { status: 500, success: false, error: 'SignOutAll failed' };
    }
}

export const SendOtp = async (otpKey) => {
    try {
        const { phone, email } = otpKey;

        const { otp, message, otpExpiresAt } = GenerateOtp(email ?? phone);

        const { status, success, error, messageId } = phone
            ? ''
            : await SendEmail(
                email,
                'Your OTP for Sign-Up',
                `<p>Your verification code is <b>${otp}</b>, ${message}</p>`
            );


        if (!success) {
            return { status, error, success }
        }

        console.log({ otp, message, messageId, otpExpiresAt });

        return {
            status,
            message,
            success
        };

    } catch (error) {
        const handled = await ErrorHandle(error, 'SendOtp');
        return handled || { status: 500, success: false, error: 'Sending otp failed' };
    }
}

export const ConfirmOtp = async (res, reqData, ip) => {
    try {

        const { email, phone, otp } = reqData;

        const existing = await User.findOne({ $or: [{ email }, { phone }] });

        if (!existing) {
            return { status: 400, error: `User not found`, success: false };
        }

        const otpKey = email ? email : phone;

        const verification = VerifyOtp(otpKey, otp);

        if (!verification.valid) return { status: 400, error: verification.reason, success: false };

        const tokens = await GenerateAndSendToken({ res, logId: existing._id, logRole: 'user', ip });

        return { status: 200, message: 'Sign-In successfully', tokens, success: true };

    }
    catch (error) {
        return { status: 500, error: `Error in 'SignIn' ${error}`, success: false }
    }
}

export const SignUp = async (userData) => {
    try {
        const SALT = parseInt(process.env.HASH_SALT) ?? 10;
        const { email, phone, password } = userData;

        const existUser = await User.findOne({ $or: [{ email }, { phone }] }).lean();

        if (existUser) return { status: 409, error: 'Email/Phone already registered', success: false }

        let otpKey = null;

        if (otpStore.has(email))
            otpKey = email;
        else if (otpStore.has(phone))
            otpKey = phone;

        if (!otpKey) return {
            status: 400,
            error: 'No OTP found for this email or phone. Please request OTP again.',
            success: false
        };

        const verification = VerifyOtp(otpKey, userData.otp);

        if (!verification.valid) return {
            status: 400,
            error: verification.reason,
            success: false
        };

        const permission = await Permission.findOne({ name: 'user' }).lean().select('_id');
        const role = await Role.findOne({ name: 'user' }).lean().select('_id');

        userData.password = await bcrypt.hash(password, SALT);
        userData.permission = permission._id;
        userData.roles.push(role._id);

        const data = await User.create(userData);

        return { status: 201, message: 'User created successfully with verified OTP', data, success: true };

    } catch (error) {
        const handled = await ErrorHandle(error, 'SignUp');
        return handled || { status: 500, success: false, error: `Error in 'SignUp' ${error}` };
    }
}


/*  *3PARTY BASED SERVICE SYNCHRONIZATION*    */

const GOOGLE_AUTH_URL = process.env.GOOGLE_AUTH_URL;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const GOOGLE_TOKEN_URL = process.env.GOOGLE_TOKEN_URL;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const SCOPES = [process.env.GOOGLE_AUTH_EMAIL, process.env.GOOGLE_AUTH_PROFILE].join(' ');
export const SignWithGoogle = async () => {
    try {
        return { status: 200, success: true, authUrl: `${GOOGLE_AUTH_URL}client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=code&scope=${encodeURIComponent(SCOPES)}&access_type=offline&prompt=consent` };
    } catch (error) {
        return { status: 500, error: `Error in SignWithGoogle ${error}`, success: false }
    }
}

export const GoogleCallback = async (res, code, ip) => {
    try {
        // Step 1: Exchange code for tokens
        const { data } = await axios.post(GOOGLE_TOKEN_URL,
            qs.stringify({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: GOOGLE_REDIRECT_URI,
                grant_type: 'authorization_code',
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const { id_token } = data;

        if (!id_token) {
            throw new Error('Failed to obtain id_token from Google');
        }

        // Step 2: Verify token
        const client = new OAuth2Client(GOOGLE_CLIENT_ID);

        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { name, email } = payload;

        if (!email) return { status: 400, error: 'Email not provided by Google', success: false };

        // Step-3: Identify Which Model To Check
        const { role, model, key } = IdentifyModelByGoogleEmail(email);

        // Step-4: Try To Find User Dynamically

        const Models = { Admin, Vendor, Staff, User };

        // Step-5: Updates in DB
        let user = await Models[model].findOne({ [key]: email });

        let finalRole = role;
        // Step-6: Create if not exists
        if (!user) {

            const lowerEmail = email.toLowerCase();
            const forbidden = ['super', 'admin', 'support', 'vendor'];

            if (forbidden.some(word => lowerEmail.includes(word))) {
                throw new Error(`Email cannot contain reserved keywords: super, admin, support, vendor`);
            }

            const perm = await Permission.findOne({ name: 'user' }).lean().select('_id');
            const userRole = await Role.findOne({ name: 'user' }).lean().select('_id');

            const newUser = new User({
                name,
                email,
                permission: perm,
                roles: [userRole],
                isGoogleAuth: true
            }, { validateBeforeSave: false })
            await newUser.save({ validateBeforeSave: false });

            user = newUser;
            finalRole = 'user'
        }

        const tokens = await GenerateAndSendToken({ res, logId: user._id, logRole: finalRole, ip });

        return { status: 200, message: 'Sign-In successfully', tokens, success: true };

    } catch (error) {
        return { status: 500, success: false, error: `Error in 'GoogleCallback' ${error}` }
    }
}

/*  *End With 3 Party Service Case*   */

export const ChangePassword = async (reqData, user) => {
    const SALT = parseInt(process.env.HASH_SALT) || 10;

    const { oldPassword, newPassword } = reqData;

    const { model } = GetModelByRole(user.role);

    const Models = { Admin, Staff, Vendor, User };

    const existing = await Models[model].findById(user.id).select('+password');

    if (!existing) {
        throw {
            status: 404,
            message: `Account not found for ID: '${user.id}'`,
            success: false,
        };
    }

    const isMatch = await bcrypt.compare(oldPassword, existing.password);

    if (!isMatch) {
        throw {
            status: 409,
            message: `Incorrect Old Password`,
            success: false,
        };
    }

    existing.password = await bcrypt.hash(newPassword, SALT);

    await existing.save();

    return { status: 200, success: true, message: `Password changed successfully.` }
}

export const ForgotPassword = async (logKey) => {

    const { role, model } = IdentifyModel(logKey);

    const Models = { Admin, Vendor, Staff, User };

    const existing = await Models[model].findOne(logKey);

    if (!existing) throw {
        status: 404,
        message: `Account not found!`,
        success: false
    }

    if (!['active', 'approved'].includes(existing.status) && !['admin', 'super_admin'].includes(role)) {
        throw {
            status,
            error: 'Account has been blocked/pending. Please contact support team',
            success: false
        };
    }

    const otpKey = logKey.phone ? logKey.phone : logKey.email;

    /* *Via OTP * */
    const responseOtp = GenerateOtp(otpKey);

    const { status, messageId, success } = logKey.phone
        ? ''
        : await SendEmail(
            logKey.email,
            'Your OTP for Sign-Up',
            `<p>Your verification code is <b>${responseOtp.otp}</b>, ${responseOtp.message}</p>`
        );

    console.log({ ...responseOtp, messageId });

    return { status, message: responseOtp.message, success };
}

export const ResetPassword = async (logKey, otp, newPassword) => {

    const SALT = parseInt(process.env.HASH_SALT) || 10;

    /*   *OTP-Case*   */
    const { logValue, model } = IdentifyModel(logKey);

    const Models = { Admin, Vendor, Staff, User };

    const verification = VerifyOtp(logValue, otp);

    if (!verification.valid) {
        throw {
            status: 403,
            message: verification.reason,
            success: false,
        };
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT);

    const account = await Models[model].findOneAndUpdate(logKey, { $set: { password: hashedPassword } }, { new: true });

    if (!account) {
        throw {
            status: 404,
            message: 'Account not found',
            success: false
        }
    }

    return { status: 200, message: 'Account password set successfully', success: true };
}