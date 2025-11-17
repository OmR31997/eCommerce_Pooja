
import { getAdminOverview, getVendorOverview } from "../services/dashboard.service.js";

export const adminDashboard = async (req, res) => {
    const { year, yearType, page = 1 } = req.query;

    const filter = {
        selectedYear: parseInt(year) || new Date().getFullYear(),
        range: yearType || 'full',
        page: parseInt(page) || undefined,
    }

    const { status, error, errors, success, message, data } = await getAdminOverview(filter)

    if (!success) {
        return res.status(status).json({ errors, error, message, })
    }

    return res.status(status).json({
        message,
        data: data,
        success,
    });
}

export const vendorDashboard = async (req, res) => {
    const vendorId = req.user.id;

    const { year, yearType, page = 1 } = req.query;

    const filter = {
        selectedYear: parseInt(year) || new Date().getFullYear(),
        range: yearType || 'full',
        page: parseInt(page) || undefined,
    }

    const { status, error, errors, success, message, data } = await getVendorOverview(vendorId, filter);

    if (!success) {
        return res.status(status).json({ errors, error, message, })
    }

    return res.status(status).json({
        message,
        data: data,
        success,
    });
}

