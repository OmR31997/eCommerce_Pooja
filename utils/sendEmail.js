import axios from 'axios';
import fetch from 'node-fetch';

export const sendEmail = async (to, subject, htmlContent = null) => {
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

    const data = response.data;

    if (response.status === 201 && data.messageId) {
      return { success: true }
    }

    console.error('Brevo Email Failed', data);
    return { success: false, error: data.message || `Failed to send email: ${to}` };

  } catch (error) {

    console.error('Brevo Email Error', error);
    return { error: error.message, success: false };
  }
}