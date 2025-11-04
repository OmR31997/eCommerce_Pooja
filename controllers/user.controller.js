import { User } from '../models/user.model.js';
import bcrypt from 'bcryptjs'

/* **update_profile logic here** */
export const update_profile = async (req, res) => {
    try {
        const { password } = req.body;

        const user = await User.findById(req.user.id);

        if(!user) {
            return res.status(404).json({
                error: 'User not found',
                success: false,
            });
        }

        const validPassword = bcrypt.compare(password, user.password);

        if(!validPassword) {
            return res.status(400).json({
                error: 'Password mistmatched',
                success: false,
            });
        }

        await user.save();
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}