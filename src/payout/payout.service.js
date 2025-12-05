import axios from 'axios';
import { Vendor } from '../vendor/vendor.model.js';
import { Notify } from '../notification/notification.service.js';
import { Transaction } from '../transaction/transaction.model.js';

const Razor = {
    base: `https://api.razorpay.com/v1`,
    key: process.env.RAZORPAY_KEY_ID,
    secret: process.env.RAZORPAY_KEY_SECRET,
    PayX: process.env.RAZORPAYX_ACCOUNT
}
// Create RazorpayX Contact
export const CreateRazorContact = async (vendorData) => {
    try {
        const response = await axios.post(`${Razor.base}/contacts`, {
            name: vendorData.businessName,
            email: vendorData.businessEmail,
            contact: vendorData.businessPhone,
            type: "vendor",
            reference_id: vendorData._id.toString()
        },
            {
                auth: {
                    username: Razor.key,
                    password: Razor.secret
                }
            });

        return response.data;

    } catch (error) {
        throw new Error('Failed to create Razorpay Contact' + error.message);
    }
}

// Create Fund Account
export const CreateFundAccount = async (vendor, razorContactId) => {
    try {
        const response = await axios.post(`${Razor.base}/fund_accounts`,
            {
                contact_id: razorContactId,
                account_type: "bank_account",
                bank_account: {
                    name: vendor.businessName,
                    ifsc: vendor.ifsc,
                    account_number: vendor.accountNumber
                }
            },
            {
                auth: {
                    username: Razor.key,
                    password: Razor.secret
                }
            });

        return response.data;
    } catch (error) {
        throw new Error("Failed to create fund account: " + error.message);
    }
}

// Payout To Vendor WITH NOTIFICATION
export const CreateVendorPayout = async (vendorId, amount) => {
    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
        throw {
            status: 404,
            message: `Vendor not found for ID: ${vendorId}`
        }
    }

    if (!vendor.razorContactId || !vendor.fundAccountId) {
        throw {
            status: 400,
            message: `Vendor bank details missing`
        }
    }

    const amountPaise = amount * 100;

    try {
        const response = await axios.post(`${Razor.base}/payouts`,
            {
                account_number: Razor.PayX,
                fund_account_id: vendor.fundAccountId,
                amount: amountPaise,
                currency: 'INR',
                mode: 'IMPS',
                purpose: "payout",
                queue_if_low_balance: true,
                narration: `Payout to vendor ${vendorId}`
            },
            {
                auth: {
                    username: Razor.key,
                    password: Razor.secret
                }
            }
        );

        // Save DB Record
        await Transaction.create({
            vendorId,
            amount,
            razorpayPayoutId: response.data.id,
            status: response.data.status
        });

        // Notify to vendor
        await Notify.vendor(vendorId, {
            title: 'Payout Initiated',
            message: `Your payout request of ₹${amount} has been initiated.`,
            type: 'payout'
        });

        return {
            status: 200,
            message: 'Payout initiated successfully',
            payout: response.data,
            success: true
        };

    } catch (error) {
        throw {
            status: error.status || 500,
            message: `Payout failed: ${error.message}`
        }
    }
}

// Check Status & NOTIFY Vendor
export const CheckPayoutStatus = async (payoutId, vendorId, amount) => {
    try {
        const response = await axios.get(`${Razor.base}/payouts/${payoutId}`,
            {
                auth: {
                    username: Razor.key,
                    password: Razor.secret
                }
            }
        );

        const status = response.data.status;

        if (status === 'processed') {
            await Notify.vendor(vendorId, {
                title: 'Payout Successful',
                message: `Your payout of ₹${amount} has been transferred successfully.`,
                type: "payout"
            });
        }

        if (status === 'failed') {
            await Notify.vendor(vendorId, {
                title: 'Payout Failed',
                message: `Your payout of ₹${amount} failed due to bank/technical issue.`,
                type: "payout"
            });
        }

        return {
            message: 'Data fetched successfully',
            status,
            success: true
        };
    } catch (error) {
        throw {
            status: error.status || 500,
            message: `Failed to check payout status: ${error.message}`
        }
    }
}