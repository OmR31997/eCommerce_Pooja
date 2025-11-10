import { config } from 'dotenv';
import path from 'path';
import { DB_Connect, DB_Disconnect } from '../config/db.config.js';
import { Admin } from "../models/admin.model.js";
import { User } from "../models/user.model.js";
import bcrypt from 'bcryptjs';

export const seedDatabase = async (isManual = false) => {
  try {

    if (isManual) {
      DB_Connect(process.env.DB_URI, 'DB-Connected for manual seeding...');
    }

    const existAdmin = await User.findOne({ role: "admin" });

    if (!existAdmin || existAdmin.length === 0) {
      const adminRecord = new User({
        name: 'admin',
        email: process.env.ADMIN_EMAIL,
        phone: '9009828489',
        password: bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
        role: process.env.ROLE,
        isVerified: true,
        status: 'active',
      });

      adminRecord.allowAdminSeed = true;

      const responseUser = await adminRecord.save();

      const responseAdmin = await Admin.create({
        userId: responseUser._id,
        permission: {
          manageUsers: true,
          manageVendors: true,
          manageProducts: true,
          manageOrders: true,
          manageCategories: true
        }
      });

      console.log({
        message: 'Seeding completed successfully',
        email: responseUser.email,
        phone: responseUser.phone,
        adminId: responseAdmin._id,
        // AdminID: responseAdmin._id
      });

    }
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

if(process.argv[1].includes('seed.js')) {
  config();
  // config({path: path.resolve(process.cwd(), '../.env')}); //Usefull when we want to run with the current path
  seedDatabase(true);
}