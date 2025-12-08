import { config } from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { DB_Connect, DB_Disconnect } from '../config/db.config.js';
import { Admin } from "../src/admin/admin.model.js";
import { Permission } from '../src/permission/permission.model.js';
import { Role } from '../src/role/role.model.js';
import { Vendor } from '../src/vendor/vendor.model.js';
import mongoose from 'mongoose';
import { insertDummyCustomers, insertDummyVendors, insertDummyProducts, insertDummyCategories, insertDummySubCTG, insertDummyOrders } from "./dummy.js";

// (4)
const staffsSeed = async () => {
  const staffs = [
    {
      name: 'Avinash',
      email: 'avinash.support@gmail.com',   //Can manage products
      password: await bcrypt.hash('Avi@123', 10),
      phone: '9753804000',
      roles: new mongoose.Types.ObjectId('6916b554e224a33fa097003e'),
      permission: [new mongoose.Types.ObjectId('6916b553e224a33fa097002c')],
      isActive: true,
    },
    {
      name: 'Vijay Kumar',
      email: 'vijay.support@gmail.com',   //can manage orders
      password: await bcrypt.hash('Vijay@123', 10),
      phone: '9753804001',
      roles: new mongoose.Types.ObjectId('6916b554e224a33fa097003e'),
      permission: [new mongoose.Types.ObjectId('6916b553e224a33fa097002d')],
      isActive: true,
    },
    {
      name: 'Amitesh Kumar',
      email: 'amitesh.support@gmail.com',   //can manage users
      password: await bcrypt.hash('Avinash@123', 10),
      phone: '9753804002',
      roles: new mongoose.Types.ObjectId('6916b554e224a33fa097003e'),
      permission: [new mongoose.Types.ObjectId('6916b553e224a33fa097002e')],
      isActive: true,
    },
    {
      name: 'Anjalee Sharma',
      email: 'anjalee.support@gmail.com',   //Can manage staffs
      password: await bcrypt.hash('Anjali@123', 10),
      phone: '9753804003',
      roles: new mongoose.Types.ObjectId('6916b554e224a33fa097003e'),
      permission: [new mongoose.Types.ObjectId('6916b553e224a33fa097002f')],
      isActive: true,
    },
    {
      name: 'Ramesh Sharma',
      email: 'ramesh.support@gmail.com',   //Can manage support/staff
      password: await bcrypt.hash('Ramesh@123', 10),
      phone: '9753804004',
      roles: new mongoose.Types.ObjectId('6916b554e224a33fa097003e'),
      permission: [new mongoose.Types.ObjectId('6916b553e224a33fa097002f')],
      isActive: true,
    },
    {
      name: 'Divya',
      email: 'divya.support@gmail.com',   //Can manage accounts
      password: await bcrypt.hash('Divya@123', 10),
      phone: '9753804005',
      roles: new mongoose.Types.ObjectId('6916b554e224a33fa097003e'),
      permission: [new mongoose.Types.ObjectId('6916b553e224a33fa097002f')],
      isActive: true,
    }
  ]

  for (const user of staffs) {
    await Vendor.create(user);
  }

  console.log('Staffs seeded successfully!');
}

// (3)
const rolesSeed = async () => {
  const permissions = await Permission.find();
  const roles = await Role.countDocuments();

  if (roles === 0) {
    const superAdmin = {
      name: 'super_admin',
      permissions: permissions.filter(p => p.name === 'super_admin').map(perm => perm._id),
      description: 'Full Access To All Modules',
    }

    const admin = {
      name: 'admin',
      permissions: permissions.filter(p => p.name === 'admin').map(perm => perm._id),
      description: 'Can manage everything'
    }

    const staff = {
      name: 'staff',
      permissions: permissions.filter(p => p.name === 'staff').map(perm => perm._id),
      description: 'Can manage orders only.',
    }

    const vendor = {
      name: 'vendor',
      description: 'Can manage own profile, products, orders only.',
      permissions: permissions.filter(p => p.name === 'vendor').map(perm => perm._id)
    }

    const user = {
      name: 'user',
      description: 'Regular customer role.',
      permissions: permissions.filter(p => p.name === 'user').map(perm => perm.id),
    }

    for (const role of [superAdmin, admin, staff, vendor, user]) {
      const exists = await Role.findOne({ name: role.name });
      if (!exists) await Role.create(role);
    }

    console.log("Roles seeded successfully.");
  }
  else
    console.log('⚠️ Roles already exists.');
}

// (2)
const permissionsSeed = async () => {
  const permission = await Permission.countDocuments();

  if (permission === 0) {
    const permissions = [
      {
        name: 'super_admin',
        modules: [
          'Admin', 'Staff', 'Vendor', 'User',
          'Permission', 'Role', 'Category',
          'Product', 'Cart', 'Order',
          'Discount', 'Account', 'Payment', 'Backup'],
        description: 'Globally access for CRUD operations including admin.',
        actions: { create: true, read: true, update: true, delete: true, approve: true, backup: true },
      },
      {
        name: 'admin',
        modules: [
          'Admin', 'Staff', 'Vendor', 'User',
          'Permission', 'Role', 'Category',
          'Product', 'Cart', 'Order',
          'Discount', 'Account', 'Payment', 'Backup'],
        description: 'Globally access for CRUD operations.',
        actions: { create: true, read: true, update: true, delete: true, approve: true, backup: false },
      },
      {
        name: 'staff_manager',
        modules: ['Staff'],
        description: 'Can read, and update staff accounts',
        actions: { create: true, read: true, update: true, delete: false, approve: true },
      },
      {
        name: 'vendor_manager',
        modules: ['Vendor'],
        description: 'Can manage (CRUD) vendor accounts.',
        actions: { create: true, read: true, update: true, delete: true, approve: true },
      },
      {
        name: 'user_manager',
        modules: ['User'],
        description: 'Can manage (CRUD) customer accounts',
        actions: { create: true, read: true, update: true, delete: true, approve: true },
      },
      {
        name: 'product_manager',
        modules: ['Product'],
        description: 'Can manage (CRUD) products.',
        actions: { create: true, read: true, update: true, approve: true },
      },
      {
        name: 'order_manager',
        modules: ['Order'],
        description: 'Can (CRUD) orders',
        actions: { create: true, read: true, update: true, delete: false, approve: true },
      },
      {
        name: 'account_manager',
        modules: ['Account'],
        description: 'Can mange account',
        actions: { create: true, read: true, update: true, delete: false, approve: true },
      },
      {
        name: 'user',
        modules: ['User', 'Order', 'Cart', 'Payment'],
        description: 'Can read, and update staff accounts',
        actions: { create: true, read: true, update: true, delete: true, approve: true },
      },
      {
        name: 'vendor',
        modules: ['Vendor', 'Product', 'Order', 'Cart', 'Discount'],
        description: 'Can read, and update staff accounts',
        actions: { create: true, read: true, update: true, delete: true, approve: true },
      },
    ];

    await Permission.insertMany(permissions, { ordered: false });
    console.log('Permissions seeded successfully!');
  }
}

// (1)
const adminSeed = async () => {

  const existingSuper = await Admin.findOne({ email: process.env.SUPER_ADMIN_EMAIL });
  if (!existingSuper) {

    const role = await Role.findOne({ name: 'super_admin' });
    const permission = await Permission.findOne({ name: 'super_admin' });

    const hashedPassword_SuperAdmin = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 10);

    await Admin.create({
      name: process.env.SUPER_ADMIN_NAME,
      email: process.env.SUPER_ADMIN_EMAIL,
      password: hashedPassword_SuperAdmin,
      role: role._id,
      permission: permission._id,
    })

    console.log('Super Admin created successfully!');
  } else {
    console.log('⚠️ Super Admin already exists.');
  }

  const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });

  if (!existingAdmin) {

    const role_1 = await Role.findOne({ name: 'admin' });
    const perm_1 = await Permission.findOne({ name: 'admin' });

    const hashedPassword_Admin = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    await Admin.create({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword_Admin,
      role: role_1,
      permission: perm_1,
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

    // await permissionsSeed();
    // await rolesSeed();
    // await adminSeed();
    // await insertDummyCategories();
    // await insertDummySubCTG();
    // await insertDummyProducts();
    // await insertDummyVendors();
    // await insertDummyCustomers();
    // await insertDummyOrders();

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