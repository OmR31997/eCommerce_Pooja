import fetch from "node-fetch";

export const sendEmail = async (to, subject, htmlContent = null) => {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.SMTP_API_KEY_PASS,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { 
            name: process.env.SENDER_NAME, 
            email: process.env.SENDER_EMAIL },
        to: [{ email: to }],
        subject,
        htmlContent,
      }),
    });

    const data = await response.json();

    if (response.ok && data.messageId) {
      console.log("Brevo Email Sent:", data);
      return { success: true, messageId: data.messageId };
    }

    console.error("Brevo Email Failed:", data);
    return { success: false, error: data.message || "Failed to send email" };
  } catch (error) {
    console.error("Brevo Email Error:", error);
    return { success: false, error: error.message };
  }
};
