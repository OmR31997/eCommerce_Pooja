import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import { Vendor } from "../models/vendor.model.js";
import { DeleteLocalFile, ErrorHandle, ValidateFileSize, ValidateImageFileType } from "../utils/fileHelper.js";
import { ToSaveCloudStorage } from "./cloudUpload.service.js";

export const UploadProduct = async (files, sku, vendorId) => {
    const sessionFiles = [];
    let productImages = [];
    const errors = [];

    for (const file of files) {
        const { originalname, mimetype, size, path: filePath } = file;
        if (!ValidateImageFileType(mimetype)) {
            errors.push(`Invalid file type: ${mimetype} with this file ${originalname}. Only jpeg, png, webp, jpg allowed.`);
        }

        if (!ValidateFileSize(size, 1)) {
            errors.push(`Each file should be less than 1MB - ${originalname} file is too large`)
        }

        sessionFiles.push(filePath);
    }

    if (errors.length > 0) {

        sessionFiles.forEach(file => {
            DeleteLocalFile(file);
        });

        return { status: 400, errors, success: false };
    }

    for (const file of files) {
        const { path: filePath, filename } = file;

        const productFileName = `${sku.substring(0, 3).toUpperCase()}_${filename}`;

        if (process.env.NODE_ENV !== 'development') {
            const { secure_url } = await ToSaveCloudStorage(filePath, `eCommerce/${vendorId}/images`, productFileName);

            productImages.push(secure_url); //For DB
        }
        else {
            productImages = [...sessionFiles];  //For Local
        }
    }

    return productImages;
}

export const UpdateImages = async (files, sku, currentImagePath, vendorId) => {
    return '/public/xyz';
}

export const CreateProduct = async (productData, others) => {
    try {
        const { categoryId, vendorId, user, files } = others;

        if (categoryId) {
            const found = await Category.findById(categoryId).lean();

            if (!found) {
                return {
                    status: 400,
                    error: `Category not found for '${categoryId}'`,
                    success: false,
                }
            }

            productData.categoryId = categoryId;
        }

        if (vendorId) {
            if (user.role == 'vendor' && user.id !== vendorId) {
                return {
                    status: 409,
                    error: `Unauthorized 'vendorId'`,
                    success: false,
                };
            }

            const found = await Vendor.findById(vendorId).lean();

            if (!found) {
                return {
                    status: 400,
                    error: `Vendor not found for '${vendorId}'`,
                    success: false,
                };
            }

            productData.vendorId = vendorId;
        }
        else {
            productData.vendorId = user.id;
        }

        if (files && files.length > 0) {
            const productImages = await UploadProduct(files, productData.sku, vendorId);

            productData.images = productImages;
        }
        const response = await Product.create(productData);

        return { status: 201, message: 'Product created successfully', data: response, success: true };

    } catch (error) {
        console.log(error.message)
        const handle = await ErrorHandle(error, 'Create Product');
        return handle;
    }
}

export const UpdateProduct = async (productData, others) => {
    try {
        const { key, files, user } = others;

        let product = undefined;

        if (key.startsWith('SKU')) {
            product = await Product.findOne({ sku: key })

            if (!product) {
                return { status: 404, error: `Data not found for sku: '${key}'` }
            }
        }
        else {
            product = await Product.findById(key)

            if (!product) {
                return { status: 404, error: `Data not found for productId: '${key}'` }
            }
        }

        if (user.role === 'vendor' && product.vendorId.toString() !== user.id) {
            return {
                status: 403,
                error: 'You are not authorized to modify this product.',
                success: false,
            };
        }

        if (files && files.length > 0) {
            const productImages = await UpdateImages(files, product.sku, product.images, product.vendorId);
            productData.images = productImages;
        }
        console.log(productData)
        const response = await Product.findByIdAndUpdate(product._id, productData);

        return { status: 200, message: `Product updated successfully`, data: productData };

    } catch (error) {
        console.log(error.message)
        const handle = await ErrorHandle(error, 'UpdateProduct');
        return handle;
    }
}