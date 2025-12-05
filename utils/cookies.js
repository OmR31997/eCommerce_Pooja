import { ParseDurationToMs } from '../src/token/tokens.service.js';

const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';
const REFRESH_TOKEN_COOKIE_NAME = process.env.REFRESH_TOKEN_COOKIE_NAME || 'defaultRefreshToken'
const REFRESH_TOKEN_COOKIE_SECURE = process.env.REFRESH_TOKEN_COOKIE_SECURE === 'true';

export const SetRefreshCookie = (res, tokenString) => {
    const cookieName = REFRESH_TOKEN_COOKIE_NAME;

    const cookieOpts = {
        httpOnly: true,
        secure: REFRESH_TOKEN_COOKIE_SECURE,
        sameSite: 'strict',
        path: "/api/auth/refresh-token", // only sent to refresh route
        maxAge: ParseDurationToMs(REFRESH_TOKEN_EXPIRES_IN),
    };

    res.cookie(cookieName, tokenString, cookieOpts);
}

export const ClearRefreshCookie = (res) => {
    const cookieName = REFRESH_TOKEN_COOKIE_SECURE;
    res.clearCookie(cookieName, { 
        httpOnly: true, 
        secure: REFRESH_TOKEN_COOKIE_SECURE, 
        sameSite: 'strict', 
        path: '/api/auth/refresh-token' })
}