import { config } from 'dotenv';
import path from 'path';
import { DB_Connect, DB_Disconnect } from '../config/db.config.js';
import { Admin } from "../models/admin.model.js";
import bcrypt from 'bcryptjs';
import { Permission } from '../models/permission.model.js';
import { Staff } from '../models/staff.model.js';
import { Role } from '../models/staff.model.js';
import { User } from '../models/user.model.js';
import { Vendor } from '../models/vendor.model.js';

const additionalUser = async () => {
  const users = [
    {
      name: 'Amar Singh',
      email: 'amar@gmail.com',
      phone: '9000000123',
      password: await bcrypt.hash('Amar@123', 10),
      permissions: ['69175dae4f4955165e9e2184'],
      address: 'India',
      otp: '123'
    },
    {
      name: 'Bhanu Singh',
      email: 'bhanu@gmail.com',
      phone: '9000000456',
      password: await bcrypt.hash('Bhanu@123', 10),
      permissions: ['69175dae4f4955165e9e2184'],
      address: 'India',
      otp: '12443'
    },
    {
      name: 'Catherine',
      email: 'cathe@gmail.com',
      phone: '9000000147',
      password: await bcrypt.hash('Cathe@123', 10),
      permissions: ['69175dae4f4955165e9e2184'],
      address: 'India',
      otp: '123'
    },
    {
      name: 'Anjalee',
      email: 'anjalee@gmail.com',
      phone: '9000000741',
      password: await bcrypt.hash('Anjalee@123', 10),
      permissions: ['69175dae4f4955165e9e2184'],
      address: 'India',
      otp: '123454'
    },
    {
      name: 'Ganesh',
      email: 'ganesh@gmail.com',
      phone: '9000004444',
      password: await bcrypt.hash('Ganesh@123', 10),
      permissions: ['69175dae4f4955165e9e2184'],
      address: 'India',
      otp: '1234441'
    }
  ]

  for (const user of users) {
    await User.create(user);
  }

  console.log('User seeded successfully!');
}

const additionalVendor = async () => {
  const users = [
    {
      userId: '6917631b583cd5a1e3f6edd3',
      type: 'FM55SS',
      businessName: 'AMAR SERVICE LTD',
      businessEmail: 'amar@gmail.com',
      businessDescription: 'Automobile Services',
      phone: '90009454545',
      password: await bcrypt.hash('Amar@123', 10),
      gstNumber: 'GST4478787878',
      bankDetails: {
        accountNumber: '222011078956999',
        ifsc: 'SBI0000004898',
        bankName: 'State Bank of India',
      },
      address: 'India',
      otp: '123'
    },
    {
      userId: '6917631b583cd5a1e3f6edd3',
      type: 'FM55SS',
      businessName: 'VIJAY SERVICE LTD',
      businessEmail: 'vijay@gmail.com',
      businessDescription: 'EV Services',
      phone: '90009454445',
      password: await bcrypt.hash('Vijay@123', 10),
      gstNumber: 'GST4478787878',
      bankDetails: {
        accountNumber: '2220110789574185',
        ifsc: 'SBI0000004870',
        bankName: 'State Bank of India',
      },
      address: 'India',
      otp: '124'
    },
    {
      userId: '6917631b583cd5a1e3f6edd3',
      type: 'FM55SS',
      businessName: 'KRISHNA SERVICE LTD',
      businessEmail: 'krishna@gmail.com',
      businessDescription: 'Mobile Services',
      phone: '90009454564',
      password: await bcrypt.hash('Krishna@123', 10),
      gstNumber: 'GST4478787878',
      bankDetails: {
        accountNumber: '222011078954555',
        ifsc: 'SBI0000005047',
        bankName: 'State Bank of India',
      },
      address: 'India',
      otp: '123'
    },
    {
      userId: '6917631b583cd5a1e3f6edd3',
      type: 'FM55SS',
      businessName: 'JWELERY SERVICE LTD',
      businessEmail: 'ankush@gmail.com',
      businessDescription: 'Jwelery',
      phone: '90009445466',
      password: await bcrypt.hash('Ankush@123', 10),
      gstNumber: 'GST4478787878',
      bankDetails: {
        accountNumber: '222011078957899',
        ifsc: 'SBI0000009544',
        bankName: 'State Bank of India',
      },
      address: 'India',
      otp: '1444'
    },
    {
      userId: '6917631b583cd5a1e3f6edd3',
      type: 'FM55SS',
      businessName: 'NAMRTA SERVICE LTD',
      businessEmail: 'namrta@gmail.com',
      businessDescription: 'EV Services',
      phone: '900094545454',
      password: await bcrypt.hash('NAMRTA@123', 10),
      gstNumber: 'GST4478787878',
      bankDetails: {
        accountNumber: '2220110789544',
        ifsc: 'SBI0000004898',
        bankName: 'State Bank of India',
      },
      address: 'India',
      otp: '123'
    }
  ]

  for (const user of users) {
    await Vendor.create(user);
  }

  console.log('User seeded successfully!');
}

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
      {
        name: 'user',
        module: ['Product', 'Order', 'Cart', 'Payment'],
        description: 'Can read, and update staff accounts',
        actions: { idCreate: true, isRead: true, isUpdate: true, isApproved: true },
      },
      {
        name: 'vendor',
        module: ['Product', 'Order', 'Cart'],
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
      description: 'Can manage everything'
    }

    const staff = {
      name: 'staff',
      permissions: allPermission
        .filter(p => p.module.includes('Order'))
        .map(p => p._id),
      description: 'Can manage orders only.',
    }

    const vendor = {
      name: 'vendor',
      description: 'Can manage own profile, products, orders only.',
      permissions: allPermission
        .filter(p =>
          ['Vendor', 'Product', 'Order'].includes(p.module)
        )
        .map(p => p._id)
    }

    const customer = {
      name: 'user',
      description: 'Regular customer role.',
      permissions: allPermission
        .filter(p =>
          ['User', 'Product', 'Cart', 'Order'].includes(p.module)
        )
        .map(p => p._id)
    }

    for (const role of [superAdmin, admin, staff, vendor, customer]) {
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
    // await additionalUser();
    // await additionalVendor();

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