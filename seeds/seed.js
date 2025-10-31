import { config } from 'dotenv';
import path from 'path';
import { DB_Connect, DB_Disconnect } from '../config/db.config.js';
import { Admin } from "../models/admin.model.js";
import { User } from "../models/user.model.js";
import bcrypt from 'bcryptjs';

config({path: path.resolve(process.cwd(), '../.env')});

const seedDatabase = async () => {
  try {
    console.log(process.env.DB_URI);
    DB_Connect(process.env.DB_URI);
    const existAdmin = await User.findOne({ role: "admin" });

    if (!existAdmin || existAdmin.length === 0) {
      const userData = {
        name: 'admin',
        email: process.env.ADMIN_EMAIL,
        phone: '9009828489',
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
        role: process.env.ROLE,
        isVerified: true,
        status: 'active',
      }

      const responseUser = await User.create(userData);

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
        message: 'Admin seeded successfully',
        email: responseUser.email,
        phone: responseUser.phone,
        // AdminID: responseAdmin._id
      });

      DB_Disconnect();
    }
  } catch (error) {
    console.log('Error seeding database', error)
  }
}

seedDatabase();