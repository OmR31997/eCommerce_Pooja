import mongoose from "mongoose";

const ActionSchema = new mongoose.Schema({
  create: { type: Boolean, default: false },
  read: { type: Boolean, default: false },
  update: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
  approve: { type: Boolean, default: false },
  backup: { type: Boolean, default: false },
}, { _id: false });

const PermissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `'name' field must be required (e.g., 'manage_products', 'manage_users')`],
    unique: true,
    trim: true,
    lowercase: true
  },
  modules: {
    type: [String],
    enum: [
      'Admin', 'Staff', 'Vendor', 'User', 'Permission', 
      'Role', 'Category', 'Product', 'Cart', 
      'Order', 'Discount', 'Account', 'Payment'
    ],
    required: [true, `'module' field must be required (e.g., 'Product', 'Order', etc)`],
    validate: [arr => arr.length > 0, "'modules' must have at least one module"]
  },
  description: {
    type: String,
    default: '',
  },
  actions: {
    type: ActionSchema,
    default: () => ({}),  // ensures ActionSchema defaults apply
  },
}, { timestamps: true });

export const Permission = mongoose.model("Permission", PermissionSchema);