import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export const resetTokenStore = new Map();
const imageTokenStore = new Map();

const set_token = (resetToken, id, ttlMs) => {
    resetTokenStore.set(resetToken, {
        id: id.toString(),
        expiresAt: Date.now() + ttlMs,
    });

    setTimeout(() => resetTokenStore.delete(resetToken), ttlMs);
}

export const generateEncryptedToken = (id) => {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const ttlMs = 5*60*1000;
    const tokenExpiresAt = new Date(Date.now() + ttlMs);

    set_token(resetToken, id, ttlMs);

    return {
        resetToken,
        message: 'Reset Token Expires in 5 minutes',
        tokenExpiresAt,
    }
}

export const imageEncryption = (imagePath) => {
    const token = crypto.randomBytes(32).toString('hex');
    const apiPath = `/api/image/${token}`
    imageTokenStore.set(token, {id: imagePath.toString()});

    return apiPath;
}

export const imageDecryption = (encryptedPath) => {
    const imageToken = imageTokenStore.get(encryptedPath);

    if (!imageToken) return null;

    return imageToken.id;
} 