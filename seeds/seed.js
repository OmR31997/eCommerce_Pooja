import { config } from 'dotenv';
import path from 'path';
import { DB_Connect, DB_Disconnect } from '../config/db.config.js';
import { Admin } from "../models/admin.model.js";
import bcrypt from 'bcryptjs';
import { Permission } from '../models/permission.model.js';
import { Staff } from '../models/staff.model.js';
import { Role } from '../models/staff.model.js';

const permissionsSeed = async () => {
  const permission = await Permission.countDocuments();

  if (permission === 0) {
    const permissions = [
      {
        name: 'super_admin',
        module: ['Admin', 'Staff', 'Vendor', 'User', 'Category', 'Product', 'Cart', 'Order', 'Discount'],
        description: 'Globally access for CRUD operations including admin.',
        actions: { isCreate: true, isRead: true, isUpdate: true, isDelete: true, isApproved: true },
      },
      {
        name: 'admin',
        module: ['Staff', 'Vendor', 'User', 'Category', 'Product', 'Cart', 'Order', 'Discount'],
        description: 'Globally access for CRUD operations.',
        actions: { isCreate: true, isRead: true, isUpdate: true, isDelete: true, isApproved: true },
      },
      {
        name: 'manage_products',
        module: ['Product'],
        description: 'Can read, update, delete products.',
        actions: { isRead: true, isUpdate: true, isApproved: true },
      },
      {
        name: 'manage_orders',
        module: ['Order'],
        description: 'Can view and update orders',
        actions: { idCreate: true, isRead: true, isUpdate: true, isApproved: true },
      },
      {
        name: 'manage_users',
        module: ['User'],
        description: 'Can read, and update customer accounts',
        actions: { idCreate: true, isRead: true, isUpdate: true, isApproved: true },
      },
      {
        name: 'manage_staffs',
        module: ['Staff'],
        description: 'Can read, and update staff accounts',
        actions: { idCreate: true, isRead: true, isUpdate: true, isApproved: true },
      },
    ];

    await Permission.insertMany(permissions, { ordered: false });
    console.log('Permissions seeded successfully!');
  }
}

const rolesSeed = async () => {
  const allPermission = await Permission.countDocuments();

  if (allPermission === 0) {

    const superAdmin = {
      name: 'super_admin',
      permissions: allPermission.map(p => p._id),
      description: 'Full Access To All Modules',
    }

    const admin = {
      name: 'admin',
      permissions: allPermission
        .filter(p => p.module.includes('Product') || p.module.includes('Order'))
        .map(p => p._id),
      description: 'Can manage product and orders'
    }

    const staff = {
      name: 'staff',
      permissions: allPermission
        .filter(p => p.module.includes('Order'))
        .map(p => p._id),
      description: 'Can manage orders only.',
    }

    for (const role of [superAdmin, admin, staff]) {
      const exists = await Role.findOne({ name: role.name });
      if (!exists) await Role.create(role);
    }

    console.log("Roles seeded successfully.");
  }

  console.log('⚠️ Roles already exists.');
}

const adminSeed = async () => {

  const existingSuper = await Admin.findOne({ email: process.env.SUPER_ADMIN_EMAIL });
  if (!existingSuper) {

    const SuperAdminRoleId = await Role.findOne({ name: 'super_admin' });
    const SuperAdminPermissons = await Permission.findOne({ name: 'super_admin' });

    const hashedPassword_SuperAdmin = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 10);

    await Admin.create({
      name: 'Super-Admin',
      email: process.env.SUPER_ADMIN_EMAIL,
      password: hashedPassword_SuperAdmin,
      role: SuperAdminRoleId,
      permissions: SuperAdminPermissons
    })

    console.log('Super Admin created successfully!');
  } else {
    console.log('⚠️ Super Admin already exists.');
  }

  const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });

  if (!existingAdmin) {

    const AdminRoleId = await Role.findOne({ name: 'admin' });
    const AdminPermissons = await Permission.findOne({ name: 'admin' });

    const hashedPassword_Admin = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    await Admin.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword_Admin,
      role: AdminRoleId,
      permissions: AdminPermissons,
    })

    console.log('Admin created successfully!');
  } else {
    console.log('⚠️ Admin already exists.');
  }
}

export const seedDatabase = async (isManual = false) => {
  try {
    if (isManual) {
      DB_Connect(process.env.DB_URI, 'DB-Connected for manual seeding...');
    }

    await permissionsSeed();
    await rolesSeed();
    await adminSeed();

  } catch (error) {
    console.log('Error seeding database', error)
  }
  finally {
    if (isManual) {
      DB_Disconnect('DB-Disconnected after manual seeding');
      process.exit(0);
    }
  }
}

if (process.argv[1].includes('seed.js')) {
  config();
  // config({path: path.resolve(process.cwd(), '../.env')}); //Usefull when we want to run with the current path
  seedDatabase(true);
}