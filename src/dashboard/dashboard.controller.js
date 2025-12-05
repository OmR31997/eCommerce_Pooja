import { GetAccountManagerDashboard, GetAdminDashboard, GetOrderManagerDashboard, GetProductManagerDashboard, GetStaffManagerDashboard, GetSuperAdminDashboard, GetUserManagerDashboard, GetVendorDashboard_ById, GetVendorManagerDashboard } from './dashboard.service.js';

export const super_admin_dashboard = async (req, res) => {
    const { year, yearType, page = 1 } = req.query;

    const filter = {
        selectedYear: parseInt(year) || new Date().getFullYear(),
        range: yearType || 'full',
        page: parseInt(page) || undefined,
    }

    const { status, error, errors, success, message, data } = await GetSuperAdminDashboard(filter);

    if (!success) {
        return res.status(status).json({ errors, error, message, })
    }

    return res.status(status).json({
        message,
        data: data,
        success,
    });
}

export const admin_dashboard = async (req, res) => {
    const { year, yearType, page = 1 } = req.query;

    const filter = {
        selectedYear: parseInt(year) || new Date().getFullYear(),
        range: yearType || 'full',
        page: parseInt(page) || undefined,
    }

    const { status, error, errors, success, message, data } = await GetAdminDashboard(filter)

    if (!success) {
        return res.status(status).json({ errors, error, message, })
    }

    return res.status(status).json({
        message,
        data: data,
        success,
    });
}

export const vendor_dashboard = async (req, res) => {
    const vendorId = req.user.id;

    const { year, yearType, page = 1 } = req.query;

    const filter = {
        selectedYear: parseInt(year) || new Date().getFullYear(),
        range: yearType || 'full',
        page: parseInt(page) || undefined,
    }

    const { status, error, errors, success, message, data } = await GetVendorDashboard_ById(vendorId, filter);

    if (!success) {
        return res.status(status).json({ errors, error, message, })
    }

    return res.status(status).json({
        message,
        data: data,
        success,
    });
}

export const staff_manager_dashboard = async (req, res) => {

    const { status, error, errors, success, message, data } = await GetStaffManagerDashboard();

    if (!success) {
        return res.status(status).json({ errors, error, message, })
    }

    return res.status(status).json({
        message,
        data: data,
        success,
    });
}

export const vendor_manager_dashboard = async (req, res) => {

    const { status, error, errors, success, message, data } = await GetVendorManagerDashboard();

    if (!success) {
        return res.status(status).json({ errors, error, message, })
    }

    return res.status(status).json({
        message,
        data: data,
        success,
    });
}

export const user_manager_dashboard = async (req, res) => {

    const { status, error, errors, success, message, data } = await GetUserManagerDashboard();

    if (!success) {
        return res.status(status).json({ errors, error, message, })
    }

    return res.status(status).json({
        message,
        data: data,
        success,
    });
}

export const product_manager_dashboard = async (req, res) => {

    const { status, error, errors, success, message, data } = await GetProductManagerDashboard();

    if (!success) {
        return res.status(status).json({ errors, error, message, })
    }

    return res.status(status).json({
        message,
        data: data,
        success,
    });
}

export const order_manager_dashboard = async (req, res) => {

    const { status, error, errors, success, message, data } = await GetOrderManagerDashboard();

    if (!success) {
        return res.status(status).json({ errors, error, message, })
    }

    return res.status(status).json({
        message,
        data: data,
        success,
    });
}

export const account_manager_dashboard = async (req, res) => {

    const { status, error, errors, success, message, data } = await GetAccountManagerDashboard();

    if (!success) {
        return res.status(status).json({ errors, error, message, })
    }

    return res.status(status).json({
        message,
        data: data,
        success,
    });
}