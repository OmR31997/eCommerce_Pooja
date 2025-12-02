import axios, { } from 'axios';
const RAZOR_BASE = `https://api.razorpay.com/v1`;

// Create RazorpayX Contact
export const CreateRazorContact = async (vendorData) => {
    try {
        const response = await axios.post(`${RAZOR_BASE}/contacts`, {
            name: vendorData.businessName,
            email: vendorData.businessEmail,
            contact: vendorData.businessPhone,
            type: 'vendor',
            referenceId: vendorData._id.toString()
        });
    } catch (error) {
        throw new Error('Failed to create Razorpay Contact', error.message);
    }
}