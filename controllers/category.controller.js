import { Category } from '../models/category.model.js';
import { DeleteLocalFile, ValidateFileSize, ValidateImageFileType } from '../utils/fileHelper.js';
import { ToDeleteFromCloudStorage, ToSaveCloudStorage } from '../services/cloudUpload.service.js';

/* **create_product_category logic here** */
export const create_product_category = async (req, res) => {
    try {
        const { name, slug, description } = req.body;

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
            name,
            description,
            slug: generateSlug,
        };

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

            if (process.env.NODE_ENV !== 'development') {
                const { secure_url } = await ToSaveCloudStorage(file.path, 'eCommerce/Categories', categoryFileName);
                categoryData.imageUrl = secure_url;
            }
            else {
                categoryData.imageUrl = file.path;
            }
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

/* **update_category logic here** */
export const update_category = async (req, res) => {
    const { slug, ...rest } = req.body;
    const file = req.file;

    const categoryId = req.params.id;

    const categoryData = { ...rest };

    if (slug) {
        categoryData.slug = slug.toLowerCase().replace(/\s+/g, '-');
    }

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

        if (process.env.NODE_ENV !== 'development') {
            const { secure_url } = await ToSaveCloudStorage(file.path, 'eCommerce/Categories', categoryFileName);
            categoryData.imageUrl = secure_url;
        }
        else {
            categoryData.imageUrl = file.path;
        }
    }

    if (Object.keys(req.body).length === 0 && !file) {
        return res.status(400).json({
            error: 'No field found for update',
            success: false,
        });
    }

    const category = await Category.findByIdAndUpdate(categoryId, categoryData, { new: true });

    if (!category) {
        return res.status(404).json({
            error: `Category not found for ID: '${categoryId}'`,
            success: true,
        });
    }

    return res.status(200).json({
        message: 'Category updated successdully',
        data: category,
        success: true
    });
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

/* **view_category_byId logic here** */
export const view_category_byId = async (req, res) => {
    try {
        const categoryId = req.params.id;

        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(400).json({
                error: `Category not found for ID: '${categoryId}'`,
                success: false,
            });
        }

        return res.status(200).json({
            data: category,
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

/* **view_category_bySlug logic here** */
export const view_category_bySlug = async (req, res) => {
    try {
        const categorySlug = req.params.slug;

        const category = await Category.findOne({ slug: categorySlug });

        if (!category) {
            return res.status(400).json({
                error: `Category not found for slug: '${categorySlug}'`,
                success: false,
            });
        }

        return res.status(200).json({
            data: category,
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

/* **remove_category logic here** */
export const remove_category = async (req, res) => {
    try {
        const categoryId = req.params.id;

        const category = await Category.findOneAndDelete(categoryId);

        if (!category) {
            return res.status(404).json({
                error: `Category not found for ID: '${categoryId}'`,
                success: false,
            });
        }

        if (process.env.NODE_ENV !== 'development')
            await ToDeleteFromCloudStorage('eCommerce/Categories', category.imageUrl);
        else
            DeleteLocalFile(category.imageUrl);

        return res.status(200).json({
            message: 'Category deleted successfully',
            data: category,
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

/* **clear_category logic here** */
export const clear_Category = async (req, res) => {
    try {
        const categories = await Category.find();

        if (categories.length === 0) {
            return res.status(404).json({
                error: 'No categories found to delete',
                success: false,
            });
        }

        const result = await Category.deleteMany({});

        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: 'No categories found to delete',
                success: false,
            });
        }

        for (const category of categories) {
            if (process.env.NODE_ENV !== 'development')
                await ToDeleteFromCloudStorage('eCommerce/Categories', category.imageUrl);
            else
                DeleteLocalFile(category.imageUrl);
        }

        return res.status(200).json({
            message: `All categories cleared successfully (${result.deletedCount} deleted)`,
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