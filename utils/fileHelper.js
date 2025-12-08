import { ENV } from '../config/env.config.js';
import fs from 'fs/promises';

export const ValidateFiles_H = async (files, allowedTypes, {maxSizeMB = null, maxSizeKB = null}) => {
    
    // Determine maxBytes based on provided options
    let maxBytes = null;
    let readableLimit = null;

    if(maxSizeKB !== null) {
        maxBytes = 1024 * maxSizeKB;
        readableLimit = `${maxSizeKB} KB`;
    }
    else if(maxSizeMB !== null) {
        maxBytes = 1024 * 1024 * maxSizeMB;
        readableLimit = `${maxSizeMB} MB`;
    }
    else {
        maxBytes = 1024 * 1024; //Default 1 MB
        readableLimit = `1 MB`;
    }

    if(!files || files.length === 0) return true;

    const sessionPaths = [];

    try {
        for(const file of files) {

            // Track for cleanup (DEV time)
            if(file.path) {
                sessionPaths.push(file.path);
            }

            // Validate mimtype
            if(!allowedTypes.includes(file.mimetype)) {
                throw {
                    status: 415,
                    message: `Invalid file type for '${file.originalname}'`
                };
            }

            // Validate size
            if(file.size > maxBytes) {
                throw {
                    status: 413,
                    message: `File '${file.originalname}' exceeds ${readableLimit} limit`
                };
            }
        }

        return true;
    } catch (error) {
        if(ENV.IS_DEV) {
            await Promise.all(sessionPaths.map(path => DeleteLocalFile_H(path)))
        }

        throw error;
    }
}

export const DeleteLocalFile_H = async (filePath) => {
    try {
        await fs.access(filePath);
        await fs.unlink(filePath);
    } catch (error) {
        if (error.code === "ENOENT") {
            // File doesn't exist → ignore safely
            return;
        }
        throw new Error(`Error deleting file: ${error.message}`);
    }
}

// export const ToDeleteLocalFilesParallel_H = async (files) => {
//     if (!files || !Array.isArray(files)) return;

//     return Promise.all(files.map(file => file?.secure_url ? DeleteLocalFile(file.secure_url) : null))
// }


// export const ValidateImages = async (images, maxSizeMB = 2) => {
//     return ValidateFiles(images, ["image/jpeg", "image/png", "image/webp", "image/jpg"], maxSizeMB)
// }



// export const BuildProductQuery = (filter) => {
//     try {
//         const query = {};

//         // To search via text
//         if (filter.search) {
//             query.$or = [
//                 { name: { $regex: filter.search, $options: "i" } },
//                 { description: { $regex: filter.search, $options: "i" } },
//             ];
//         }

//         // Category filtering
//         if (filter.categoryIds) {
//             query.categoryId = {
//                 $in: Array.isArray(filter.categoryIds)
//                     ? filter.categoryIds
//                     : typeof filter.categoryIds === 'object'
//                         ? Object.values(filter.categoryIds)
//                         : typeof filter.categoryIds === 'string'
//                             ? filter.categoryIds.split(',').map(w => w.trim()).filter(Boolean)
//                             : []
//             };
//         }

//         // Vendor filter
//         if (filter.vendorIds) {
//             query.vendorId = {
//                 $in: Array.isArray(filter.vendorIds)
//                     ? filter.vendorIds
//                     : typeof filter.vendorIds === 'object'
//                         ? Object.values(filter.vendorIds)
//                         : typeof filter.vendorIds === 'string'
//                             ? filter.vendorIds.split(',').map(w => w.trim()).filter(Boolean)
//                             : []
//             };;
//         }

//         // Price range (min-max) //example:  100-500
//         if (filter.priceRange) {
//             const [min, max] = filter.priceRange.split('-').map(Number);
//             query.price = { $gte: min, $lte: max };
//         }

//         if (filter.rating !== undefined) {
//             query['rating.average'] = { $gte: filter.rating };
//         }

//         if (filter.discount !== undefined) {
//             query.discount = { $gte: filter.discount };
//         }

//         // Status filter
//         if (filter.status) query.status = filter.status;
//         if (filter.stockStatus) {
//             switch (filter.stockStatus) {
//                 case 'in_stock':
//                     query.stock = { $gt: 0 };
//                     break;
//                 case 'low_stock':
//                     query.stock = { $gt: 0, $lt: 5 };
//                     break;
//                 case 'out_of_stock':
//                     query.stock = { $lte: 0 };
//                     break;
//             }
//         }

//         //  STOCK >= filter.stock.$gte
//         if (filter.stock && filter.stock.$gte !== undefined) {
//             query.stock = { $gte: filter.stock.$gte }
//         }

//         return query;
//     } catch (error) {
//         throw new Error(`Error building product query: ${error.message}`);
//     }
// }

// export const BuildVendorQuery = (filter) => {
//     try {

//         const query = {};

//         if (filter.search) {
//             query.$or = [
//                 { businessName: { $regex: filter.search, $options: "i" } },
//                 { description: { $regex: filter.search, $options: "i" } },
//                 { businessEmail: { $regex: filter.search, $options: "i" } },
//             ];
//         }

//         if (filter.address) {
//             query.address = filter.address;
//         }

//         if (filter.joinRange) {
            // const start = new Date(filter.joinRange[0])
            // const end = new Date(filter.joinRange[1])

            // start.setHours(0, 0, 0, 0);
            // end.setHours(23, 59, 59, 999);

            // query.createdAt = {
            //     $gte: start,
            //     $lte: end,
            // }
//         }

//         if (filter.updatedRange) {
//             query.updatedAt = {
//                 $gte: new Date(filter.updatedRange[0]),
//                 $lte: new Date(filter.updatedRange[1]),
//             }
//         }

//         return query;
//     } catch (error) {
//         throw new Error(`Error building product query: ${error.message}`);
//     }
// }

// export const BuildUserQuery = (filter) => {
//     try {

//         const query = {};

//         if (filter.search) {
//             query.$or = [
//                 { name: { $regex: filter.search, $options: "i" } },
//                 { description: { $regex: filter.search, $options: "i" } },
//                 { email: { $regex: filter.search, $options: "i" } },
//                 { phone: { $regex: filter.search, $options: "i" } },
//                 { address: { $regex: filter.search, $options: "i" } },
//             ];
//         }

//         if (filter.segment) {
//             query.segment = filter.segment;
//         }

//         if (filter.joinRange) {
//             query.createdAt = {
//                 $gte: new Date(filter.joinRange[0]),
//                 $lte: new Date(filter.joinRange[1]),
//             }
//         }

//         if (filter.joinRange) {

//             const start = new Date(filter.joinRange[0])
//             const end = new Date(filter.joinRange[1])

//             start.setHours(0, 0, 0, 0);
//             end.setHours(23, 59, 59, 999);

//             query.createdAt = {
//                 $gte: start,
//                 $lte: end,
//             }
//         }

//         if (filter.updatedRange) {
//             query.updatedRange = {
//                 $gte: new Date(filter.updatedRange[0]),
//                 $lte: new Date(filter.updatedRange[1]),
//             }
//         }

//         return query;
//     } catch (error) {
//         throw new Error(`Error building product query: ${error.message}`);
//     }
// }