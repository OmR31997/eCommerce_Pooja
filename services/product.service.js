import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import { ErrorHandle } from "../utils/fileHelper.js";

export const CreateProduct = async (productData) => {
    try {

        productData.sku = `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const response = await Product.create(productData);

        return { status: 201, message: 'Product created successfully', data: response, success: true };
        
    } catch (error) {
        const handled = await ErrorHandle(error, 'CreateStaff');
        return handled || { status: 500, success: false, error: 'Internal Server Error' };
    }
}