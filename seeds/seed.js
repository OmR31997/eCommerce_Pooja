import { config } from 'dotenv';
import path from 'path';
import { DB_Connect, DB_Disconnect } from '../config/db.config.js';
import { Admin } from "../src/admin/admin.model.js";
import bcrypt from 'bcryptjs';
import { Permission } from '../src/permission/permission.model.js';
import { Staff } from '../src/staff/staff.model.js';
import { Role } from '../src/role/role.model.js';
import { User } from '../src/customer/user.model.js';
import { Vendor } from '../src/vendor/vendor.model.js';
import { Category } from '../src/category/category.model.js';
import mongoose from 'mongoose';

const DummyCustomers = async () => {
  const users = [
    {
      name: 'Namrata Devi',
      email: 'namrata@gmail.com',
      phone: '9000456741',
      password: await bcrypt.hash('Namrata@123', 10),
      roles: [new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d5'), new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d2')],
      permission: new mongoose.Types.ObjectId('691dd33a4fd7b01e3952b99f'),
      address: 'India',
      otp: '123'
    },
    {
      name: 'Krishna Sigh',
      email: 'krishna@gmail.com',
      phone: '9000456742',
      password: await bcrypt.hash('Krishna@123', 10),
      roles: [new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d5'), new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d2')],
      permission: new mongoose.Types.ObjectId('691dd33a4fd7b01e3952b99f'),
      address: 'India',
      otp: '123'
    }, {
      name: 'Ankush Kumar',
      email: 'ankush@gmail.com',
      phone: '9000456743',
      password: await bcrypt.hash('Ankush@123', 10),
      roles: [new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d5'), new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d2')],
      permission: new mongoose.Types.ObjectId('691dd33a4fd7b01e3952b99f'),
      address: 'India',
      otp: '123'
    }, {
      name: 'Vijay Kumar Singh',
      email: 'vijay@gmail.com',
      phone: '9000456744',
      password: await bcrypt.hash('vijay@123', 10),
      roles: [new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d5'), new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d2')],
      permission: new mongoose.Types.ObjectId('691dd33a4fd7b01e3952b99f'),
      address: 'India',
      otp: '123'
    },
    {
      name: 'Amar Singh',
      email: 'amar@gmail.com',
      phone: '9000000123',
      password: await bcrypt.hash('Amar@123', 10),
      roles: [new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d5'), new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d2')],
      permission: new mongoose.Types.ObjectId('691dd33a4fd7b01e3952b99f'),
      address: 'India',
      otp: '123'
    },
    {
      name: 'Bhanu Singh',
      email: 'bhanu@gmail.com',
      phone: '9000000456',
      password: await bcrypt.hash('Bhanu@123', 10),
      roles: [new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d5'), new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d2')],
      permission: new mongoose.Types.ObjectId('691dd33a4fd7b01e3952b99f'),
      address: 'India',
      otp: '12443'
    },
    {
      name: 'Catherine',
      email: 'cathe@gmail.com',
      phone: '9000000147',
      password: await bcrypt.hash('Cathe@123', 10),
      roles: [new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d5'), new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d2')],
      permission: new mongoose.Types.ObjectId('691dd33a4fd7b01e3952b99f'),
      address: 'India',
      otp: '123'
    },
    {
      name: 'Anjalee',
      email: 'anjalee@gmail.com',
      phone: '9000000741',
      password: await bcrypt.hash('Anjalee@123', 10),
      roles: [new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d5'), new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d2')],
      permission: new mongoose.Types.ObjectId('691dd33a4fd7b01e3952b99f'),
      address: 'India',
      otp: '123454'
    },
    {
      name: 'Ganesh',
      email: 'ganesh@gmail.com',
      phone: '9000004444',
      password: await bcrypt.hash('Ganesh@123', 10),
      roles: [new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d5'), new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d2')],
      permission: new mongoose.Types.ObjectId('691dd33a4fd7b01e3952b99f'),
      address: 'India',
      otp: '1234441'
    },
    {
      name: 'Suresh Kumar',
      email: 'suresh.kumar@example.com',
      phone: '9876543210',
      password: await bcrypt.hash('Suresh@123', 10),
      roles: [new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d5'), new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d2')],
      permission: new mongoose.Types.ObjectId('691dd33a4fd7b01e3952b99f'),
      address: 'Chennai, India',
      otp: '558231'
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '9123456780',
      password: await bcrypt.hash('Priya@123', 10),
      roles: [new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d5'), new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d2')],
      permission: new mongoose.Types.ObjectId('691dd33a4fd7b01e3952b99f'),
      address: 'Delhi, India',
      otp: '882199'
    },/*
    {
      name: 'Rohit Verma',
      email: 'rohit.verma@example.com',
      phone: '9001122334',
      password: await bcrypt.hash('Rohit@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Mumbai, India',
      otp: '441122'
    },
    {
      name: 'Aisha Khan',
      email: 'aisha.khan@example.com',
      phone: '9345678123',
      password: await bcrypt.hash('Aisha@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Bangalore, India',
      otp: '774455'
    },
    {
      name: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      phone: '9556677881',
      password: await bcrypt.hash('Vikram@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Hyderabad, India',
      otp: '903211'
    },
    {
      name: 'Neha Patel',
      email: 'neha.patel@example.com',
      phone: '9812345678',
      password: await bcrypt.hash('Neha@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Ahmedabad, India',
      otp: '334455'
    },
    {
      name: 'Arjun Mehta',
      email: 'arjun.mehta@example.com',
      phone: '9098765432',
      password: await bcrypt.hash('Arjun@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Pune, India',
      otp: '662211'
    },
    {
      name: 'Kavya Reddy',
      email: 'kavya.reddy@example.com',
      phone: '9301122456',
      password: await bcrypt.hash('Kavya@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Hyderabad, India',
      otp: '998877'
    },
    {
      name: 'Manoj Gupta',
      email: 'manoj.gupta@example.com',
      phone: '9988776655',
      password: await bcrypt.hash('Manoj@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Lucknow, India',
      otp: '110099'
    },
    {
      name: 'Sara Dsouza',
      email: 'sara.dsouza@example.com',
      phone: '9123004455',
      password: await bcrypt.hash('Sara@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Goa, India',
      otp: '556677'
    },
    {
      name: 'Karan Thakur',
      email: 'karan.thakur@example.com',
      phone: '9797554433',
      password: await bcrypt.hash('Karan@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Shimla, India',
      otp: '882244'
    },
    {
      name: 'Ritika Jain',
      email: 'ritika.jain@example.com',
      phone: '9011223344',
      password: await bcrypt.hash('Ritika@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Jaipur, India',
      otp: '221199'
    },
    {
      name: 'Farhan Ali',
      email: 'farhan.ali@example.com',
      phone: '9090332211',
      password: await bcrypt.hash('Farhan@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Kolkata, India',
      otp: '662255'
    },
    {
      name: 'Meera Joshi',
      email: 'meera.joshi@example.com',
      phone: '9322110099',
      password: await bcrypt.hash('Meera@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Bhopal, India',
      otp: '773311'
    },
    {
      name: 'Devansh Malhotra',
      email: 'devansh.malhotra@example.com',
      phone: '9888001122',
      password: await bcrypt.hash('Devansh@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Nagpur, India',
      otp: '445588'
    },
    {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      phone: '9000000001',
      password: await bcrypt.hash('Aarav@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Delhi, India',
      otp: '100001'
    },
    {
      name: 'Ishita Verma',
      email: 'ishita.verma@example.com',
      phone: '9000000002',
      password: await bcrypt.hash('Ishita@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Mumbai, India',
      otp: '100002'
    },
    {
      name: 'Kabir Nair',
      email: 'kabir.nair@example.com',
      phone: '9000000003',
      password: await bcrypt.hash('Kabir@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Kochi, India',
      otp: '100003'
    },
    {
      name: 'Rhea Menon',
      email: 'rhea.menon@example.com',
      phone: '9000000004',
      password: await bcrypt.hash('Rhea@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Trivandrum, India',
      otp: '100004'
    },
    {
      name: 'Dev Kapoor',
      email: 'dev.kapoor@example.com',
      phone: '9000000005',
      password: await bcrypt.hash('Dev@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Pune, India',
      otp: '100005'
    },
    {
      name: 'Maya Singh',
      email: 'maya.singh@example.com',
      phone: '9000000006',
      password: await bcrypt.hash('Maya@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Bangalore, India',
      otp: '100006'
    },
    {
      name: 'Arjun Reddy',
      email: 'arjun.reddy@example.com',
      phone: '9000000007',
      password: await bcrypt.hash('Arjun@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Hyderabad, India',
      otp: '100007'
    },
    {
      name: 'Sana Khan',
      email: 'sana.khan@example.com',
      phone: '9000000008',
      password: await bcrypt.hash('Sana@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Lucknow, India',
      otp: '100008'
    },
    {
      name: 'Vivaan Joshi',
      email: 'vivaan.joshi@example.com',
      phone: '9000000009',
      password: await bcrypt.hash('Vivaan@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Chandigarh, India',
      otp: '100009'
    },
    {
      name: 'Tara Bansal',
      email: 'tara.bansal@example.com',
      phone: '9000000010',
      password: await bcrypt.hash('Tara@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Surat, India',
      otp: '100010'
    },
    {
      name: 'Rohan Malhotra',
      email: 'rohan.malhotra@example.com',
      phone: '9000000011',
      password: await bcrypt.hash('Rohan@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Delhi, India',
      otp: '100011'
    },
    {
      name: 'Anika Desai',
      email: 'anika.desai@example.com',
      phone: '9000000012',
      password: await bcrypt.hash('Anika@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Vadodara, India',
      otp: '100012'
    },
    {
      name: 'Karan Patel',
      email: 'karan.patel@example.com',
      phone: '9000000013',
      password: await bcrypt.hash('Karan@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Rajkot, India',
      otp: '100013'
    },
    {
      name: 'Zoya Khan',
      email: 'zoya.khan@example.com',
      phone: '9000000014',
      password: await bcrypt.hash('Zoya@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Indore, India',
      otp: '100014'
    },
    {
      name: 'Nikhil Jain',
      email: 'nikhil.jain@example.com',
      phone: '9000000015',
      password: await bcrypt.hash('Nikhil@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Jaipur, India',
      otp: '100015'
    },
    {
      name: 'Aditi Chauhan',
      email: 'aditi.chauhan@example.com',
      phone: '9000000016',
      password: await bcrypt.hash('Aditi@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Udaipur, India',
      otp: '100016'
    },
    {
      name: 'Harsh Soni',
      email: 'harsh.soni@example.com',
      phone: '9000000017',
      password: await bcrypt.hash('Harsh@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Bhopal, India',
      otp: '100017'
    },
    {
      name: 'Meera Kapoor',
      email: 'meera.kapoor@example.com',
      phone: '9000000018',
      password: await bcrypt.hash('Meera@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Nagpur, India',
      otp: '100018'
    },
    {
      name: 'Irfan Syed',
      email: 'irfan.syed@example.com',
      phone: '9000000019',
      password: await bcrypt.hash('Irfan@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Aurangabad, India',
      otp: '100019'
    },
    {
      name: 'Shruti Jain',
      email: 'shruti.jain@example.com',
      phone: '9000000020',
      password: await bcrypt.hash('Shruti@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Gurgaon, India',
      otp: '100020'
    },
    {
      name: 'Aman Saxena',
      email: 'aman.saxena@example.com',
      phone: '9000000021',
      password: await bcrypt.hash('Aman@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Noida, India',
      otp: '100021'
    },
    {
      name: 'Pooja Yadav',
      email: 'pooja.yadav@example.com',
      phone: '9000000022',
      password: await bcrypt.hash('Pooja@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Kanpur, India',
      otp: '100022'
    },
    {
      name: 'Aditya Rao',
      email: 'aditya.rao@example.com',
      phone: '9000000023',
      password: await bcrypt.hash('Aditya@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Mangalore, India',
      otp: '100023'
    },
    {
      name: 'Simran Kaur',
      email: 'simran.kaur@example.com',
      phone: '9000000024',
      password: await bcrypt.hash('Simran@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Amritsar, India',
      otp: '100024'
    },
    {
      name: 'Yash Thakur',
      email: 'yash.thakur@example.com',
      phone: '9000000025',
      password: await bcrypt.hash('Yash@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Shimla, India',
      otp: '100025'
    },
    {
      name: 'Ananya Mishra',
      email: 'ananya.mishra@example.com',
      phone: '9000000026',
      password: await bcrypt.hash('Ananya@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Patna, India',
      otp: '100026'
    },
    {
      name: 'Rudra Singh',
      email: 'rudra.singh@example.com',
      phone: '9000000027',
      password: await bcrypt.hash('Rudra@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Varanasi, India',
      otp: '100027'
    },
    {
      name: 'Naina Arora',
      email: 'naina.arora@example.com',
      phone: '9000000028',
      password: await bcrypt.hash('Naina@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Agra, India',
      otp: '100028'
    },
    {
      name: 'Shaurya Malhotra',
      email: 'shaurya.malhotra@example.com',
      phone: '9000000029',
      password: await bcrypt.hash('Shaurya@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Delhi, India',
      otp: '100029'
    },
    {
      name: 'Radhika Deshmukh',
      email: 'radhika.deshmukh@example.com',
      phone: '9000000030',
      password: await bcrypt.hash('Radhika@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Nagpur, India',
      otp: '100030'
    },
    {
      name: 'Mohit Agarwal',
      email: 'mohit.agarwal@example.com',
      phone: '9000000031',
      password: await bcrypt.hash('Mohit@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Kolkata, India',
      otp: '100031'
    },
    {
      name: 'Ayesha Pathan',
      email: 'ayesha.pathan@example.com',
      phone: '9000000032',
      password: await bcrypt.hash('Ayesha@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Bangalore, India',
      otp: '100032'
    },
    {
      name: 'Danish Qureshi',
      email: 'danish.qureshi@example.com',
      phone: '9000000033',
      password: await bcrypt.hash('Danish@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Hyderabad, India',
      otp: '100033'
    },
    {
      name: 'Aarohi Joshi',
      email: 'aarohi.joshi@example.com',
      phone: '9000000034',
      password: await bcrypt.hash('Aarohi@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Pune, India',
      otp: '100034'
    },
    {
      name: 'Sarthak Goyal',
      email: 'sarthak.goyal@example.com',
      phone: '9000000035',
      password: await bcrypt.hash('Sarthak@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025'), new mongoose.Types.ObjectId('691daed889d44ea41c2b1021')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Gurgaon, India',
      otp: '100035'
    },
    {
      name: 'Lavanya Iyer',
      email: 'lavanya.iyer@example.com',
      phone: '9000000036',
      password: await bcrypt.hash('Lavanya@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Chennai, India',
      otp: '100036'
    },
    {
      name: 'Parth Shetty',
      email: 'parth.shetty@example.com',
      phone: '9000000037',
      password: await bcrypt.hash('Parth@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Mangalore, India',
      otp: '100037'
    },
    {
      name: 'Amina Ansari',
      email: 'amina.ansari@example.com',
      phone: '9000000038',
      password: await bcrypt.hash('Amina@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Mumbai, India',
      otp: '100038'
    },
    {
      name: 'Kushal Thapa',
      email: 'kushal.thapa@example.com',
      phone: '9000000039',
      password: await bcrypt.hash('Kushal@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Darjeeling, India',
      otp: '100039'
    },
    {
      name: 'Esha Kulkarni',
      email: 'esha.kulkarni@example.com',
      phone: '9000000040',
      password: await bcrypt.hash('Esha@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Pune, India',
      otp: '100040'
    },
    {
      name: 'Rehan Shaikh',
      email: 'rehan.shaikh@example.com',
      phone: '9000000041',
      password: await bcrypt.hash('Rehan@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Mumbai, India',
      otp: '100041'
    },
    {
      name: 'Ritika Bhatia',
      email: 'ritika.bhatia@example.com',
      phone: '9000000042',
      password: await bcrypt.hash('Ritika@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Delhi, India',
      otp: '100042'
    },
    {
      name: 'Vivaan Oberoi',
      email: 'vivaan.oberoi@example.com',
      phone: '9000000043',
      password: await bcrypt.hash('Vivaan@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Chandigarh, India',
      otp: '100043'
    },
    {
      name: 'Prisha Chopra',
      email: 'prisha.chopra@example.com',
      phone: '9000000044',
      password: await bcrypt.hash('Prisha@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Lucknow, India',
      otp: '100044'
    },
    {
      name: 'Arnav Gupta',
      email: 'arnav.gupta@example.com',
      phone: '9000000045',
      password: await bcrypt.hash('Arnav@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Gurgaon, India',
      otp: '100045'
    },
    {
      name: 'Mahima Soni',
      email: 'mahima.soni@example.com',
      phone: '9000000046',
      password: await bcrypt.hash('Mahima@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Indore, India',
      otp: '100046'
    },
    {
      name: 'Kabir Chawla',
      email: 'kabir.chawla@example.com',
      phone: '9000000047',
      password: await bcrypt.hash('Kabir@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Delhi, India',
      otp: '100047'
    },
    {
      name: 'Sahana Reddy',
      email: 'sahana.reddy@example.com',
      phone: '9000000048',
      password: await bcrypt.hash('Sahana@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Hyderabad, India',
      otp: '100048'
    },
    {
      name: 'Arvind Menon',
      email: 'arvind.menon@example.com',
      phone: '9000000049',
      password: await bcrypt.hash('Arvind@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Kochi, India',
      otp: '100049'
    },
    {
      name: 'Krisha Dave',
      email: 'krisha.dave@example.com',
      phone: '9000000050',
      password: await bcrypt.hash('Krisha@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Ahmedabad, India',
      otp: '100050'
    },
    {
      name: 'Manish Tiwari',
      email: 'manish.tiwari@example.com',
      phone: '9000000051',
      password: await bcrypt.hash('Manish@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Kanpur, India',
      otp: '100051'
    },
    {
      name: 'Divya Nair',
      email: 'divya.nair@example.com',
      phone: '9000000052',
      password: await bcrypt.hash('Divya@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Kochi, India',
      otp: '100052'
    },
    {
      name: 'Sarvesh Kumar',
      email: 'sarvesh.kumar@example.com',
      phone: '9000000053',
      password: await bcrypt.hash('Sarvesh@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Patna, India',
      otp: '100053'
    },
    {
      name: 'Myra Khanna',
      email: 'myra.khanna@example.com',
      phone: '9000000054',
      password: await bcrypt.hash('Myra@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Delhi, India',
      otp: '100054'
    },
    {
      name: 'Rishabh Kapoor',
      email: 'rishabh.kapoor@example.com',
      phone: '9000000055',
      password: await bcrypt.hash('Rishabh@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Noida, India',
      otp: '100055'
    },
    {
      name: 'Suhani Jain',
      email: 'suhani.jain@example.com',
      phone: '9000000056',
      password: await bcrypt.hash('Suhani@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Jaipur, India',
      otp: '100056'
    },
    {
      name: 'Kavish Sethi',
      email: 'kavish.sethi@example.com',
      phone: '9000000057',
      password: await bcrypt.hash('Kavish@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Bhopal, India',
      otp: '100057'
    },
    {
      name: 'Anushka Pillai',
      email: 'anushka.pillai@example.com',
      phone: '9000000058',
      password: await bcrypt.hash('Anushka@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Chennai, India',
      otp: '100058'
    },
    {
      name: 'Yuvraj Rathod',
      email: 'yuvraj.rathod@example.com',
      phone: '9000000059',
      password: await bcrypt.hash('Yuvraj@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Surat, India',
      otp: '100059'
    },
    {
      name: 'Sana Qureshi',
      email: 'sana.qureshi@example.com',
      phone: '9000000060',
      password: await bcrypt.hash('Sana@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Lucknow, India',
      otp: '100060'
    },
    {
      name: 'Aryan Bansal',
      email: 'aryan.bansal@example.com',
      phone: '9000000061',
      password: await bcrypt.hash('Aryan@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Agra, India',
      otp: '100061'
    },
    {
      name: 'Pihu Saxena',
      email: 'pihu.saxena@example.com',
      phone: '9000000062',
      password: await bcrypt.hash('Pihu@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Gurgaon, India',
      otp: '100062'
    },
    {
      name: 'Dev Mehta',
      email: 'dev.mehta@example.com',
      phone: '9000000063',
      password: await bcrypt.hash('Dev@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Ahmedabad, India',
      otp: '100063'
    },
    {
      name: 'Riya Pandey',
      email: 'riya.pandey@example.com',
      phone: '9000000064',
      password: await bcrypt.hash('Riya@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Kanpur, India',
      otp: '100064'
    },
    {
      name: 'Atharv Joshi',
      email: 'atharv.joshi@example.com',
      phone: '9000000065',
      password: await bcrypt.hash('Atharv@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Pune, India',
      otp: '100065'
    },
    {
      name: 'Jhanvi Kapoor',
      email: 'jhanvi.kapoor@example.com',
      phone: '9000000066',
      password: await bcrypt.hash('Jhanvi@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Mumbai, India',
      otp: '100066'
    },
    {
      name: 'Samar Chopra',
      email: 'samar.chopra@example.com',
      phone: '9000000067',
      password: await bcrypt.hash('Samar@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Delhi, India',
      otp: '100067'
    },
    {
      name: 'Trisha Menon',
      email: 'trisha.menon@example.com',
      phone: '9000000068',
      password: await bcrypt.hash('Trisha@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Chennai, India',
      otp: '100068'
    },
    {
      name: 'Zaid Khan',
      email: 'zaid.khan@example.com',
      phone: '9000000069',
      password: await bcrypt.hash('Zaid@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Hyderabad, India',
      otp: '100069'
    },
    {
      name: 'Mahira Ali',
      email: 'mahira.ali@example.com',
      phone: '9000000070',
      password: await bcrypt.hash('Mahira@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Lucknow, India',
      otp: '100070'
    },
    {
      name: 'Rudraksh Desai',
      email: 'rudraksh.desai@example.com',
      phone: '9000000071',
      password: await bcrypt.hash('Rudraksh@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Vadodara, India',
      otp: '100071'
    },
    {
      name: 'Shreya Shah',
      email: 'shreya.shah@example.com',
      phone: '9000000072',
      password: await bcrypt.hash('Shreya@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Surat, India',
      otp: '100072'
    },
    {
      name: 'Vivaan Bhatt',
      email: 'vivaan.bhatt@example.com',
      phone: '9000000073',
      password: await bcrypt.hash('Vivaan@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Gandhinagar, India',
      otp: '100073'
    },
    {
      name: 'Esha Raina',
      email: 'esha.raina@example.com',
      phone: '9000000074',
      password: await bcrypt.hash('Esha@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Jammu, India',
      otp: '100074'
    },
    {
      name: 'Reyansh Suri',
      email: 'reyansh.suri@example.com',
      phone: '9000000075',
      password: await bcrypt.hash('Reyansh@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Amritsar, India',
      otp: '100075'
    },
    {
      name: 'Aarohi Malhotra',
      email: 'aarohi.malhotra@example.com',
      phone: '9000000076',
      password: await bcrypt.hash('Aarohi@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Mumbai, India',
      otp: '100076'
    },
    {
      name: 'Kabir Ahuja',
      email: 'kabir.ahuja@example.com',
      phone: '9000000077',
      password: await bcrypt.hash('Kabir@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Delhi, India',
      otp: '100077'
    },
    {
      name: 'Tanya Sharma',
      email: 'tanya.sharma@example.com',
      phone: '9000000078',
      password: await bcrypt.hash('Tanya@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Pune, India',
      otp: '100078'
    },
    {
      name: 'Ayaan Qureshi',
      email: 'ayaan.qureshi@example.com',
      phone: '9000000079',
      password: await bcrypt.hash('Ayaan@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Hyderabad, India',
      otp: '100079'
    },
    {
      name: 'Kiara Dutta',
      email: 'kiara.dutta@example.com',
      phone: '9000000080',
      password: await bcrypt.hash('Kiara@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Bangalore, India',
      otp: '100080'
    },
    {
      name: 'Daksh Verma',
      email: 'daksh.verma@example.com',
      phone: '9000000081',
      password: await bcrypt.hash('Daksh@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Kanpur, India',
      otp: '100081'
    },
    {
      name: 'Nidhi Raj',
      email: 'nidhi.raj@example.com',
      phone: '9000000082',
      password: await bcrypt.hash('Nidhi@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Patna, India',
      otp: '100082'
    },
    {
      name: 'Shaurya Singh',
      email: 'shaurya.singh@example.com',
      phone: '9000000083',
      password: await bcrypt.hash('Shaurya@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Gurgaon, India',
      otp: '100083'
    },
    {
      name: 'Anvi Chawla',
      email: 'anvi.chawla@example.com',
      phone: '9000000084',
      password: await bcrypt.hash('Anvi@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Noida, India',
      otp: '100084'
    },
    {
      name: 'Aarush Mehra',
      email: 'aarush.mehra@example.com',
      phone: '9000000085',
      password: await bcrypt.hash('Aarush@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Jaipur, India',
      otp: '100085'
    },
    {
      name: 'Sara Syed',
      email: 'sara.syed@example.com',
      phone: '9000000086',
      password: await bcrypt.hash('Sara@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Lucknow, India',
      otp: '100086'
    },
    {
      name: 'Atharv Shah',
      email: 'atharv.shah@example.com',
      phone: '9000000087',
      password: await bcrypt.hash('Atharv@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Surat, India',
      otp: '100087'
    },
    {
      name: 'Jasleen Kaur',
      email: 'jasleen.kaur@example.com',
      phone: '9000000088',
      password: await bcrypt.hash('Jasleen@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Amritsar, India',
      otp: '100088'
    },
    {
      name: 'Arnav Das',
      email: 'arnav.das@example.com',
      phone: '9000000089',
      password: await bcrypt.hash('Arnav@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Kolkata, India',
      otp: '100089'
    },
    {
      name: 'Mahi Jain',
      email: 'mahi.jain@example.com',
      phone: '9000000090',
      password: await bcrypt.hash('Mahi@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Indore, India',
      otp: '100090'
    },
    {
      name: 'Aarav Raina',
      email: 'aarav.raina@example.com',
      phone: '9000000091',
      password: await bcrypt.hash('Aarav@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Jammu, India',
      otp: '100091'
    },
    {
      name: 'Reeva Kapoor',
      email: 'reeva.kapoor@example.com',
      phone: '9000000092',
      password: await bcrypt.hash('Reeva@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Mumbai, India',
      otp: '100092'
    },
    {
      name: 'Dev Garg',
      email: 'dev.garg@example.com',
      phone: '9000000093',
      password: await bcrypt.hash('DevGarg@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Delhi, India',
      otp: '100093'
    },
    {
      name: 'Nysa Bhandari',
      email: 'nysa.bhandari@example.com',
      phone: '9000000094',
      password: await bcrypt.hash('Nysa@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Chandigarh, India',
      otp: '100094'
    },
    {
      name: 'Vihaan Mathur',
      email: 'vihaan.mathur@example.com',
      phone: '9000000095',
      password: await bcrypt.hash('Vihaan@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Jaipur, India',
      otp: '100095'
    },
    {
      name: 'Amaira Khan',
      email: 'amaira.khan@example.com',
      phone: '9000000096',
      password: await bcrypt.hash('Amaira@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Lucknow, India',
      otp: '100096'
    },
    {
      name: 'Rehaan Ali',
      email: 'rehaan.ali@example.com',
      phone: '9000000097',
      password: await bcrypt.hash('Rehaan@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Hyderabad, India',
      otp: '100097'
    },
    {
      name: 'Tia Fernandes',
      email: 'tia.fernandes@example.com',
      phone: '9000000098',
      password: await bcrypt.hash('Tia@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Goa, India',
      otp: '100098'
    },
    {
      name: 'Yuvi Shekhawat',
      email: 'yuvi.shekhawat@example.com',
      phone: '9000000099',
      password: await bcrypt.hash('Yuvi@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Udaipur, India',
      otp: '100099'
    },
    {
      name: 'Maira Gill',
      email: 'maira.gill@example.com',
      phone: '9000000100',
      password: await bcrypt.hash('Maira@123', 10),
      roles: [new mongoose.Types.ObjectId('691daed889d44ea41c2b1025')],
      permissions: new mongoose.Types.ObjectId('691dae171e2ac4896d94e180'),
      address: 'Amritsar, India',
      otp: '100100'
    }*/
  ]

  for (const user of users) {
    await User.create(user);
  }

  console.log('User seeded successfully!');
}

const DummyVendors = async () => {
  const vendors = [
    {
      userId: new mongoose.Types.ObjectId('691dd8b3e87a28230a84d891'),
      type: 'VH001',
      businessName: 'AMAR SERVICE LTD',
      businessEmail: 'amar.vendor@gmail.com',
      businessDescription: 'Automobile Services',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
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
      userId: new mongoose.Types.ObjectId('691dd8b2e87a28230a84d88e'),
      type: 'EVH001',
      businessName: 'VIJAY SERVICE LTD',
      businessEmail: 'vijay.vendor@gmail.com',
      businessDescription: 'EV Services',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
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
      userId: new mongoose.Types.ObjectId('691dd8b0e87a28230a84d879'),
      type: 'MN001',
      businessName: 'KRISHNA SERVICE LTD',
      businessEmail: 'krishna.vendor@gmail.com',
      businessDescription: 'Mobile Services',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
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
      userId: new mongoose.Types.ObjectId('691dd8b2e87a28230a84d889'),
      type: 'JL001',
      businessName: 'JEWELLERY LTD',
      businessEmail: 'ankush.vendor@gmail.com',
      businessDescription: 'Jewellery',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
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
      userId: new mongoose.Types.ObjectId('691dd8abe87a28230a84d876'),
      type: 'ECT001',
      businessName: 'NAMRATA SERVICE LTD',
      businessEmail: 'namrata.vendor@gmail.com',
      businessDescription: 'Electronic Services',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '900094545454',
      password: await bcrypt.hash('Namrata@123', 10),
      gstNumber: 'GST4478787878',
      bankDetails: {
        accountNumber: '2220110789544',
        ifsc: 'SBI0000004898',
        bankName: 'State Bank of India',
      },
      address: 'India',
      otp: '123'
    }, /*
    {
      userId: new mongoose.Types.ObjectId('691db87a1c17b8fc3b8db2b0'),
      type: 'VH002',
      businessName: 'BHANU AUTO CARE',
      businessEmail: 'bhanu.vendor@gmail.com',
      businessDescription: 'Automobile Repair & Maintenance',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009454546',
      password: await bcrypt.hash('Bhanu@123', 10),
      gstNumber: 'GST9988776655',
      bankDetails: {
        accountNumber: '123401789563210',
        ifsc: 'HDFC0001456',
        bankName: 'HDFC Bank',
      },
      address: 'Pune, India',
      otp: '456'
    },
    {
      userId: new mongoose.Types.ObjectId('691db87b1c17b8fc3b8db2b2'),
      type: 'VH003',
      businessName: 'CATHERINE MOTORS',
      businessEmail: 'nexgen.vendor@gmail.com',
      businessDescription: 'Car Electrical Services',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009454547',
      password: await bcrypt.hash('Nexgen@123', 10),
      gstNumber: 'GST1122334455',
      bankDetails: {
        accountNumber: '998801234567890',
        ifsc: 'ICIC0000789',
        bankName: 'ICICI Bank',
      },
      address: 'Mumbai, India',
      otp: '789'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d4b19'),
      type: 'VH004',
      businessName: 'SPEEDPROMAX GARAGE',
      businessEmail: 'speedpromax.vendor@gmail.com',
      businessDescription: 'Two Wheeler Services',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009454548',
      password: await bcrypt.hash('Speedmax@123', 10),
      gstNumber: 'GST5566778899',
      bankDetails: {
        accountNumber: '567812349876543',
        ifsc: 'SBIN0002489',
        bankName: 'State Bank of India',
      },
      address: 'Delhi, India',
      otp: '321'
    },
    {
      userId: new mongoose.Types.ObjectId('691db87b1c17b8fc3b8db2b4'),
      type: 'VH005',
      businessName: 'SUPER METRO AUTO WORKS',
      businessEmail: 'supermetro.vendor@gmail.com',
      businessDescription: 'Vehicle Servicing & Polishing',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009454549',
      password: await bcrypt.hash('Metro@123', 10),
      gstNumber: 'GST7788990011',
      bankDetails: {
        accountNumber: '445566778899001',
        ifsc: 'PNB00005678',
        bankName: 'Punjab National Bank',
      },
      address: 'Bangalore, India',
      otp: '654'
    },
    {
      userId: new mongoose.Types.ObjectId('691db87b1c17b8fc3b8db2b6'),
      type: 'VH006',
      businessName: 'URBAN ALTRA AUTO HUB',
      businessEmail: 'urbanaltra.vendor@gmail.com',
      businessDescription: 'Bike & Car General Services',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009454550',
      password: await bcrypt.hash('Urban@123', 10),
      gstNumber: 'GST8899002211',
      bankDetails: {
        accountNumber: '778899001122334',
        ifsc: 'YESB0001234',
        bankName: 'YES Bank',
      },
      address: 'Hyderabad, India',
      otp: '987'
    },
    {
      userId: new mongoose.Types.ObjectId('691db87c1c17b8fc3b8db2ba'),
      type: 'VH002',
      businessName: 'VIKRAM AUTO CARE',
      businessEmail: 'vikram.autocare.vendor@gmail.com',
      businessDescription: 'Car Repair & Maintenance',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009000002',
      password: await bcrypt.hash('Vikram@102', 10),
      gstNumber: 'GST1000000002',
      bankDetails: {
        accountNumber: '111100000000002',
        ifsc: 'SBI0001002',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '102'
    },
    {
      userId: new mongoose.Types.ObjectId('691db87c1c17b8fc3b8db2bc'),
      type: 'VH003',
      businessName: 'NEXTGEN MOTORS',
      businessEmail: 'nextgen.motors.vendor@gmail.com',
      businessDescription: 'Automobile Electrical Services',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009000003',
      password: await bcrypt.hash('Vendor@103', 10),
      gstNumber: 'GST1000000003',
      bankDetails: {
        accountNumber: '111100000000003',
        ifsc: 'SBI0001003',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '103'
    },
    {
      userId: new mongoose.Types.ObjectId('691db87c1c17b8fc3b8db2c0'),
      type: 'VH004',
      businessName: 'SPEEDMAX GARAGE',
      businessEmail: 'speedmax.garage.vendor@gmail.com',
      businessDescription: 'Two Wheeler Services',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009000004',
      password: await bcrypt.hash('Vendor@104', 10),
      gstNumber: 'GST1000000004',
      bankDetails: {
        accountNumber: '111100000000004',
        ifsc: 'SBI0001004',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '104'
    },
    {
      userId: new mongoose.Types.ObjectId('691db87c1c17b8fc3b8db2c2'),
      type: 'VH005',
      businessName: 'METRO AUTO WORKS',
      businessEmail: 'metro.autoworks.vendor@gmail.com',
      businessDescription: 'Vehicle Servicing & Polishing',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009000005',
      password: await bcrypt.hash('Vendor@105', 10),
      gstNumber: 'GST1000000005',
      bankDetails: {
        accountNumber: '111100000000005',
        ifsc: 'SBI0001005',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '105'
    },
    {
      userId: new mongoose.Types.ObjectId('691db87c1c17b8fc3b8db2c4'),
      type: 'VH006',
      businessName: 'URBAN AUTO HUB',
      businessEmail: 'urban.autohub.vendor@gmail.com',
      businessDescription: 'General Car & Bike Services',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009000006',
      password: await bcrypt.hash('Vendor@106', 10),
      gstNumber: 'GST1000000006',
      bankDetails: {
        accountNumber: '111100000000006',
        ifsc: 'SBI0001006',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '106'
    },
    {
      userId: new mongoose.Types.ObjectId('691db87c1c17b8fc3b8db2c6'),
      type: 'VH007',
      businessName: 'GALAXY AUTO ZONE',
      businessEmail: 'galaxy.autozone.vendor@gmail.com',
      businessDescription: 'Car AC & Electrical Works',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009000007',
      password: await bcrypt.hash('Vendor@107', 10),
      gstNumber: 'GST1000000007',
      bankDetails: {
        accountNumber: '111100000000007',
        ifsc: 'SBI0001007',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '107'
    },
    {
      userId: new mongoose.Types.ObjectId('691db87c1c17b8fc3b8db2c8'),
      type: 'VH008',
      businessName: 'EVERGREEN MOTORS',
      businessEmail: 'evergreen.motors.vendor@gmail.com',
      businessDescription: 'Fuel Injection & Engine Works',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009000008',
      password: await bcrypt.hash('Vendor@108', 10),
      gstNumber: 'GST1000000008',
      bankDetails: {
        accountNumber: '111100000000008',
        ifsc: 'SBI0001008',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '108'
    },
    {
      userId: new mongoose.Types.ObjectId('691db87d1c17b8fc3b8db2ca'),
      type: 'VH009',
      businessName: 'MEGA AUTO WORKSHOP',
      businessEmail: 'mega.workshop.vendor@gmail.com',
      businessDescription: 'Full Car Diagnosis & Service',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009000009',
      password: await bcrypt.hash('Vendor@109', 10),
      gstNumber: 'GST1000000009',
      bankDetails: {
        accountNumber: '111100000000009',
        ifsc: 'SBI0001009',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '109'
    },
    {
      userId: new mongoose.Types.ObjectId('691db87d1c17b8fc3b8db2ce'),
      type: 'VH010',
      businessName: 'FUSION AUTO MART',
      businessEmail: 'fusion.automart.vendor@gmail.com',
      businessDescription: 'Hybrid Car Services',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009000010',
      password: await bcrypt.hash('Vendor@110', 10),
      gstNumber: 'GST1000000010',
      bankDetails: {
        accountNumber: '111100000000010',
        ifsc: 'SBI0001010',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '110'
    },
    {
      userId: new mongoose.Types.ObjectId('691db87d1c17b8fc3b8db2d0'),
      type: 'VH011',
      businessName: 'RAPID AUTO SOLUTIONS',
      businessEmail: 'rapid.auto.sol.vendor@gmail.com',
      businessDescription: 'General Vehicle Service',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009000011',
      password: await bcrypt.hash('Vendor@111', 10),
      gstNumber: 'GST1000000011',
      bankDetails: {
        accountNumber: '111100000000011',
        ifsc: 'SBI0001011',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '111'
    },
    {
      userId: new mongoose.Types.ObjectId('691db87d1c17b8fc3b8db2d2'),
      type: 'VH012',
      businessName: 'PRIME MOTOR CARE',
      businessEmail: 'prime.motorcare.vendor@gmail.com',
      businessDescription: 'Car Service & Denting',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009000012',
      password: await bcrypt.hash('Vendor@112', 10),
      gstNumber: 'GST1000000012',
      bankDetails: {
        accountNumber: '111100000000012',
        ifsc: 'SBI0001012',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '112'
    },
    {
      userId: new mongoose.Types.ObjectId('691db87d1c17b8fc3b8db2d4'),
      type: 'VH013',
      businessName: 'CITY AUTO WORKS',
      businessEmail: 'city.auto.works.vendor@gmail.com',
      businessDescription: 'General Auto Repair',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009000013',
      password: await bcrypt.hash('Vendor@113', 10),
      gstNumber: 'GST1000000013',
      bankDetails: {
        accountNumber: '111100000000013',
        ifsc: 'SBI0001013',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '113'
    },
    {
      userId: new mongoose.Types.ObjectId('691db87d1c17b8fc3b8db2d6'),
      type: 'VH014',
      businessName: 'SUPER AUTO GARAGE',
      businessEmail: 'super.autogarage.vendor@gmail.com',
      businessDescription: 'Car Checkup & Maintenance',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009000014',
      password: await bcrypt.hash('Vendor@114', 10),
      gstNumber: 'GST1000000014',
      bankDetails: {
        accountNumber: '111100000000014',
        ifsc: 'SBI0001014',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '114'
    },
    {
      userId: new mongoose.Types.ObjectId('691db87d1c17b8fc3b8db2d8'),
      type: 'VH015',
      businessName: 'TURBO AUTO SERVICES',
      businessEmail: 'turbo.autoservices.vendor@gmail.com',
      businessDescription: 'Turbo & Engine Services',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009000015',
      password: await bcrypt.hash('Vendor@115', 10),
      gstNumber: 'GST1000000015',
      bankDetails: {
        accountNumber: '111100000000015',
        ifsc: 'SBI0001015',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '115'
    },
    {
      userId: new mongoose.Types.ObjectId('691db87d1c17b8fc3b8db2da'),
      type: 'VH016',
      businessName: 'AUTONOVA SERVICES',
      businessEmail: 'autonova.services.vendor@gmail.com',
      businessDescription: 'Car & Bike Diagnosis',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009000016',
      password: await bcrypt.hash('Vendor@116', 10),
      gstNumber: 'GST1000000016',
      bankDetails: {
        accountNumber: '111100000000016',
        ifsc: 'SBI0001016',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '116'
    },
    {
      userId: new mongoose.Types.ObjectId('691db87d1c17b8fc3b8db2dc'),
      type: 'VH017',
      businessName: 'MOTORSPHERE GARAGE',
      businessEmail: 'motorsphere.garage.vendor@gmail.com',
      businessDescription: 'Engine Tuning & Mapping',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009000017',
      password: await bcrypt.hash('Vendor@117', 10),
      gstNumber: 'GST1000000017',
      bankDetails: {
        accountNumber: '111100000000017',
        ifsc: 'SBI0001017',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '117'
    },
    {
      userId: new mongoose.Types.ObjectId('691db87d1c17b8fc3b8db2de'),
      type: 'VH018',
      businessName: 'ACE AUTO REPAIR',
      businessEmail: 'ace.autorepair.vendor@gmail.com',
      businessDescription: 'General Repairs & Service',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009000018',
      password: await bcrypt.hash('Vendor@118', 10),
      gstNumber: 'GST1000000018',
      bankDetails: {
        accountNumber: '111100000000018',
        ifsc: 'SBI0001018',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '118'
    },
    {
      userId: new mongoose.Types.ObjectId('691db87d1c17b8fc3b8db2e0'),
      type: 'VH019',
      businessName: 'ROYAL AUTO SPARES',
      businessEmail: 'royal.autospares.vendor@gmail.com',
      businessDescription: 'Spare Parts & Repairs',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009000019',
      password: await bcrypt.hash('Vendor@119', 10),
      gstNumber: 'GST1000000019',
      bankDetails: {
        accountNumber: '111100000000019',
        ifsc: 'SBI0001019',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '119'
    },
    {
      userId: new mongoose.Types.ObjectId('691db87d1c17b8fc3b8db2e2'),
      type: 'VH020',
      businessName: 'NATIONAL AUTO CARE',
      businessEmail: 'national.autocare.vendor@gmail.com',
      businessDescription: 'General Automobile Services',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009000020',
      password: await bcrypt.hash('Vendor@120', 10),
      gstNumber: 'GST1000000020',
      bankDetails: {
        accountNumber: '111100000000020',
        ifsc: 'SBI0001020',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '120'
    },
    {
      userId: new mongoose.Types.ObjectId('691db87d1c17b8fc3b8db2e4'),
      type: 'VH021',
      businessName: 'AUTOZONE XPRESS',
      businessEmail: 'autozone.xpress.vendor@gmail.com',
      businessDescription: 'Express Vehicle Servicing',
      role: new mongoose.Types.ObjectId('691dae171e2ac4896d94e181'),
      phone: '90009000021',
      password: await bcrypt.hash('Vendor@121', 10),
      gstNumber: 'GST1000000021',
      bankDetails: {
        accountNumber: '111100000000021',
        ifsc: 'SBI0001021',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '121'
    }*/
  ]

  for (const user of vendors) {
    await Vendor.create(user);
  }

  console.log('Vendors seeded successfully!');
}

const DummySubCTG = async () => {
  const subs = [
    {
      parent: new mongoose.Types.ObjectId('691dd908ba3210b96825ba23'),
      name: 'Consumer Electronics',
      description: 'Regarding cosumer electronics'
    },
    {
      parent: new mongoose.Types.ObjectId('691dd908ba3210b96825ba23'),
      name: 'Computer & IT Electronics',
      description: 'Regarding computer & IT electronics'
    }
    /*
    {
      parent: new mongoose.Types.ObjectId('691dd908ba3210b96825ba23'),
      name: 'Mobile & Accessories',
      description: ''
    },
    {
      parent: new mongoose.Types.ObjectId('691dd908ba3210b96825ba23'),
      name: 'Audio Devices',
      description: ''
    },
    {
      parent: new mongoose.Types.ObjectId('691dd908ba3210b96825ba23'),
      name: 'Televisions & Entertainment',
      description: ''
    },*/
  ]

  for (const sub of subs) {
    const result = await Category.create(sub);
  }

  console.log('Subcategories seeded')
}

const DummyStaffs = async () => {
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

const DummyProducts = async () => {
  const products = [
    {
      categoryId: '',
      vendorId: '',
      name: '',
      description: '',
      price: '',
      stock: '',
      sku: '',
      images: '',
      status: '',
      sales: '',
      discount: '',
      rating: { average: '', totalReview }
    }
  ]
}

const DummyCarts = async () => {
  const carts = [
    {
      userId: '',
      items: [

      ],
      totalAmount: '',

    }
  ]
}

const DummyOrders = async () => {
  const products = [
    {
      userId: '',
      vendorId: '',
      items: [
        {
          productId: '',
          quantity: '',
          price: '',
          subtotal: '',
        }
      ],
      totalAmount: '',
      paymentMethod: '',
      paymentStatus: '',
      status: '',
      shippingAddress: '',
      trackingId: '',
      shippingAddress: {
        name: '',
        phone: '',
        addressLine: '',
        city: '',
        state: '',
        postalCode: '',
      },
    }
  ]
}

// (4)
const categorySeed = async () => {
  const categories = [
    { _id: new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d5'), name: 'Automobiles', slug: 'automobiles', description: 'All automobile products and services', imageUrl: null, status: 'active', parent: null },
    { _id: new mongoose.Types.ObjectId('691de84dd491c015e3343f29'), name: 'Electronics', slug: 'electronics', description: 'Electronic gadgets, devices, and accessories', imageUrl: null, status: 'active', parent: null },
    { _id: new mongoose.Types.ObjectId('691de84ed491c015e3343f38'), name: 'Fashions', slug: 'fashion', description: 'Electronic gadgets, devices, and accessories', imageUrl: null, status: 'active', parent: null },
    { _id: new mongoose.Types.ObjectId('691dd5f80bb4b64ed750f4d5'), name: 'Decoration', slug: 'decoration', description: 'Decoration things like: lights, curtain (drapes)', imageUrl: null, status: 'active', parent: null },
    { _id: new mongoose.Types.ObjectId('691de84ed491c015e3343f40'), name: 'Sports', slug: 'decoration', description: 'Decoration things like: lights, curtain (drapes)', imageUrl: null, status: 'active', parent: null },

    { _id: new mongoose.Types.ObjectId('6926b9778d0971e2704aa13b'), name: 'Mobile & Computer Accessories', slug: 'mobile-and-computer-accessories', description: 'Regarding mobile & computer accessories', imageUrl: null, status: 'active', parent: new mongoose.Types.ObjectId('691de84dd491c015e3343f29') },

  ];

  for (const category of categories) {
    await Category.create(category);
  }

  console.log('Categories created successfully!');
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
    // await DummyCategories();
    // await DummyCustomers();
    // await DummyVendors();
    // await DummySubCTG();

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