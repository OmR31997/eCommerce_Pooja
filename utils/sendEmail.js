import { transporter } from "../config/email.config.js";

export const sendEmail = async (to, subject, text, html = null) => {
    try {
        const mailOptions = {
            from: process.env.FROM_EMAIL,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.messageId);

        return {
            messageId: info.messageId,
            success:true,
        }

    } catch (error) {
        console.error("Email send error:", error.message);
        return {success: false, error: error.message, status: 500}
    }
}