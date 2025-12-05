import { CheckPayoutStatus, CreateVendorPayout } from './payout.service.js';

// ADMIN → INITIATE VENDOR PAYOUT
export const initiate_vendor_payout = async (req, res) => {
    try {
        const { vendorId, amount } = req.body;

        if (!vendorId || !amount) {
            throw {
                status: 400,
                message: `'vendorId' and 'amount' are required`
            }
        }

        const { status, message, payout, success } = await CreateVendorPayout(vendorId, amount);

        return res.status(status).json({ message, payout, success });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: error.message });
    }
}

export const get_payout_status = async (req, res) => {
    try {
        const { payoutId, vendorId, amount } = req.body;

        if (!payoutId || !vendorId || !amount) {
            throw {
                status: 400,
                message: `'payoutId', 'vendorId', and 'amount' are required`
            }
        }

        const { status, message, success } = await CheckPayoutStatus(payoutId, vendorId, amount);

        return res.status(200).json({ message, status, success });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: error.message });
    }
}