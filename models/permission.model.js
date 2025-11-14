import mongoose from "mongoose";

const ActionSchema = new mongoose.Schema({
  isCreate: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false },
  isUpdate: { type: Boolean, default: false },
  isDelete: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
}, { _id: false });

const PermissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `'name' field must be required (e.g., 'manage_products', 'manage_users')`],
    unique: true,
    trim: true,
  },
  module: {
    type: [String],
    enum: ['Staff', 'Vendor', 'User', 'Category', 'Product', 'Cart', 'Order', 'Discount', 'Admin'],
    required: [true, `'module' field must be required (e.g., 'Product', 'Order', etc)`],
  },
  description: {
    type: String,
    default: '',
  },
  actions: {
    type: ActionSchema,
    default: {
      isCreate: false,
      isRead: true,
      isUpdate: false,
      isDelete: false,
      isApproved: false,
    },
  },
}, { timestamps: true });

export const Permission = mongoose.model("Permission", PermissionSchema);