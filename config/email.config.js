import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user:process.env.SMTP_LOGIN_USER,
        pass: process.env.SMTP_KEY_PASS,
    },
});