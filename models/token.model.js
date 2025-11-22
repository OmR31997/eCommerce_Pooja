import mongoose from "mongoose";

const RefreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, `'token' field must be required`],
        unique: true,
    },
    logId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, `'logId' field must be required`],
        refPath: 'logRole',
    },
    logRole: {
        type: String,
        enum: ['user', 'admin', 'super_admin', 'vendor'],
        required: [true, `'logType' field must be required`],
    },
    expiresAt: {
        type: Date,
        required: [true, `'expiresAt' field must be required`],
    },
    createdByIp: String,
    revokedAt: Date,
    revokedByIp: String,
    replacedByToken: String,
}, { timestamps: true });

RefreshTokenSchema.virtual('isExpired').get(function () {
    return Date.now() >= this.expiresAt
});

RefreshTokenSchema.virtual('isActive').get(function () {
    return !this.revokedAt && !this.isExpired;
})

const BlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, `'token' field must be required`],
        unique: true,
    },
    expiredAt: {
        type: Date,
        required: [true, `'expiredAt' field must be required`],
    },
});

export const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema);
export const Blacklist = mongoose.model("Blacklist", BlacklistSchema);