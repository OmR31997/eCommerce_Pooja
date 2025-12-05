import axios from 'axios';

export const SendEmail = async (to, subject, htmlContent = null) => {
  try {
    const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: {
        name: process.env.SENDER_NAME,
        email: process.env.SENDER_EMAIL,
      },
      to: [{ email: to }],
      subject,
      htmlContent,
    },
      {
        headers: {
          'accept': 'application/json',
          'api-key': process.env.SMTP_API_KEY_PASS,
          'content-type': 'application/json',
        }
      });

    if (response.status === 201 && response.data.messageId) {
      return { status: 201, success: true, messageId: response.data.messageId };
    }

    console.error('Brevo Email Failed', data);

    throw new Error(`Mail failed to send`, data);

  } catch (error) {

    const status = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.errors?.[0]?.message ||
      error.message || "Brevo Email Error";

    throw {
      status,
      message: errorMessage,
    };
  }
}