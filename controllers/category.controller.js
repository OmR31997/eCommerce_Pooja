import { Category } from '../models/category.model.js';

/* **create_product_category logic here** */
export const create_product_category = async (req, res) => {
    try {
        const { name, slug } = req.body;

        if (!name) {
            return res.status(400).json({
                error: `'name' field must be required`,
                success: false,
            })
        }

        const generateSlug = slug
            ? slug.toLowerCase().replace(/\s+/g, '-')
            : name.toLowerCase().replace(/\s+/g, '-');

        const existCategory = await Category.findOne({ slug: generateSlug });

        if (existCategory) {
            return res.status(400).json({
                error: 'Category with this name or slug already exist',
                success: false,
            });
        }

        const response = await Category.create({
            ...req.body,
            slug: generateSlug,
        });

        return res.status(201).json({
            message: 'Category created successfully',
            data: response._doc,
            success: true,
        })
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = {};

            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message
            });

            return res.status(400).json({
                errors,
                message: 'Validation failed',
                success: false,
            });
        }

        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

/* **view_categories logic here** */
export const view_categories = async (req, res) => {
    try {

        const categories = await Category.find({ status: 'active' });

        if (categories.length === 0) {
            return res.status(404).json({
                error: 'Category not found',
                success: false,
            });
        }

        return res.status(200).json({
            data: categories,
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