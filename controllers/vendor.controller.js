import { Product } from '../models/product.model.js';
import { User } from '../models/user.model.js';
import { Vendor } from '../models/vendor.model.js';
import { Order } from '../models/order.model.js';
import { generateOtp, verifyOtp } from '../services/otp.service.js';
import { ToDeleteFromCloudStorage, ToSaveCloudStorage } from '../services/cloudUpload.service.js';
import { DeleteLocalFile, Pagination, ValidateFileSize, ValidateImageFileType, } from '../utils/fileHelper.js';

/* **vendor_signup logic here** */
export const vendor_signup = async (req, res) => {
    try {
        const { businessEmail, bankDetails } = req.body;

        const errors = [];

        if (!businessEmail) {
            errors.push(`'businessEmail' field must be required`);
        }

        if (!bankDetails) {
            errors.push(`'bankDetails' must be required`);
        }

        if (errors.length > 0) {
            return res.status(400).json({
                errors,
                message: 'Validation failed',
                success: false,
            })
        }

        const otpKey = businessEmail;
        const { otp, message, otpExpiresAt } = generateOtp(otpKey);

        console.log({
            otp,
            message,
            otpExpiresAt,
        })

        const query = [];

        if (businessEmail) {
            query.push({ businessEmail });
        }

        if (bankDetails?.accountNumber) {
            query.push({ "bankDetails.accountNumber": bankDetails.accountNumber });
        }

        const existVendor = query.length ? await Vendor.findOne({ $or: query }) : null;

        if (existVendor) {
            return res.status(409).json({
                error: `Vendor already registered with this 'businessEmail' or 'bankDetails.accountNumber'`,
                success: false
            });
        }

        return res.status(200).json({
            message: 'OTP has been sent successfully',
            warning: 'OTP expires in 5 minutes',
            data: { ...req.body },
            otpExpiresAt,
        });

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
            })
        }

        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        })
    }
}

/* **confirm_otp logic here** */
export const confirm_otp = async (req, res) => {
    try {
        const { otp, shopName, businessEmail, ...rest } = req.body;
        const file = req.file;
        const { id, role } = req.user;

        if (rest?.id && rest.id !== id) {
            return res.status(403).json({
                error: 'ID mismatch — unauthorized action',
                success: false,
            });
        }

        const errors = [];

        if (!otp) {
            errors.push(`'otp' field must be required`);
        }

        if (!businessEmail) {
            errors.push(`'businessEmail' field must be required`);
        }

        if (errors.length > 0) {
            return res.status(400).json({
                errors,
                message: 'Validation failed',
                success: false,
            })
        }

        const verification = verifyOtp(businessEmail, otp);

        if (!verification.valid) {
            return res.status(400).json({
                error: verification.reason,
                success: false,
            });
        }

        const vendorData = {
            ...req.body,
            userId: id,
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

            if (process.env.NODE_ENV !== 'development') {
                const { secure_url } = await ToSaveCloudStorage(file.path, 'eCommerce/${vendorId}/LogoUrls', filename);
                vendorData.logoUrl = secure_url;
            }
            else {
                vendorData.logoUrl = file.path;
            }
        }

        const responseVendor = await Vendor.create(vendorData);

        const responseUser = await User.findByIdAndUpdate(id, { $set: { role: 'vendor' } }, { new: true });;

        return res.status(201).json({
            responseVendor,
            responseUser
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

/* **get_vendor_dashboard logic here** */
export const get_dashboard = async (req, res) => {
    try {
        const vendorId = req.user.id;

        const totalProducts = await Product.countDocuments({ vendorId });
        const totalOrders = await Order.countDocuments({ vendorId });

        const revenue = await Order.aggregate([
            { $match: { vendorId } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
        ]);

        return res.status(200).json({
            data: {
                totalProducts,
                totalOrders,
                totalRevenue: revenue[0]?.totalRevenue || 0,
            },
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

/* **get_vendors logic here** */
export const get_vendors = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            offset = 0,
            status = 'approved',
            sortBy = '-createdAt',
            order = '-1' } = req.query;

        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);

        // Build Query
        const query = {};

        // Handle Status
        if (status) query.status = status;

        // Count total records
        const total = await User.countDocuments(query);
        const { skip, nextUrl, prevUrl, totalPages, currentPage } = Pagination(
            parsedPage,
            parsedLimit,
            offset,
            total,
            status,
            `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`);

        const sortField = ['businessName', 'businessDescription', 'createdAt'].includes(sortBy) ? sortBy : 'createdAt';
        const sortOption = { [sortField]: Number(order) };

        const vendors = await Vendor.find(query)
            .skip(skip)
            .limit(parsedLimit)
            .sort(sortOption)
            .populate({ path: 'userId' })


        if (vendors.length === 0) {
            return res.status(404).json({
                error: 'Vendor not found',
                success: false,
            });
        }

        return res.status(200).json({
            message: 'Vendors fetched successfully.',
            data: vendors,
            pagination: {
                count: total,
                prevUrl,
                nextUrl,
                currentPage,
                totalPages,
                success: true,
            }
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}

/* **get_vendor_byId logic here** */
export const get_vendor_byId = async (req, res) => {
    try {
        const vendorId = req.params.id;
        const { role, id } = req.user;

        if (role === 'vendor' && vendorId !== id) {
            return res.status(400).json({
                error: 'You can access only own data',
                success: false,
            });
        }

        const vendor = await Vendor.findById(vendorId).populate({ path: 'userId' });

        if (!vendor) {
            return res.status(400).json({
                error: `Vendo not found for ID: '${vendorId}'`,
                success: false,
            });
        }

        return res.status(200).json({
            data: vendor,
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

/* **update_vendor_profile logic here** */
export const update_vendor_profile = async (req, res) => {
    try {
        const { id } = req.params;
        const vendor = await Vendor.findById(id);

        if (!vendor) {
            return res.status(404).json({
                error: 'Vendor not found',
                success: false,
            });
        }

        const { ...rest } = req.body;
        const files = req.files || {};

        // Handle logo upload
        const logoFile = files.logoUrl?.[0];
        if (logoFile) {
            if (!ValidateImageFileType(logoFile.mimetype)) {
                DeleteLocalFile(logoFile.path);
                return res.status(400).json({
                    error: 'Invalid file type. Only images allowed for logo.',
                    success: false,
                });
            }

            if (!ValidateFileSize(logoFile.size, 1)) {
                DeleteLocalFile(logoFile.path);
                return res.status(400).json({
                    error: 'File size exceeds 2MB limit',
                    success: false,
                });
            }

            const filename = `${Date.now()}-${logoFile.originalname}`;

            // Upload Image Into The Local/Cloud Storage
            if (process.env.NODE_ENV !== 'development') {
                const { secure_url } = await ToSaveCloudStorage(
                    logoFile.path,
                    'eCommerce/Vendors/LogoUrls',
                    filename
                );
                rest.logoUrl = secure_url;
            } else {
                rest.logoUrl = logoFile.path;
            }

            // Delete Old file from the Local/Cloud Storage
            if (vendor.logoUrl) {
                if (process.env.NODE_ENV !== 'development')
                    await ToDeleteFromCloudStorage(
                        'eCommerce/Vendors/LogoUrls',
                        vendor.logoUrl
                    );
                else DeleteLocalFile(vendor.logoUrl);
            }
        }

        // Handle documents upload
        const documents = files.documents || [];
        if (documents.length > 0) {
            rest.documents = [];

            for (const doc of documents) {
                if (!ValidateFileSize(doc.size, 5)) {
                    DeleteLocalFile(doc.path);
                    return res.status(400).json({
                        error: `Document "${doc.originalname}" exceeds 5MB limit`,
                        success: false,
                    });
                }

                const docName = `${Date.now()}-${doc.originalname}`;

                // Upload Image Into The Local/Cloud Storage
                if (process.env.NODE_ENV !== 'development') {
                    const { secure_url } = await ToSaveCloudStorage(
                        doc.path,
                        'eCommerce/Vendors/Documents',
                        docName
                    );
                    rest.documents.push(secure_url);
                } else {
                    rest.documents.push(doc.path);
                }
            }

            // Delete Old file from the Local/Cloud Storage
            if (vendor.documents?.length) {
                for (const oldDoc of vendor.documents) {
                    if (process.env.NODE_ENV !== 'development')
                        await ToDeleteFromCloudStorage(
                            'eCommerce/Vendors/Documents',
                            oldDoc
                        );
                    else DeleteLocalFile(oldDoc);
                }
            }
        }

        // Apply updating into the db.collection
        const updatedVendor = await Vendor.findByIdAndUpdate(
            id,
            { $set: rest },
            { new: true }
        );

        return res.status(200).json({
            message: 'Vendor profile updated successfully',
            data: updatedVendor,
            success: true,
        });
    } catch (error) {
        console.error('Error updating vendor profile:', error);
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
};

/* **remove_vendor_profile logic here** */
export const remove_vendor_profile = async (req, res) => {
    try {
        const vendorId = req.params.id;

        const vendor = await Vendor.findById(vendorId);

        if (!vendor) {
            return res.status(404).json({
                error: 'Vendor not found',
                success: false,
            });
        }

        // Delete Logo (if exists)
        if (vendor.logoUrl) {
            try {
                if (process.env.NODE_ENV !== 'development') {
                    await ToDeleteFromCloudStorage('eCommerce/Vendors/LogoUrls', vendor.logoUrl);
                } else {
                    DeleteLocalFile(vendor.logoUrl);
                }
            } catch (error) {
                console.warn(`Failed to delete logo for vendor ${id}:`, error.message);
            }
        }

        // Delete Documents (if exists)
        if (vendor.documents?.length) {
            for (const docPath of vendor.documents) {
                try {
                    if (process.env.NODE_ENV !== 'development') {
                        await ToDeleteFromCloudStorage('eCommerce/Vendors/Documents', docPath);
                    } else {
                        DeleteLocalFile(docPath);
                    }
                } catch (error) {
                    console.warn(`Failed to delete document ${docPath}:`, error.message);
                }
            }
        }

        // Delete Vendor Record
        const deletedVendor = await Vendor.findByIdAndDelete(id);

        await User.findByIdAndUpdate(deletedVendor.userId, { role: 'user' });

        return res.status(200).json({
            message: 'Vendor deleted successfully',
            data: deletedVendor,
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
export const clear_vendors = async (req, res) => {
    try {
        const vendors = await Vendor.find();

        if (vendors.length === 0) {
            return res.status(404).json({
                error: 'No vendor found to delete',
                success: false,
            });
        }

        for (const vendor of vendors) {
            await Vendor.findByIdAndUpdate(vendor._id, { role: 'user' });
        }

        const result = await Vendor.deleteMany({});

        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: 'No vendors found to delete',
                success: false,
            });
        }

        return res.status(200).json({
            message: `All vendors cleared successfully (${result.deletedCount} deleted)`,
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

export const get_revenue_via_duration = async (req, res) => {

}

/* **search_vendors logic here** */
export const search_vendors = async (req, res) => {
  try {
    const {
      find,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = -1,
    } = req.query;

    if (!find || find.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Please provide a search query in '?find=' parameter."
      });
    }

    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    // Try Text Search First
    let query = { $text: { $search: find } };
    let projection = { score: { $meta: "textScore" } };
    let sortOption = { score: { $meta: "textScore" } };

    let total = await Vendor.countDocuments(query);
    let { skip, nextUrl, prevUrl, totalPages, currentPage } = Pagination(
      parsedPage,
      parsedLimit,
      0,
      total,
      null,
      `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}?find=${find}`
    );

    let vendors = await Vendor.find(query, projection)
      .skip(skip)
      .limit(parsedLimit)
      .sort(sortOption);

    // Fallback To Regex If Text Search Finds Nothing
    if (vendors.length === 0) {
      query = {
        $or: [
          { businessName: { $regex: find, $options: "i" } },
          { businessDescription: { $regex: find, $options: "i" } },
          { businessEmail: { $regex: find, $options: "i" } }
        ]
      };

      // Sorting for regex fallback
      const allowedSorts = ['businessName', 'businessEmail', 'createdAt'];
      const safeSortBy = allowedSorts.includes(sortBy) ? sortBy : 'createdAt';
      sortOption = { [safeSortBy]: parseInt(order) };

      total = await Vendor.countDocuments(query);
      const pagination = Pagination(
        parsedPage,
        parsedLimit,
        0,
        total,
        null,
        `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}?find=${find}`
      );

      vendors = await Vendor.find(query)
        .skip(pagination.skip)
        .limit(parsedLimit)
        .sort(sortOption);

      nextUrl = pagination.nextUrl;
      prevUrl = pagination.prevUrl;
      totalPages = pagination.totalPages;
      currentPage = pagination.currentPage;
    }

    if (!vendors.length) {
      return res.status(404).json({
        success: false,
        message: `No vendors found matching "${find}".`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Found ${vendors.length} matching vendors.`,
      data: vendors,
      pagination: {
        count: total,
        prevUrl,
        nextUrl,
        currentPage,
        totalPages
      }
    });

  } catch (error) {
    console.error('Error in search_vendor:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};