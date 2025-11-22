import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { RefreshToken } from '../models/token.model.js';

const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES || '30d';

export const CreateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
}

export const CreateRefreshTokenString = () => {
    return crypto.randomBytes(40).toString('hex');
}

export const ParseDurationToMs = (raw) => {
    const unit = raw.slice(-1);
    const n = parseInt(raw.slice(0, -1), 10);

    switch (unit) {
        case 's': return n * 1000;
        case 'm': return n * 60 * 1000;
        case 'h': return n * 60 * 60 * 1000;
        case 'd': return n * 24 * 60 * 60 * 1000;
        default: return parseInt(raw, 10) || 0;
    }
}

export const SaveRefreshToken = async ({ tokenString, logId, logRole, ip }) => {
    const expiresAt = new Date(Date.now() + ParseDurationToMs(REFRESH_EXPIRES));
    const rt = await RefreshToken.create({
        token: tokenString,
        logId,
        logRole,
        expiresAt,
        createdByIp: ip,
    });

    return rt;
}

export const RevokeRefreshToken = async (tokenDoc, ipAddress, replacedByToken) => {
    tokenDoc.revokedAt = new Date();
    tokenDoc.revokedById = ipAddress;

    if(replacedByToken) 
        tokenDoc.replacedByToken = replacedByToken;

    await tokenDoc.save();
}


/*     *To Get Secured Image (Token Based)*       */
/*
const imageTokenStore = new Map();

export const ImageEncryption = (imagePath) => {
    const token = crypto.randomBytes(32).toString('hex');
    const apiPath = `/api/image/${token}`
    imageTokenStore.set(token, {id: imagePath.toString()});

    return apiPath;
}

export const ImageDecryption = (encryptedPath) => {
    const imageToken = imageTokenStore.get(encryptedPath);

    if (!imageToken) return null;

    return imageToken.id;
}
*/

/*      *For, Forgot & Reset Synchronization of Token*     */
/*
export const resetTokenStore = new Map();
const SetToken = (resetToken, id, ttlMs) => {
    resetTokenStore.set(resetToken, {
        id: id.toString(),
        expiresAt: Date.now() + ttlMs,
    });

    setTimeout(() => resetTokenStore.delete(resetToken), ttlMs);
}

export const GenerateEncryptedToken = (id) => {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const ttlMs = 5*60*1000;
    const tokenExpiresAt = new Date(Date.now() + ttlMs);

    SetToken(resetToken, id, ttlMs);

    return {
        resetToken,
        message: 'Reset Token valid for 5 minutes',
        tokenExpiresAt,
        success: true,
    }
}
*/

/*      *Forgot Password Via Token*     */
 /*
    const responseToken = GenerateEncryptedToken(existing._id);
    console.log(responseToken);
*/

/*      *Reset Password Via Token*      */
/*
    const tokenData = resetTokenStore.get(token);

    if (!tokenData) {
        return res.status(400).json({
            error: 'Invalid or expired token',
        });
    }

    if (tokenData.expiresAt < Date.now()) {
        resetTokenStore.delete(token);
        return res.status(400).json({
            error: 'Token expired',
        });
    }

    const existing = await Models[model].findById(tokenData.id);

    if (!existing) {
        return res.status(400).json({
            error: `Account not found`
        })
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT);
    existing.password = hashedPassword;
    await existing.save();
*/