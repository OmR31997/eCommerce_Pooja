import { User } from '../models/user.model.js';
import bcrypt from 'bcryptjs'

/* **update_profile logic here** */
export const update_profile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password, currentPassword, status, role, isVerified, ...rest } = req.body;

        const errors = [];

        if (status) errors.push(`Please do not include 'status' field`);
        if (role) errors.push(`Please do not include 'role' field`);
        if (isVerified) errors.push(`Please do not include 'isVerified' field`);

        if(errors.length > 0) {
            return res.status(400).json({
                errors,
                success: false,
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                success: false,
            });
        }

        if (password) {
            if(!currentPassword) {
                return res.status(400).json({
                    error: 'Current password required to set a new password',
                    success: false,
                });
            }

            const validPassword = bcrypt.compare(currentPassword, user.password);

            if (!validPassword) {
                return res.status(400).json({
                    error: 'Password mistmatched',
                    success: false,
                });
            }

            user.password = await bcrypt.hash(password, 10);
        }

        Object.keys(rest).forEach((key) => {
            user[key] = rest[key];
        });

        const updatedUser = await user.save();

        return res.status(200).json({
            message: 'User updated successfully',
            data: updatedUser._doc,
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

export const update_user_status = async (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}