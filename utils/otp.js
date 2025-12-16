// **In-Memory Cache (for testing in small project)
export const otpStore = new Map();

const SetOtp = (otpKey, otp, ttlMs) => {
    otpStore.set(otpKey, {
        otp,
        expiresAt: Date.now() + ttlMs
    });

    setTimeout(() => otpStore.delete(otpKey), ttlMs);
}

export const VerifyOtp_H = (otpKey, otp) => {
    console.log(`OtpKey: ${otpKey}, OTP: ${otp}`)
    const existing = otpStore.get(otpKey);

    if (!existing) {
        return {
            reason: 'OTP expired or not found',
            valid: false,
        }
    }

    if (Date.now() > existing.expiresAt) {
        otpStore.delete(otpKey);
        return {
            reason: 'OTP expired',
            valid: false,
        }
    }

    if (existing.otp !== otp) {
        return {
            reason: 'Invalid OTP',
            valid: false,
        }
    }

    otpStore.delete(otpKey);

    return { valid: true };
}

export const GenerateOtp_H = (otpKey) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const ttlMs = 5*60*1000;
    const otpExpiresAt = new Date(Date.now() + ttlMs);
    SetOtp(otpKey, otp, ttlMs);

    return {
        otp,
        message: 'OTP generated successfully & OTP valid for 5 minutes.',
        otpExpiresAt,
    }
}
