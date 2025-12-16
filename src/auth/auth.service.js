import { ENV } from '../../config/env.config.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import qs from 'qs';
import { User } from '../customer/user.model.js';
import { RefreshToken } from '../token/token.model.js';
import { CreateAccessToken, CreateRefreshTokenString, RevokeRefreshToken, SaveRefreshToken } from '../token/tokens.service.js';
import { ClearRefreshCookie, SetRefreshCookie } from '../../utils/cookies.js';
import { Admin } from '../admin/admin.model.js';
import { DeleteLocalFile_H } from '../../utils/fileHelper.js';
import { SendEmail } from '../../utils/sendEmail.js';
import { GenerateOtp_H, otpStore, VerifyOtp_H,  } from '../../utils/otp.js';
import { Permission } from '../permission/permission.model.js';
import { Role } from '../role/role.model.js';
import { Staff } from '../staff/staff.model.js';
import { Vendor } from '../vendor/vendor.model.js';
import { Notify } from '../notification/notification.service.js';
import { FindUserFail_H, IdentifyModel_H, IdentifyModelByGoogleEmail_H, IdentifyModelByRole_H, UploadFilesWithRollBack_H, UploadImageWithRollBack_H } from '../../utils/helper.js';
import { ToDeleteFromCloudStorage_H } from '../../utils/cloudUpload.js';

// CREATE---------------------------------|
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

export const Refresh_Token = async (tokenData) => {
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
}

export const SignIn = async (res, logKey, password, ip) => {

    const { model, role } = IdentifyModel_H(logKey);

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

    if (!isMatch) throw { status: 409, message: `Invalid Password`, success: false };

    if (['admin', 'super_admin', 'staff', 'vendor'].includes(role)) {

        const tokens = await GenerateAndSendToken({ res, logId: existing._id, logRole: role, ip });

        return { status: 200, message: 'Sign-In successfully', tokens, success: true };
    }

    const otpKey = logKey.phone ? logKey.phone : logKey.email;

    const responseOtp = GenerateOtp_H(otpKey);

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

export const SendOtp = async (otpKey) => {
    const { phone, email } = otpKey;

    const { otp, message, otpExpiresAt } = GenerateOtp_H(email ?? phone);

    const { status, success, messageId } = phone
        ? ''
        : await SendEmail(
            email,
            'Your OTP for Sign-Up',
            `<p>Your verification code is <b>${otp}</b>, ${message}</p>`
        );

    console.log({ otp, message, messageId, otpExpiresAt });

    return {
        status,
        message,
        success
    };
}

export const ConfirmOtp = async (res, reqData, ip) => {
    try {

        const { email, phone, otp } = reqData;

        const existing = await User.findOne({ $or: [{ email }, { phone }] });

        if (!existing) {
            return { status: 400, error: `User not found`, success: false };
        }

        const otpKey = email ? email : phone;

        const verification = VerifyOtp_H(otpKey, otp);

        if (!verification.valid) return { status: 400, error: verification.reason, success: false };

        const tokens = await GenerateAndSendToken({ res, logId: existing._id, logRole: 'user', ip });

        return { status: 200, message: 'Sign-In successfully', tokens, success: true };

    }
    catch (error) {
        return { status: 500, error: `Error in 'SignIn' ${error}`, success: false }
    }
}

const SALT = parseInt(process.env.HASH_SALT) ?? 10;
export const SignUp = async (userData) => {

    const { email, phone, password } = userData;

    const existUser = await User.findOne({ $or: [{ email }, { phone }] }).lean();

    if (existUser) {
        throw {
            status: 409,
            message: 'Email/Phone already registered'
        }
    }

    let otpKey = null;

    if (otpStore.has(email))
        otpKey = email;
    else if (otpStore.has(phone))
        otpKey = phone;

    if (!otpKey) {
        throw {
            status: 400,
            error: 'No OTP found for this email or phone. Please request OTP again.',
        }
    }

    const verification = VerifyOtp_H(otpKey, userData.otp);

    if (!verification.valid) {
        throw {
            status: 417,
            error: verification.reason,
        }
    }

    const permission = await Permission.findOne({ name: 'user' }).select('_id');
    const role = await Role.findOne({ name: 'user' }).select('_id');

    userData.password = await bcrypt.hash(password, SALT);
    userData.permission = permission._id;
    userData.roles.push(role._id);

    const data = await User.create(userData);

    return { status: 201, message: 'User created successfully with verified OTP', data, success: true };

}

export const VendorRegistration = async (reqData, filePayload) => {

    const { documents, logoFile } = filePayload;

    const session = await mongoose.startSession();
    session.startTransaction();

    const uploaded = {
        logoUrl: null,
        documents: []
    }

    let data = null;

    try {
        const user = await FindUserFail_H({ _id: reqData.userId }, "userId roles");

        uploaded.logoUrl = await UploadImageWithRollBack_H(logoFile, "eCommerce/logoUrls");
        uploaded.documents = await UploadFilesWithRollBack_H(documents, "eCommerce/documents");

        // Assign uploaded files to vendorData
        if (uploaded.logoUrl) reqData.logoUrl = uploaded.logoUrl;
        if (uploaded.documents?.length > 0) reqData.documents = uploaded.documents;


        // Set role & hash password
        const role = await Role.findOne({ name: 'vendor' }).select("_id").session(session);
        const permission = await Permission.findOne({ name: 'vendor' }).select("_id").session(session);

        if (!user.roles.includes(role._id)) {
            // Update user roles 
            user.roles.push(role._id);
            await user.save();
        }

        reqData.role = role._id;
        reqData.permission = permission._id;

        reqData.password = await bcrypt.hash(reqData.password, SALT);

        const [created] = await Vendor.create([reqData], { session });
        data = created;

        await session.commitTransaction();
        session.endSession();
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();

        if (uploaded.documents?.length > 0) {
            // Rollback uploaded cloud files
            if (ENV.IS_PROD) {
                await Promise.all(uploaded.documents.map(uploadedFile => uploadedFile?.public_id ? ToDeleteFromCloudStorage_H(uploadedFile.public_id) : null));
            }

            // Rollback local files
            if (!ENV.IS_PROD) {
                await Promise.all(uploaded.documents.map(uploadedFile => DeleteLocalFile_H(uploadedFile.secure_url)));
            }
        }


        if (uploaded.logoUrl) {
            // Rollback uploaded cloud file
            if (ENV.IS_PROD && uploaded.logoUrl?.public_id) {
                await ToDeleteFromCloudStorage_H(uploaded.logoUrl.public_id);
            }

            // Rollback local file
            if (!ENV.IS_PROD && uploaded.logoUrl?.secure_url) {
                await DeleteLocalFile_H(uploaded.logoUrl.secure_url);
            }
        }

        throw error;
    }

    // Notification to admins
    await Notify.admin({
        title: 'New Vendor Registered',
        message: `${data.businessName} required approval`,
        type: 'vendor'
    });

    return { status: 200, message: 'Vendor registration done successfully', data, success: true };
}

/*  *3PARTY BASED SERVICE SYNCHRONIZATION*    */
const GOOGLE_AUTH_URL = process.env.GOOGLE_AUTH_URL;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const GOOGLE_TOKEN_URL = process.env.GOOGLE_TOKEN_URL;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const SCOPES = [process.env.GOOGLE_AUTH_EMAIL, process.env.GOOGLE_AUTH_PROFILE].join(' ');

export const SignWithGoogle = async () => {
    return {
        status: 200,
        success: true,
        authUrl: `${GOOGLE_AUTH_URL}client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=code&scope=${encodeURIComponent(SCOPES)}&access_type=offline&prompt=consent`
    };
}

export const GoogleCallback = async (res, code, ip) => {

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
        throw {
            status: 400,
            message: 'Failed to obtain id_token from Google'
        };
    }

    // Step 2: Verify token
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email } = payload;

    if (!email) {
        throw {
            status: 400,
            error: 'Email not provided by Google'
        }
    };

    // Step-3: Identify Which Model To Check
    const { role, model, key } = IdentifyModelByGoogleEmail_H(email);

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
            throw {
                status: 403,
                message: `Email cannot contain reserved keywords: super, admin, support, vendor`
            };
        }

        const userRole = await Role.findOne({ name: 'user' }).lean().select('_id');
        const perm = await Permission.findOne({ name: 'user' }).lean().select('_id');

        const newUser = new User({
            name, email,
            permission: perm._id,
            roles: [userRole._id],
            isGoogleAuth: true
        }, { validateBeforeSave: false })

        await newUser.save({ validateBeforeSave: false });

        user = newUser;
        finalRole = 'user'
    }

    const tokens = await GenerateAndSendToken({ res, logId: user._id, logRole: finalRole, ip });

    return { status: 200, message: 'Sign-In successfully', tokens, success: true };
}
/*  *End With 3 Party Service Case*   */

// UPDATE---------------------------------| SERVICES
export const ChangePassword = async (reqData, user) => {

    const { oldPassword, newPassword } = reqData;

    const { model } = IdentifyModelByRole_H(user.role);

    const Models = { Admin, Staff, Vendor, User };

    const existing = await Models[model].findById(user.id).select('+password');

    if (!existing) {
        throw {
            status: 404,
            message: `${model} account not found for ID: '${user.id}'`,
        };
    }

    const isMatch = await bcrypt.compare(oldPassword, existing.password);

    if (!isMatch) {
        throw {
            status: 409,
            message: `Incorrect Old Password`
        };
    }

    existing.password = await bcrypt.hash(newPassword, SALT);

    await existing.save();

    return { status: 200, success: true, message: `Password changed successfully.` }
}

export const ForgotPassword = async (logKey) => {

    const { role, model } = IdentifyModel_H(logKey);

    const Models = { Admin, Vendor, Staff, User };

    const existing = await Models[model].findOne(logKey);

    if (!existing) {
        throw {
            status: 404,
            message: `Account not found!`,
        }
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
    const responseOtp = GenerateOtp_H(otpKey);

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

    /*   *OTP-Case*   */
    const { logValue, model } = IdentifyModel_H(logKey);

    const Models = { Admin, Vendor, Staff, User };

    const verification = VerifyOtp_H(logValue, otp);

    if (!verification.valid) {
        throw {
            status: 403,
            message: verification.reason,
        };
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT);

    const account = await Models[model].findOneAndUpdate(logKey, { $set: { password: hashedPassword } }, { new: true });

    if (!account) {
        throw {
            status: 404,
            message: 'Account not found',
        }
    }

    return { status: 200, message: 'Account password set successfully', success: true };
}

export const SignOut = async (refreshToken) => {
    const tokenDoc = await RefreshToken.findOne({ token: refreshToken });

    if (!tokenDoc || tokenDoc.revokedAt) {
        throw { status: 403, message: 'Invalid or already revoked token' };
    }

    tokenDoc.revokedAt = new Date();

    await tokenDoc.save();

    return {
        status: 200,
        success: true,
        message: 'Logged out successfully',
    }
}

export const SignOutAll = async (ip, user) => {
    await RefreshToken.updateMany({ logId: user.id }, { revokedAt: new Date(), revokedByIp: ip });

    ClearRefreshCookie(res);

    return {
        status: 200,
        success: true,
        message: 'Logged out successfully',
    }
}