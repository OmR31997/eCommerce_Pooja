import { GetAccountManagerDashboard, GetAdminDashboard, GetOrderManagerDashboard, GetProductManagerDashboard, GetStaffManagerDashboard, GetSuperAdminDashboard, GetUserManagerDashboard, GetVendorDashboard_ById, GetVendorManagerDashboard } from './dashboard.service.js';

export const super_admin_dashboard = async (req, res, next) => {
    try {
        const { year, yearType, page = 1 } = req.query;

        const filter = {
            selectedYear: parseInt(year) || new Date().getFullYear(),
            range: yearType || 'full',
            page: parseInt(page) || undefined,
        }

        const response = await GetSuperAdminDashboard(filter);

        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

export const admin_dashboard = async (req, res, next) => {

    try {
        const { year, yearType, page = 1 } = req.query;

        const filter = {
            selectedYear: parseInt(year) || new Date().getFullYear(),
            range: yearType || 'full',
            page: parseInt(page) || undefined,
        }

        const response = await GetAdminDashboard(filter)

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const vendor_dashboard = async (req, res, next) => {

    try {
        const vendorId = req.user.id;

        const { year, yearType, page = 1 } = req.query;

        const filter = {
            selectedYear: parseInt(year) || new Date().getFullYear(),
            range: yearType || 'full',
            page: parseInt(page) || undefined,
        }

        const response = await GetVendorDashboard_ById(vendorId, filter);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const staff_manager_dashboard = async (req, res, next) => {

    try {
        const response = await GetStaffManagerDashboard();

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const vendor_manager_dashboard = async (req, res, next) => {

    try {
        const response = await GetVendorManagerDashboard();

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const user_manager_dashboard = async (req, res, next) => {

    try {
        const response = await GetUserManagerDashboard();

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const product_manager_dashboard = async (req, res, next) => {

    try {
        const response = await GetProductManagerDashboard();

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const order_manager_dashboard = async (req, res, next) => {

    try {
        const response = await GetOrderManagerDashboard();

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}

export const account_manager_dashboard = async (req, res) => {

    try {
        const response = await GetAccountManagerDashboard();

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}