import crypto from 'crypto';

export const resetTokenStore = new Map();

const set_token = (resetToken, userId, ttlMs) => {
    resetTokenStore.set(resetToken, {
        userId: userId.toString(),
        expiresAt: Date.now() + ttlMs,
    });

    setTimeout(() => resetTokenStore.delete(resetToken), ttlMs);
}

export const generateEncryptedToken = (userId) => {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const ttlMs = 5*60*1000;
    const tokenExpiresAt = new Date(Date.now() + ttlMs);

    set_token(resetToken, userId, ttlMs);

    return {
        resetToken,
        message: 'Reset Token Expires in 5 minutes',
        tokenExpiresAt,
    }
}