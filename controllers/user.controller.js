import { User } from '../models/user.model.js';

export const create_user = async (req, res) => {
    try {
        const response = await User.create(req.body);

        return res.status(201).json({
            message: 'New User Created Successfully',
            data: response,
            success: true
        });

    } catch (error) {
        if(error.name === 'ValidationError') {
            const errors = {};

            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });

            return res.status(400).json({
                errors,
                message: 'Validation failed',
                success: false, 
            });
        }
        
        return res.status(500).json({error: error, success: false})
    }
}