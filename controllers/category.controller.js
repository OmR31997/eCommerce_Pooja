import { Category } from '../models/category.model.js';
import { ValidateFileSize, ValidateImageFileType } from '../utils/fileHelper.js';
import { ToSaveCloudStorage } from '../services/cloudUpload.service.js';
/* **create_product_category logic here** */
export const create_product_category = async (req, res) => {
    try {
        const { name, slug } = req.body;

        const file = req.file;

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

        const categoryData = {
            ...req.body,
            slug: generateSlug,
        };

        console.log(file)
        if (file) {
            if (!ValidateImageFileType(file.mimetype)) {
                DeleteLocalFile(file.path);
                return res.status(400).json({
                    error: 'Invalid file type. Only images allowed.',
                    success: false,
                });
            }

            if (!ValidateFileSize(file.size, 1)) {
                DeleteLocalFile(file.path);
                return res.status(400).json({
                    error: 'File size exceeds 2MB limit',
                    success: false,
                });
            }

            const categoryFileName = `${generateSlug.substring(0, 3).toUpperCase()}_${file.filename}`;

            const secured_url = process.env.NODE_ENV !== 'development'
                ? await ToSaveCloudStorage(file.path, 'eCommerce/Categories', categoryFileName)
                : `/public/uploads/${categoryFileName}`;

            categoryData.imageUrl = secured_url;
        }

        const responseCategory = await Category.create(categoryData);

        return res.status(201).json({
            message: 'Category created successfully',
            data: responseCategory._doc,
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