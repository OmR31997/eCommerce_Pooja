// **In-Memory Cache (for testing in small project)
export const otpStore = new Map();

const set_otp = (key, otp, ttlMs) => {
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
            reason: 'OTP expired or not found',
            valid: false,
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
}

export const generateOtp = (key) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const ttlMs = 5*60*1000;
    const otpExpiresAt = new Date(Date.now() + ttlMs);
    set_otp(key, otp, ttlMs);

    return {
        otp,
        message: 'OTP valid for 5 minutes.',
        otpExpiresAt,
    }
}
/* **End In-Memory** */
