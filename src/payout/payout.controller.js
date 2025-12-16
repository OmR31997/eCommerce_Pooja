import { CheckPayoutStatus, CreateVendorPayout } from './payout.service.js';

// ADMIN → INITIATE VENDOR PAYOUT
export const initiate_vendor_payout = async (req, res, next) => {
    try {
        const { vendorId, amount } = req.body;

        if (!vendorId || !amount) {
            throw {
                status: 400,
                message: `'vendorId' and 'amount' are required`
            }
        }

        const response = await CreateVendorPayout(vendorId, amount);

        return res.status(201).json(response);

    } catch (error) {
        next(error);
    }
}

export const get_payout_status = async (req, res, next) => {
    try {
        const { payoutId, vendorId, amount } = req.body;

        if (!payoutId || !vendorId || !amount) {
            throw {
                status: 400,
                message: `'payoutId', 'vendorId', and 'amount' are required`
            }
        }

        const response = await CheckPayoutStatus(payoutId, vendorId, amount);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}