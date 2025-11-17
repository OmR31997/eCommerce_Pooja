import { config } from 'dotenv';
import path from 'path';
import { DB_Connect, DB_Disconnect } from '../config/db.config.js';
import { Admin } from "../models/admin.model.js";
import bcrypt from 'bcryptjs';
import { Permission } from '../models/permission.model.js';
import { Staff } from '../models/staff.model.js';
import { Role } from '../models/role.model.js';
import { User } from '../models/user.model.js';
import { Vendor } from '../models/vendor.model.js';
import { Category } from '../models/category.model.js';
import mongoose from 'mongoose';

const DummyCustomers = async () => {
  const users = [
    {
      name: 'Namrata Devi',
      email: 'namrata@gmail.com',
      phone: '9000456741',
      password: await bcrypt.hash('Namrata@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'India',
      otp: '123'
    },
    {
      name: 'Krishna Sigh',
      email: 'krishna@gmail.com',
      phone: '9000456742',
      password: await bcrypt.hash('Krishna@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'India',
      otp: '123'
    }, {
      name: 'Ankush Kumar',
      email: 'ankush@gmail.com',
      phone: '9000456743',
      password: await bcrypt.hash('Ankush@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'India',
      otp: '123'
    }, {
      name: 'Vijay Kumar Singh',
      email: 'vijay@gmail.com',
      phone: '9000456744',
      password: await bcrypt.hash('vijay@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'India',
      otp: '123'
    },
    {
      name: 'Amar Singh',
      email: 'amar@gmail.com',
      phone: '9000000123',
      password: await bcrypt.hash('Amar@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'India',
      otp: '123'
    },
    {
      name: 'Bhanu Singh',
      email: 'bhanu@gmail.com',
      phone: '9000000456',
      password: await bcrypt.hash('Bhanu@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'India',
      otp: '12443'
    },
    {
      name: 'Catherine',
      email: 'cathe@gmail.com',
      phone: '9000000147',
      password: await bcrypt.hash('Cathe@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'India',
      otp: '123'
    },
    {
      name: 'Anjalee',
      email: 'anjalee@gmail.com',
      phone: '9000000741',
      password: await bcrypt.hash('Anjalee@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'India',
      otp: '123454'
    },
    {
      name: 'Ganesh',
      email: 'ganesh@gmail.com',
      phone: '9000004444',
      password: await bcrypt.hash('Ganesh@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'India',
      otp: '1234441'
    },
    {
      name: 'Suresh Kumar',
      email: 'suresh.kumar@example.com',
      phone: '9876543210',
      password: await bcrypt.hash('Suresh@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Chennai, India',
      otp: '558231'
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '9123456780',
      password: await bcrypt.hash('Priya@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Delhi, India',
      otp: '882199'
    },
    {
      name: 'Rohit Verma',
      email: 'rohit.verma@example.com',
      phone: '9001122334',
      password: await bcrypt.hash('Rohit@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Mumbai, India',
      otp: '441122'
    },
    {
      name: 'Aisha Khan',
      email: 'aisha.khan@example.com',
      phone: '9345678123',
      password: await bcrypt.hash('Aisha@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Bangalore, India',
      otp: '774455'
    },
    {
      name: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      phone: '9556677881',
      password: await bcrypt.hash('Vikram@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Hyderabad, India',
      otp: '903211'
    },
    {
      name: 'Neha Patel',
      email: 'neha.patel@example.com',
      phone: '9812345678',
      password: await bcrypt.hash('Neha@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Ahmedabad, India',
      otp: '334455'
    },
    {
      name: 'Arjun Mehta',
      email: 'arjun.mehta@example.com',
      phone: '9098765432',
      password: await bcrypt.hash('Arjun@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Pune, India',
      otp: '662211'
    },
    {
      name: 'Kavya Reddy',
      email: 'kavya.reddy@example.com',
      phone: '9301122456',
      password: await bcrypt.hash('Kavya@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Hyderabad, India',
      otp: '998877'
    },
    {
      name: 'Manoj Gupta',
      email: 'manoj.gupta@example.com',
      phone: '9988776655',
      password: await bcrypt.hash('Manoj@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Lucknow, India',
      otp: '110099'
    },
    {
      name: 'Sara Dsouza',
      email: 'sara.dsouza@example.com',
      phone: '9123004455',
      password: await bcrypt.hash('Sara@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Goa, India',
      otp: '556677'
    },
    {
      name: 'Karan Thakur',
      email: 'karan.thakur@example.com',
      phone: '9797554433',
      password: await bcrypt.hash('Karan@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Shimla, India',
      otp: '882244'
    },
    {
      name: 'Ritika Jain',
      email: 'ritika.jain@example.com',
      phone: '9011223344',
      password: await bcrypt.hash('Ritika@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Jaipur, India',
      otp: '221199'
    },
    {
      name: 'Farhan Ali',
      email: 'farhan.ali@example.com',
      phone: '9090332211',
      password: await bcrypt.hash('Farhan@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Kolkata, India',
      otp: '662255'
    },
    {
      name: 'Meera Joshi',
      email: 'meera.joshi@example.com',
      phone: '9322110099',
      password: await bcrypt.hash('Meera@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Bhopal, India',
      otp: '773311'
    },
    {
      name: 'Devansh Malhotra',
      email: 'devansh.malhotra@example.com',
      phone: '9888001122',
      password: await bcrypt.hash('Devansh@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Nagpur, India',
      otp: '445588'
    },
    {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      phone: '9000000001',
      password: await bcrypt.hash('Aarav@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Delhi, India',
      otp: '100001'
    },
    {
      name: 'Ishita Verma',
      email: 'ishita.verma@example.com',
      phone: '9000000002',
      password: await bcrypt.hash('Ishita@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Mumbai, India',
      otp: '100002'
    },
    {
      name: 'Kabir Nair',
      email: 'kabir.nair@example.com',
      phone: '9000000003',
      password: await bcrypt.hash('Kabir@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Kochi, India',
      otp: '100003'
    },
    {
      name: 'Rhea Menon',
      email: 'rhea.menon@example.com',
      phone: '9000000004',
      password: await bcrypt.hash('Rhea@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Trivandrum, India',
      otp: '100004'
    },
    {
      name: 'Dev Kapoor',
      email: 'dev.kapoor@example.com',
      phone: '9000000005',
      password: await bcrypt.hash('Dev@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Pune, India',
      otp: '100005'
    },
    {
      name: 'Maya Singh',
      email: 'maya.singh@example.com',
      phone: '9000000006',
      password: await bcrypt.hash('Maya@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Bangalore, India',
      otp: '100006'
    },
    {
      name: 'Arjun Reddy',
      email: 'arjun.reddy@example.com',
      phone: '9000000007',
      password: await bcrypt.hash('Arjun@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Hyderabad, India',
      otp: '100007'
    },
    {
      name: 'Sana Khan',
      email: 'sana.khan@example.com',
      phone: '9000000008',
      password: await bcrypt.hash('Sana@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Lucknow, India',
      otp: '100008'
    },
    {
      name: 'Vivaan Joshi',
      email: 'vivaan.joshi@example.com',
      phone: '9000000009',
      password: await bcrypt.hash('Vivaan@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Chandigarh, India',
      otp: '100009'
    },
    {
      name: 'Tara Bansal',
      email: 'tara.bansal@example.com',
      phone: '9000000010',
      password: await bcrypt.hash('Tara@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Surat, India',
      otp: '100010'
    },
    {
      name: 'Rohan Malhotra',
      email: 'rohan.malhotra@example.com',
      phone: '9000000011',
      password: await bcrypt.hash('Rohan@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Delhi, India',
      otp: '100011'
    },
    {
      name: 'Anika Desai',
      email: 'anika.desai@example.com',
      phone: '9000000012',
      password: await bcrypt.hash('Anika@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Vadodara, India',
      otp: '100012'
    },
    {
      name: 'Karan Patel',
      email: 'karan.patel@example.com',
      phone: '9000000013',
      password: await bcrypt.hash('Karan@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Rajkot, India',
      otp: '100013'
    },
    {
      name: 'Zoya Khan',
      email: 'zoya.khan@example.com',
      phone: '9000000014',
      password: await bcrypt.hash('Zoya@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Indore, India',
      otp: '100014'
    },
    {
      name: 'Nikhil Jain',
      email: 'nikhil.jain@example.com',
      phone: '9000000015',
      password: await bcrypt.hash('Nikhil@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Jaipur, India',
      otp: '100015'
    },
    {
      name: 'Aditi Chauhan',
      email: 'aditi.chauhan@example.com',
      phone: '9000000016',
      password: await bcrypt.hash('Aditi@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Udaipur, India',
      otp: '100016'
    },
    {
      name: 'Harsh Soni',
      email: 'harsh.soni@example.com',
      phone: '9000000017',
      password: await bcrypt.hash('Harsh@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Bhopal, India',
      otp: '100017'
    },
    {
      name: 'Meera Kapoor',
      email: 'meera.kapoor@example.com',
      phone: '9000000018',
      password: await bcrypt.hash('Meera@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Nagpur, India',
      otp: '100018'
    },
    {
      name: 'Irfan Syed',
      email: 'irfan.syed@example.com',
      phone: '9000000019',
      password: await bcrypt.hash('Irfan@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Aurangabad, India',
      otp: '100019'
    },
    {
      name: 'Shruti Jain',
      email: 'shruti.jain@example.com',
      phone: '9000000020',
      password: await bcrypt.hash('Shruti@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Gurgaon, India',
      otp: '100020'
    },
    {
      name: 'Aman Saxena',
      email: 'aman.saxena@example.com',
      phone: '9000000021',
      password: await bcrypt.hash('Aman@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Noida, India',
      otp: '100021'
    },
    {
      name: 'Pooja Yadav',
      email: 'pooja.yadav@example.com',
      phone: '9000000022',
      password: await bcrypt.hash('Pooja@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Kanpur, India',
      otp: '100022'
    },
    {
      name: 'Aditya Rao',
      email: 'aditya.rao@example.com',
      phone: '9000000023',
      password: await bcrypt.hash('Aditya@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Mangalore, India',
      otp: '100023'
    },
    {
      name: 'Simran Kaur',
      email: 'simran.kaur@example.com',
      phone: '9000000024',
      password: await bcrypt.hash('Simran@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Amritsar, India',
      otp: '100024'
    },
    {
      name: 'Yash Thakur',
      email: 'yash.thakur@example.com',
      phone: '9000000025',
      password: await bcrypt.hash('Yash@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Shimla, India',
      otp: '100025'
    },
    {
      name: 'Ananya Mishra',
      email: 'ananya.mishra@example.com',
      phone: '9000000026',
      password: await bcrypt.hash('Ananya@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Patna, India',
      otp: '100026'
    },
    {
      name: 'Rudra Singh',
      email: 'rudra.singh@example.com',
      phone: '9000000027',
      password: await bcrypt.hash('Rudra@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Varanasi, India',
      otp: '100027'
    },
    {
      name: 'Naina Arora',
      email: 'naina.arora@example.com',
      phone: '9000000028',
      password: await bcrypt.hash('Naina@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Agra, India',
      otp: '100028'
    },
    {
      name: 'Shaurya Malhotra',
      email: 'shaurya.malhotra@example.com',
      phone: '9000000029',
      password: await bcrypt.hash('Shaurya@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Delhi, India',
      otp: '100029'
    },
    {
      name: 'Radhika Deshmukh',
      email: 'radhika.deshmukh@example.com',
      phone: '9000000030',
      password: await bcrypt.hash('Radhika@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Nagpur, India',
      otp: '100030'
    },
    {
      name: 'Mohit Agarwal',
      email: 'mohit.agarwal@example.com',
      phone: '9000000031',
      password: await bcrypt.hash('Mohit@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Kolkata, India',
      otp: '100031'
    },
    {
      name: 'Ayesha Pathan',
      email: 'ayesha.pathan@example.com',
      phone: '9000000032',
      password: await bcrypt.hash('Ayesha@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Bangalore, India',
      otp: '100032'
    },
    {
      name: 'Danish Qureshi',
      email: 'danish.qureshi@example.com',
      phone: '9000000033',
      password: await bcrypt.hash('Danish@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Hyderabad, India',
      otp: '100033'
    },
    {
      name: 'Aarohi Joshi',
      email: 'aarohi.joshi@example.com',
      phone: '9000000034',
      password: await bcrypt.hash('Aarohi@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Pune, India',
      otp: '100034'
    },
    {
      name: 'Sarthak Goyal',
      email: 'sarthak.goyal@example.com',
      phone: '9000000035',
      password: await bcrypt.hash('Sarthak@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Gurgaon, India',
      otp: '100035'
    },
    {
      name: 'Lavanya Iyer',
      email: 'lavanya.iyer@example.com',
      phone: '9000000036',
      password: await bcrypt.hash('Lavanya@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Chennai, India',
      otp: '100036'
    },
    {
      name: 'Parth Shetty',
      email: 'parth.shetty@example.com',
      phone: '9000000037',
      password: await bcrypt.hash('Parth@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Mangalore, India',
      otp: '100037'
    },
    {
      name: 'Amina Ansari',
      email: 'amina.ansari@example.com',
      phone: '9000000038',
      password: await bcrypt.hash('Amina@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Mumbai, India',
      otp: '100038'
    },
    {
      name: 'Kushal Thapa',
      email: 'kushal.thapa@example.com',
      phone: '9000000039',
      password: await bcrypt.hash('Kushal@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Darjeeling, India',
      otp: '100039'
    },
    {
      name: 'Esha Kulkarni',
      email: 'esha.kulkarni@example.com',
      phone: '9000000040',
      password: await bcrypt.hash('Esha@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Pune, India',
      otp: '100040'
    },
    {
      name: 'Rehan Shaikh',
      email: 'rehan.shaikh@example.com',
      phone: '9000000041',
      password: await bcrypt.hash('Rehan@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Mumbai, India',
      otp: '100041'
    },
    {
      name: 'Ritika Bhatia',
      email: 'ritika.bhatia@example.com',
      phone: '9000000042',
      password: await bcrypt.hash('Ritika@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Delhi, India',
      otp: '100042'
    },
    {
      name: 'Vivaan Oberoi',
      email: 'vivaan.oberoi@example.com',
      phone: '9000000043',
      password: await bcrypt.hash('Vivaan@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Chandigarh, India',
      otp: '100043'
    },
    {
      name: 'Prisha Chopra',
      email: 'prisha.chopra@example.com',
      phone: '9000000044',
      password: await bcrypt.hash('Prisha@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Lucknow, India',
      otp: '100044'
    },
    {
      name: 'Arnav Gupta',
      email: 'arnav.gupta@example.com',
      phone: '9000000045',
      password: await bcrypt.hash('Arnav@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Gurgaon, India',
      otp: '100045'
    },
    {
      name: 'Mahima Soni',
      email: 'mahima.soni@example.com',
      phone: '9000000046',
      password: await bcrypt.hash('Mahima@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Indore, India',
      otp: '100046'
    },
    {
      name: 'Kabir Chawla',
      email: 'kabir.chawla@example.com',
      phone: '9000000047',
      password: await bcrypt.hash('Kabir@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Delhi, India',
      otp: '100047'
    },
    {
      name: 'Sahana Reddy',
      email: 'sahana.reddy@example.com',
      phone: '9000000048',
      password: await bcrypt.hash('Sahana@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Hyderabad, India',
      otp: '100048'
    },
    {
      name: 'Arvind Menon',
      email: 'arvind.menon@example.com',
      phone: '9000000049',
      password: await bcrypt.hash('Arvind@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Kochi, India',
      otp: '100049'
    },
    {
      name: 'Krisha Dave',
      email: 'krisha.dave@example.com',
      phone: '9000000050',
      password: await bcrypt.hash('Krisha@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Ahmedabad, India',
      otp: '100050'
    },
    {
      name: 'Manish Tiwari',
      email: 'manish.tiwari@example.com',
      phone: '9000000051',
      password: await bcrypt.hash('Manish@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Kanpur, India',
      otp: '100051'
    },
    {
      name: 'Divya Nair',
      email: 'divya.nair@example.com',
      phone: '9000000052',
      password: await bcrypt.hash('Divya@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Kochi, India',
      otp: '100052'
    },
    {
      name: 'Sarvesh Kumar',
      email: 'sarvesh.kumar@example.com',
      phone: '9000000053',
      password: await bcrypt.hash('Sarvesh@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Patna, India',
      otp: '100053'
    },
    {
      name: 'Myra Khanna',
      email: 'myra.khanna@example.com',
      phone: '9000000054',
      password: await bcrypt.hash('Myra@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Delhi, India',
      otp: '100054'
    },
    {
      name: 'Rishabh Kapoor',
      email: 'rishabh.kapoor@example.com',
      phone: '9000000055',
      password: await bcrypt.hash('Rishabh@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Noida, India',
      otp: '100055'
    },
    {
      name: 'Suhani Jain',
      email: 'suhani.jain@example.com',
      phone: '9000000056',
      password: await bcrypt.hash('Suhani@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Jaipur, India',
      otp: '100056'
    },
    {
      name: 'Kavish Sethi',
      email: 'kavish.sethi@example.com',
      phone: '9000000057',
      password: await bcrypt.hash('Kavish@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Bhopal, India',
      otp: '100057'
    },
    {
      name: 'Anushka Pillai',
      email: 'anushka.pillai@example.com',
      phone: '9000000058',
      password: await bcrypt.hash('Anushka@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Chennai, India',
      otp: '100058'
    },
    {
      name: 'Yuvraj Rathod',
      email: 'yuvraj.rathod@example.com',
      phone: '9000000059',
      password: await bcrypt.hash('Yuvraj@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Surat, India',
      otp: '100059'
    },
    {
      name: 'Sana Qureshi',
      email: 'sana.qureshi@example.com',
      phone: '9000000060',
      password: await bcrypt.hash('Sana@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Lucknow, India',
      otp: '100060'
    },
    {
      name: 'Aryan Bansal',
      email: 'aryan.bansal@example.com',
      phone: '9000000061',
      password: await bcrypt.hash('Aryan@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Agra, India',
      otp: '100061'
    },
    {
      name: 'Pihu Saxena',
      email: 'pihu.saxena@example.com',
      phone: '9000000062',
      password: await bcrypt.hash('Pihu@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Gurgaon, India',
      otp: '100062'
    },
    {
      name: 'Dev Mehta',
      email: 'dev.mehta@example.com',
      phone: '9000000063',
      password: await bcrypt.hash('Dev@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Ahmedabad, India',
      otp: '100063'
    },
    {
      name: 'Riya Pandey',
      email: 'riya.pandey@example.com',
      phone: '9000000064',
      password: await bcrypt.hash('Riya@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Kanpur, India',
      otp: '100064'
    },
    {
      name: 'Atharv Joshi',
      email: 'atharv.joshi@example.com',
      phone: '9000000065',
      password: await bcrypt.hash('Atharv@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Pune, India',
      otp: '100065'
    },
    {
      name: 'Jhanvi Kapoor',
      email: 'jhanvi.kapoor@example.com',
      phone: '9000000066',
      password: await bcrypt.hash('Jhanvi@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Mumbai, India',
      otp: '100066'
    },
    {
      name: 'Samar Chopra',
      email: 'samar.chopra@example.com',
      phone: '9000000067',
      password: await bcrypt.hash('Samar@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Delhi, India',
      otp: '100067'
    },
    {
      name: 'Trisha Menon',
      email: 'trisha.menon@example.com',
      phone: '9000000068',
      password: await bcrypt.hash('Trisha@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Chennai, India',
      otp: '100068'
    },
    {
      name: 'Zaid Khan',
      email: 'zaid.khan@example.com',
      phone: '9000000069',
      password: await bcrypt.hash('Zaid@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Hyderabad, India',
      otp: '100069'
    },
    {
      name: 'Mahira Ali',
      email: 'mahira.ali@example.com',
      phone: '9000000070',
      password: await bcrypt.hash('Mahira@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Lucknow, India',
      otp: '100070'
    },
    {
      name: 'Rudraksh Desai',
      email: 'rudraksh.desai@example.com',
      phone: '9000000071',
      password: await bcrypt.hash('Rudraksh@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Vadodara, India',
      otp: '100071'
    },
    {
      name: 'Shreya Shah',
      email: 'shreya.shah@example.com',
      phone: '9000000072',
      password: await bcrypt.hash('Shreya@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Surat, India',
      otp: '100072'
    },
    {
      name: 'Vivaan Bhatt',
      email: 'vivaan.bhatt@example.com',
      phone: '9000000073',
      password: await bcrypt.hash('Vivaan@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Gandhinagar, India',
      otp: '100073'
    },
    {
      name: 'Esha Raina',
      email: 'esha.raina@example.com',
      phone: '9000000074',
      password: await bcrypt.hash('Esha@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Jammu, India',
      otp: '100074'
    },
    {
      name: 'Reyansh Suri',
      email: 'reyansh.suri@example.com',
      phone: '9000000075',
      password: await bcrypt.hash('Reyansh@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Amritsar, India',
      otp: '100075'
    },
    {
      name: 'Aarohi Malhotra',
      email: 'aarohi.malhotra@example.com',
      phone: '9000000076',
      password: await bcrypt.hash('Aarohi@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Mumbai, India',
      otp: '100076'
    },
    {
      name: 'Kabir Ahuja',
      email: 'kabir.ahuja@example.com',
      phone: '9000000077',
      password: await bcrypt.hash('Kabir@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Delhi, India',
      otp: '100077'
    },
    {
      name: 'Tanya Sharma',
      email: 'tanya.sharma@example.com',
      phone: '9000000078',
      password: await bcrypt.hash('Tanya@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Pune, India',
      otp: '100078'
    },
    {
      name: 'Ayaan Qureshi',
      email: 'ayaan.qureshi@example.com',
      phone: '9000000079',
      password: await bcrypt.hash('Ayaan@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Hyderabad, India',
      otp: '100079'
    },
    {
      name: 'Kiara Dutta',
      email: 'kiara.dutta@example.com',
      phone: '9000000080',
      password: await bcrypt.hash('Kiara@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Bangalore, India',
      otp: '100080'
    },
    {
      name: 'Daksh Verma',
      email: 'daksh.verma@example.com',
      phone: '9000000081',
      password: await bcrypt.hash('Daksh@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Kanpur, India',
      otp: '100081'
    },
    {
      name: 'Nidhi Raj',
      email: 'nidhi.raj@example.com',
      phone: '9000000082',
      password: await bcrypt.hash('Nidhi@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Patna, India',
      otp: '100082'
    },
    {
      name: 'Shaurya Singh',
      email: 'shaurya.singh@example.com',
      phone: '9000000083',
      password: await bcrypt.hash('Shaurya@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Gurgaon, India',
      otp: '100083'
    },
    {
      name: 'Anvi Chawla',
      email: 'anvi.chawla@example.com',
      phone: '9000000084',
      password: await bcrypt.hash('Anvi@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Noida, India',
      otp: '100084'
    },
    {
      name: 'Aarush Mehra',
      email: 'aarush.mehra@example.com',
      phone: '9000000085',
      password: await bcrypt.hash('Aarush@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Jaipur, India',
      otp: '100085'
    },
    {
      name: 'Sara Syed',
      email: 'sara.syed@example.com',
      phone: '9000000086',
      password: await bcrypt.hash('Sara@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Lucknow, India',
      otp: '100086'
    },
    {
      name: 'Atharv Shah',
      email: 'atharv.shah@example.com',
      phone: '9000000087',
      password: await bcrypt.hash('Atharv@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Surat, India',
      otp: '100087'
    },
    {
      name: 'Jasleen Kaur',
      email: 'jasleen.kaur@example.com',
      phone: '9000000088',
      password: await bcrypt.hash('Jasleen@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Amritsar, India',
      otp: '100088'
    },
    {
      name: 'Arnav Das',
      email: 'arnav.das@example.com',
      phone: '9000000089',
      password: await bcrypt.hash('Arnav@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Kolkata, India',
      otp: '100089'
    },
    {
      name: 'Mahi Jain',
      email: 'mahi.jain@example.com',
      phone: '9000000090',
      password: await bcrypt.hash('Mahi@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Indore, India',
      otp: '100090'
    },
    {
      name: 'Aarav Raina',
      email: 'aarav.raina@example.com',
      phone: '9000000091',
      password: await bcrypt.hash('Aarav@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Jammu, India',
      otp: '100091'
    },
    {
      name: 'Reeva Kapoor',
      email: 'reeva.kapoor@example.com',
      phone: '9000000092',
      password: await bcrypt.hash('Reeva@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Mumbai, India',
      otp: '100092'
    },
    {
      name: 'Dev Garg',
      email: 'dev.garg@example.com',
      phone: '9000000093',
      password: await bcrypt.hash('DevGarg@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Delhi, India',
      otp: '100093'
    },
    {
      name: 'Nysa Bhandari',
      email: 'nysa.bhandari@example.com',
      phone: '9000000094',
      password: await bcrypt.hash('Nysa@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Chandigarh, India',
      otp: '100094'
    },
    {
      name: 'Vihaan Mathur',
      email: 'vihaan.mathur@example.com',
      phone: '9000000095',
      password: await bcrypt.hash('Vihaan@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Jaipur, India',
      otp: '100095'
    },
    {
      name: 'Amaira Khan',
      email: 'amaira.khan@example.com',
      phone: '9000000096',
      password: await bcrypt.hash('Amaira@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Lucknow, India',
      otp: '100096'
    },
    {
      name: 'Rehaan Ali',
      email: 'rehaan.ali@example.com',
      phone: '9000000097',
      password: await bcrypt.hash('Rehaan@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Hyderabad, India',
      otp: '100097'
    },
    {
      name: 'Tia Fernandes',
      email: 'tia.fernandes@example.com',
      phone: '9000000098',
      password: await bcrypt.hash('Tia@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Goa, India',
      otp: '100098'
    },
    {
      name: 'Yuvi Shekhawat',
      email: 'yuvi.shekhawat@example.com',
      phone: '9000000099',
      password: await bcrypt.hash('Yuvi@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Udaipur, India',
      otp: '100099'
    },
    {
      name: 'Maira Gill',
      email: 'maira.gill@example.com',
      phone: '9000000100',
      password: await bcrypt.hash('Maira@123', 10),
      roles: [new mongoose.Types.ObjectId('69175dae4f4955165e9e2184')],
      permissions: [new mongoose.Types.ObjectId('691783835b82d6a8d9ceef7d')],
      address: 'Amritsar, India',
      otp: '100100'
    }
  ]

  for (const user of users) {
    await User.create(user);
  }

  console.log('User seeded successfully!');
}

const DummyVendors = async () => {
  const vendors = [
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d4b0f'),
      type: 'VH001',
      businessName: 'AMAR SERVICE LTD',
      businessEmail: 'amar.vendor@gmail.com',
      businessDescription: 'Automobile Services',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d4b0d'),
      type: 'EVH001',
      businessName: 'VIJAY SERVICE LTD',
      businessEmail: 'vijay.vendor@gmail.com',
      businessDescription: 'EV Services',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d4b07'),
      type: 'MN001',
      businessName: 'KRISHNA SERVICE LTD',
      businessEmail: 'krishna.vendor@gmail.com',
      businessDescription: 'Mobile Services',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d4b0b'),
      type: 'JL001',
      businessName: 'JEWELLERY LTD',
      businessEmail: 'ankush.vendor@gmail.com',
      businessDescription: 'Jewellery',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d4b07'),
      type: 'ECT001',
      businessName: 'NAMRATA SERVICE LTD',
      businessEmail: 'namrata.vendor@gmail.com',
      businessDescription: 'Electronic Services',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d4b11'),
      type: 'VH002',
      businessName: 'BHANU AUTO CARE',
      businessEmail: 'bhanu.autocare@gmail.com',
      businessDescription: 'Automobile Repair & Maintenance',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d4b13'),
      type: 'VH003',
      businessName: 'NEXGEN MOTORS',
      businessEmail: 'nexgen.motors@gmail.com',
      businessDescription: 'Car Electrical Services',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      businessEmail: 'speedpromax.garage@gmail.com',
      businessDescription: 'Two Wheeler Services',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d4b1b'),
      type: 'VH005',
      businessName: 'SUPER METRO AUTO WORKS',
      businessEmail: 'supermetro.autoworks@gmail.com',
      businessDescription: 'Vehicle Servicing & Polishing',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964d0a4763a9f5e2d4b1d'),
      type: 'VH006',
      businessName: 'URBAN ALTRA AUTO HUB',
      businessEmail: 'urbanaltra.autohub@gmail.com',
      businessDescription: 'Bike & Car General Services',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964d0a4763a9f5e2d4b21'),
      type: 'VH002',
      businessName: 'VIKRAM AUTO CARE',
      businessEmail: 'vikram.autocare@gmail.com',
      businessDescription: 'Car Repair & Maintenance',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964d0a4763a9f5e2d4b23'),
      type: 'VH003',
      businessName: 'NEXTGEN MOTORS',
      businessEmail: 'nextgen.motors@gmail.com',
      businessDescription: 'Automobile Electrical Services',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964d0a4763a9f5e2d4b25'),
      type: 'VH004',
      businessName: 'SPEEDMAX GARAGE',
      businessEmail: 'speedmax.garage@gmail.com',
      businessDescription: 'Two Wheeler Services',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964d0a4763a9f5e2d4b27'),
      type: 'VH005',
      businessName: 'METRO AUTO WORKS',
      businessEmail: 'metro.autoworks@gmail.com',
      businessDescription: 'Vehicle Servicing & Polishing',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964d0a4763a9f5e2d4b29'),
      type: 'VH006',
      businessName: 'URBAN AUTO HUB',
      businessEmail: 'urban.autohub@gmail.com',
      businessDescription: 'General Car & Bike Services',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964d0a4763a9f5e2d4b2b'),
      type: 'VH007',
      businessName: 'GALAXY AUTO ZONE',
      businessEmail: 'galaxy.autozone@gmail.com',
      businessDescription: 'Car AC & Electrical Works',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964d0a4763a9f5e2d4b2d'),
      type: 'VH008',
      businessName: 'EVERGREEN MOTORS',
      businessEmail: 'evergreen.motors@gmail.com',
      businessDescription: 'Fuel Injection & Engine Works',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964d0a4763a9f5e2d4b2f'),
      type: 'VH009',
      businessName: 'MEGA AUTO WORKSHOP',
      businessEmail: 'mega.workshop@gmail.com',
      businessDescription: 'Full Car Diagnosis & Service',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964d0a4763a9f5e2d4b31'),
      type: 'VH010',
      businessName: 'FUSION AUTO MART',
      businessEmail: 'fusion.automart@gmail.com',
      businessDescription: 'Hybrid Car Services',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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

    /* Vendors 11–25 (same format) */
    {
      userId: new mongoose.Types.ObjectId('691964d0a4763a9f5e2d4b33'),
      type: 'VH011',
      businessName: 'RAPID AUTO SOLUTIONS',
      businessEmail: 'rapid.auto.sol@gmail.com',
      businessDescription: 'General Vehicle Service',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964d1a4763a9f5e2d4b35'),
      type: 'VH012',
      businessName: 'PRIME MOTOR CARE',
      businessEmail: 'prime.motorcare@gmail.com',
      businessDescription: 'Car Service & Denting',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964d1a4763a9f5e2d4b37'),
      type: 'VH013',
      businessName: 'CITY AUTO WORKS',
      businessEmail: 'city.auto.works@gmail.com',
      businessDescription: 'General Auto Repair',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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

    /* ...continued up to Vendor 25 */
    {
      userId: new mongoose.Types.ObjectId('691964d1a4763a9f5e2d4b39'),
      type: 'VH014',
      businessName: 'SUPER AUTO GARAGE',
      businessEmail: 'super.autogarage@gmail.com',
      businessDescription: 'Car Checkup & Maintenance',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964d1a4763a9f5e2d4b3b'),
      type: 'VH015',
      businessName: 'TURBO AUTO SERVICES',
      businessEmail: 'turbo.autoservices@gmail.com',
      businessDescription: 'Turbo & Engine Services',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964d1a4763a9f5e2d4b3d'),
      type: 'VH016',
      businessName: 'AUTONOVA SERVICES',
      businessEmail: 'autonova.services@gmail.com',
      businessDescription: 'Car & Bike Diagnosis',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964d1a4763a9f5e2d4b3f'),
      type: 'VH017',
      businessName: 'MOTORSPHERE GARAGE',
      businessEmail: 'motorsphere.garage@gmail.com',
      businessDescription: 'Engine Tuning & Mapping',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964d1a4763a9f5e2d4b41'),
      type: 'VH018',
      businessName: 'ACE AUTO REPAIR',
      businessEmail: 'ace.autorepair@gmail.com',
      businessDescription: 'General Repairs & Service',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964d1a4763a9f5e2d4b43'),
      type: 'VH019',
      businessName: 'ROYAL AUTO SPARES',
      businessEmail: 'royal.autospares@gmail.com',
      businessDescription: 'Spare Parts & Repairs',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964d1a4763a9f5e2d4b45'),
      type: 'VH020',
      businessName: 'NATIONAL AUTO CARE',
      businessEmail: 'national.autocare@gmail.com',
      businessDescription: 'General Automobile Services',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5021'),
      type: 'VH021',
      businessName: 'AUTOZONE XPRESS',
      businessEmail: 'autozone.xpress@gmail.com',
      businessDescription: 'Express Vehicle Servicing',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
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
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5022'),
      type: 'VH022',
      businessName: 'GREEN AUTO WORKSHOP',
      businessEmail: 'green.auto.workshop@gmail.com',
      businessDescription: 'Eco-Friendly Vehicle Services',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000022',
      password: await bcrypt.hash('Vendor@122', 10),
      gstNumber: 'GST1000000022',
      bankDetails: {
        accountNumber: '111100000000022',
        ifsc: 'SBI0001022',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '122'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5023'),
      type: 'VH023',
      businessName: 'GLOBAL AUTO HUB',
      businessEmail: 'global.autohub@gmail.com',
      businessDescription: 'Vehicle Inspection & Checkup',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000023',
      password: await bcrypt.hash('Vendor@123', 10),
      gstNumber: 'GST1000000023',
      bankDetails: {
        accountNumber: '111100000000023',
        ifsc: 'SBI0001023',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '123'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5024'),
      type: 'VH024',
      businessName: 'SUPREME MOTOR SERVICE',
      businessEmail: 'supreme.motorservice@gmail.com',
      businessDescription: 'Premium Car Servicing',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000024',
      password: await bcrypt.hash('Vendor@124', 10),
      gstNumber: 'GST1000000024',
      bankDetails: {
        accountNumber: '111100000000024',
        ifsc: 'SBI0001024',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '124'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5025'),
      type: 'VH025',
      businessName: 'AUTOCARE PLUS INDIA',
      businessEmail: 'autocare.plus.india@gmail.com',
      businessDescription: 'Luxury Car Maintenance',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000025',
      password: await bcrypt.hash('Vendor@125', 10),
      gstNumber: 'GST1000000025',
      bankDetails: {
        accountNumber: '111100000000025',
        ifsc: 'SBI0001025',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '125'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5026'),
      type: 'VH026',
      businessName: 'QUICK FIX MOTORS',
      businessEmail: 'quickfix.motors@gmail.com',
      businessDescription: 'Quick Car Repair & Checkup',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000026',
      password: await bcrypt.hash('Vendor@126', 10),
      gstNumber: 'GST1000000026',
      bankDetails: {
        accountNumber: '111100000000026',
        ifsc: 'SBI0001026',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '126'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5027'),
      type: 'VH027',
      businessName: 'AUTO EXPERTS HUB',
      businessEmail: 'auto.experts.hub@gmail.com',
      businessDescription: 'Multi-brand Car Service',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000027',
      password: await bcrypt.hash('Vendor@127', 10),
      gstNumber: 'GST1000000027',
      bankDetails: {
        accountNumber: '111100000000027',
        ifsc: 'SBI0001027',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '127'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5028'),
      type: 'VH028',
      businessName: 'SAI MOTOR WORKS',
      businessEmail: 'sai.motorworks@gmail.com',
      businessDescription: 'Two-Wheeler Mechanics',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000028',
      password: await bcrypt.hash('Vendor@128', 10),
      gstNumber: 'GST1000000028',
      bankDetails: {
        accountNumber: '111100000000028',
        ifsc: 'SBI0001028',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '128'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5029'),
      type: 'VH029',
      businessName: 'VICTORIA AUTO GARAGE',
      businessEmail: 'victoria.autogarage@gmail.com',
      businessDescription: 'Car AC & Electrical Works',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000029',
      password: await bcrypt.hash('Vendor@129', 10),
      gstNumber: 'GST1000000029',
      bankDetails: {
        accountNumber: '111100000000029',
        ifsc: 'SBI0001029',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '129'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5030'),
      type: 'VH030',
      businessName: 'PRO AUTO TECH',
      businessEmail: 'pro.autotech@gmail.com',
      businessDescription: 'Professional Vehicle Diagnosis',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000030',
      password: await bcrypt.hash('Vendor@130', 10),
      gstNumber: 'GST1000000030',
      bankDetails: {
        accountNumber: '111100000000030',
        ifsc: 'SBI0001030',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '130'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5031'),
      type: 'VH031',
      businessName: 'MOTORAID WORKSHOP',
      businessEmail: 'motoraid.workshop@gmail.com',
      businessDescription: 'Engine Rebuild & Repair',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000031',
      password: await bcrypt.hash('Vendor@131', 10),
      gstNumber: 'GST1000000031',
      bankDetails: {
        accountNumber: '111100000000031',
        ifsc: 'SBI0001031',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '131'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5032'),
      type: 'VH032',
      businessName: 'AUTOPRO MECHANICS',
      businessEmail: 'autopro.mechanics@gmail.com',
      businessDescription: 'Premium Car Care',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000032',
      password: await bcrypt.hash('Vendor@132', 10),
      gstNumber: 'GST1000000032',
      bankDetails: {
        accountNumber: '111100000000032',
        ifsc: 'SBI0001032',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '132'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5033'),
      type: 'VH033',
      businessName: 'SMART AUTO TECH',
      businessEmail: 'smart.autotech@gmail.com',
      businessDescription: 'Smart Car Diagnostics',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000033',
      password: await bcrypt.hash('Vendor@133', 10),
      gstNumber: 'GST1000000033',
      bankDetails: {
        accountNumber: '111100000000033',
        ifsc: 'SBI0001033',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '133'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5034'),
      type: 'VH034',
      businessName: 'URBAN WHEEL CARE',
      businessEmail: 'urban.wheelcare@gmail.com',
      businessDescription: 'Wheel Alignment & Balancing',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000034',
      password: await bcrypt.hash('Vendor@134', 10),
      gstNumber: 'GST1000000034',
      bankDetails: {
        accountNumber: '111100000000034',
        ifsc: 'SBI0001034',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '134'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5035'),
      type: 'VH035',
      businessName: 'NORTHSTAR AUTO POINT',
      businessEmail: 'northstar.autopoint@gmail.com',
      businessDescription: 'Full Car Checkup',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000035',
      password: await bcrypt.hash('Vendor@135', 10),
      gstNumber: 'GST1000000035',
      bankDetails: {
        accountNumber: '111100000000035',
        ifsc: 'SBI0001035',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '135'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5036'),
      type: 'VH036',
      businessName: 'AUTOSMITH GARAGE',
      businessEmail: 'autosmith.garage@gmail.com',
      businessDescription: 'Body Repair & Painting',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000036',
      password: await bcrypt.hash('Vendor@136', 10),
      gstNumber: 'GST1000000036',
      bankDetails: {
        accountNumber: '111100000000036',
        ifsc: 'SBI0001036',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '136'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5037'),
      type: 'VH037',
      businessName: 'RELIABLE AUTO ZONE',
      businessEmail: 'reliable.autozone@gmail.com',
      businessDescription: 'General Service & Checkups',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000037',
      password: await bcrypt.hash('Vendor@137', 10),
      gstNumber: 'GST1000000037',
      bankDetails: {
        accountNumber: '111100000000037',
        ifsc: 'SBI0001037',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '137'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5038'),
      type: 'VH038',
      businessName: 'AUTOCARE 360',
      businessEmail: 'autocare.360@gmail.com',
      businessDescription: 'Complete Auto Solutions',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000038',
      password: await bcrypt.hash('Vendor@138', 10),
      gstNumber: 'GST1000000038',
      bankDetails: {
        accountNumber: '111100000000038',
        ifsc: 'SBI0001038',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '138'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5039'),
      type: 'VH039',
      businessName: 'MOTOR MASTER GARAGE',
      businessEmail: 'motor.master@gmail.com',
      businessDescription: 'Engine Tuning & Diagnostics',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000039',
      password: await bcrypt.hash('Vendor@139', 10),
      gstNumber: 'GST1000000039',
      bankDetails: {
        accountNumber: '111100000000039',
        ifsc: 'SBI0001039',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '139'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5040'),
      type: 'VH040',
      businessName: 'AUTO ELITE SERVICES',
      businessEmail: 'auto.elite.services@gmail.com',
      businessDescription: 'Elite Car Maintenance',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000040',
      password: await bcrypt.hash('Vendor@140', 10),
      gstNumber: 'GST1000000040',
      bankDetails: {
        accountNumber: '111100000000040',
        ifsc: 'SBI0001040',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '140'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5041'),
      type: 'VH041',
      businessName: 'AUTO REPAIR STATION',
      businessEmail: 'auto.repairstation@gmail.com',
      businessDescription: 'General Car Services',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000041',
      password: await bcrypt.hash('Vendor@141', 10),
      gstNumber: 'GST1000000041',
      bankDetails: {
        accountNumber: '111100000000041',
        ifsc: 'SBI0001041',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '141'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5042'),
      type: 'VH042',
      businessName: 'HIGH TECH AUTO GARAGE',
      businessEmail: 'hightech.autogarage@gmail.com',
      businessDescription: 'High-Tech Vehicle Solutions',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000042',
      password: await bcrypt.hash('Vendor@142', 10),
      gstNumber: 'GST1000000042',
      bankDetails: {
        accountNumber: '111100000000042',
        ifsc: 'SBI0001042',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '142'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5043'),
      type: 'VH043',
      businessName: 'AUTO BRIDGE SERVICES',
      businessEmail: 'autobridge.services@gmail.com',
      businessDescription: 'General Vehicle Inspection',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000043',
      password: await bcrypt.hash('Vendor@143', 10),
      gstNumber: 'GST1000000043',
      bankDetails: {
        accountNumber: '111100000000043',
        ifsc: 'SBI0001043',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '143'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5044'),
      type: 'VH044',
      businessName: 'GLIDE AUTO CENTER',
      businessEmail: 'glide.autocenter@gmail.com',
      businessDescription: 'Complete Vehicle Servicing',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000044',
      password: await bcrypt.hash('Vendor@144', 10),
      gstNumber: 'GST1000000044',
      bankDetails: {
        accountNumber: '111100000000044',
        ifsc: 'SBI0001044',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '144'
    },
    {
      userId: new mongoose.Types.ObjectId('691964cfa4763a9f5e2d5045'),
      type: 'VH045',
      businessName: 'NEXTGEN AUTO CARE',
      businessEmail: 'nextgen.autocare@gmail.com',
      businessDescription: 'Modern Vehicle Solutions',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000045',
      password: await bcrypt.hash('Vendor@145', 10),
      gstNumber: 'GST1000000045',
      bankDetails: {
        accountNumber: '111100000000045',
        ifsc: 'SBI0001045',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '145'
    },
    {
      userId: new mongoose.Types.ObjectId('691964d1a4763a9f5e2d4b4b'),
      type: 'VH046',
      businessName: 'PROFESSIONAL AUTO CARE',
      businessEmail: 'pro.autocare@gmail.com',
      businessDescription: 'Professional Mechanic Services',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000046',
      password: await bcrypt.hash('Vendor@146', 10),
      gstNumber: 'GST1000000046',
      bankDetails: {
        accountNumber: '111100000000046',
        ifsc: 'SBI0001046',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '146'
    },
    {
      userId: new mongoose.Types.ObjectId('691964d2a4763a9f5e2d4b4d'),
      type: 'VH047',
      businessName: 'DRIVE IN MOTORS',
      businessEmail: 'drivein.motors@gmail.com',
      businessDescription: 'Doorstep Vehicle Service',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000047',
      password: await bcrypt.hash('Vendor@147', 10),
      gstNumber: 'GST1000000047',
      bankDetails: {
        accountNumber: '111100000000047',
        ifsc: 'SBI0001047',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '147'
    },
    {
      userId: new mongoose.Types.ObjectId('691964d1a4763a9f5e2d4b4b'),
      type: 'VH048',
      businessName: 'METRO AUTO SOLUTIONS',
      businessEmail: 'metro.autosolutions@gmail.com',
      businessDescription: 'All-in-One Vehicle Care',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000048',
      password: await bcrypt.hash('Vendor@148', 10),
      gstNumber: 'GST1000000048',
      bankDetails: {
        accountNumber: '111100000000048',
        ifsc: 'SBI0001048',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '148'
    },
    {
      userId: new mongoose.Types.ObjectId('691964d1a4763a9f5e2d4b49'),
      type: 'VH049',
      businessName: 'SPARK AUTO WORKS',
      businessEmail: 'spark.autoworks@gmail.com',
      businessDescription: 'Electrical & Engine Services',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000049',
      password: await bcrypt.hash('Vendor@149', 10),
      gstNumber: 'GST1000000049',
      bankDetails: {
        accountNumber: '111100000000049',
        ifsc: 'SBI0001049',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '149'
    },
    {
      userId: new mongoose.Types.ObjectId('691964d1a4763a9f5e2d4b47'),
      type: 'VH050',
      businessName: 'SUPER FINE AUTO CARE',
      businessEmail: 'superfine.autocare@gmail.com',
      businessDescription: 'Premium Vehicle Diagnosis',
      role: new mongoose.Types.ObjectId('69175dae4f4955165e9e2183'),
      phone: '90009000050',
      password: await bcrypt.hash('Vendor@150', 10),
      gstNumber: 'GST1000000050',
      bankDetails: {
        accountNumber: '111100000000050',
        ifsc: 'SBI0001050',
        bankName: 'State Bank of India'
      },
      address: 'India',
      otp: '150'
    }
  ]

  for (const user of vendors) {
    await Vendor.create(user);
  }

  console.log('Vendors seeded successfully!');
}

const DummyCategories = async () => {
  const categories = [
    { name: 'Automobiles', slug: 'automobiles', description: 'All automobile products and services', imageUrl: null, status: 'active', parent: null },
    { name: 'Electronics', slug: 'electronics', description: 'Electronic gadgets, devices, and accessories', imageUrl: null, status: 'active', parent: null },
    { name: 'Fashion', slug: 'fashion', description: 'Clothing, footwear, and fashion accessories', imageUrl: null, status: 'active', parent: null },
    { name: 'Home Appliances', slug: 'home-appliances', description: 'Appliances for home use', imageUrl: null, status: 'active', parent: null },
    { name: 'Sports', slug: 'sports', description: 'Sports and fitness equipment', imageUrl: null, status: 'active', parent: null },
    { name: 'Books', slug: 'books', description: 'Books for all ages and genres', imageUrl: null, status: 'active', parent: null },
    { name: 'Toys & Games', slug: 'toys-games', description: 'Toys, board games, and educational games', imageUrl: null, status: 'active', parent: null },
    { name: 'Health & Beauty', slug: 'health-beauty', description: 'Health and beauty products', imageUrl: null, status: 'active', parent: null },
    { name: 'Office Supplies', slug: 'office-supplies', description: 'Stationery and office products', imageUrl: null, status: 'active', parent: null },
    { name: 'Pet Supplies', slug: 'pet-supplies', description: 'Products for pets and animals', imageUrl: null, status: 'active', parent: null },
    { name: 'Music & Instruments', slug: 'music-instruments', description: 'Musical instruments and accessories', imageUrl: null, status: 'active', parent: null },
    { name: 'Groceries', slug: 'groceries', description: 'Daily grocery items', imageUrl: null, status: 'active', parent: null },
    { name: 'Furniture', slug: 'furniture', description: 'Furniture for home and office', imageUrl: null, status: 'active', parent: null },
    { name: 'Garden & Outdoors', slug: 'garden-outdoors', description: 'Gardening tools, outdoor furniture, and decor', imageUrl: null, status: 'active', parent: null },
    { name: 'Jewelry', slug: 'jewelry', description: 'Jewelry and accessories', imageUrl: null, status: 'active', parent: null },
    { name: 'Automobile Parts', slug: 'automobile-parts', description: 'Spare parts and accessories for vehicles', imageUrl: null, status: 'active', parent: null },
    { name: 'Baby Products', slug: 'baby-products', description: 'Baby care and products', imageUrl: null, status: 'active', parent: null },
    { name: 'Travel & Luggage', slug: 'travel-luggage', description: 'Travel bags, luggage, and accessories', imageUrl: null, status: 'active', parent: null },
    { name: 'Shoes', slug: 'shoes', description: 'Footwear for men, women, and kids', imageUrl: null, status: 'active', parent: null },
    { name: 'Watches', slug: 'watches', description: 'Watches and smartwatches', imageUrl: null, status: 'active', parent: null },
    { name: 'Cameras & Photography', slug: 'cameras-photography', description: 'Cameras, lenses, and accessories', imageUrl: null, status: 'active', parent: null },
    { name: 'Computers & Accessories', slug: 'computers-accessories', description: 'Desktops, laptops, and computer peripherals', imageUrl: null, status: 'active', parent: null },
    { name: 'Software', slug: 'software', description: 'Software products and licenses', imageUrl: null, status: 'active', parent: null },
    { name: 'Mobile Accessories', slug: 'mobile-accessories', description: 'Chargers, cases, and mobile gadgets', imageUrl: null, status: 'active', parent: null },
    { name: 'Smart Home', slug: 'smart-home', description: 'Home automation and smart devices', imageUrl: null, status: 'active', parent: null },
    { name: 'DIY & Tools', slug: 'diy-tools', description: 'Tools, DIY kits, and repair products', imageUrl: null, status: 'active', parent: null },
    { name: 'Art & Crafts', slug: 'art-crafts', description: 'Art supplies, crafting materials, and kits', imageUrl: null, status: 'active', parent: null },
    { name: 'Automotive Services', slug: 'automotive-services', description: 'Services related to vehicles and repairs', imageUrl: null, status: 'active', parent: null },
    { name: 'Catering & Food Services', slug: 'catering-food-services', description: 'Food delivery and catering services', imageUrl: null, status: 'active', parent: null },
    { name: 'Events & Party Supplies', slug: 'events-party-supplies', description: 'Decorations and supplies for parties', imageUrl: null, status: 'active', parent: null },
    { name: 'Photography Services', slug: 'photography-services', description: 'Professional photography and editing', imageUrl: null, status: 'active', parent: null },
    { name: 'Cleaning Services', slug: 'cleaning-services', description: 'Home and office cleaning services', imageUrl: null, status: 'active', parent: null },
    { name: 'Legal Services', slug: 'legal-services', description: 'Lawyers, consultation, and legal advice', imageUrl: null, status: 'active', parent: null },
    { name: 'Financial Services', slug: 'financial-services', description: 'Banks, loans, and financial assistance', imageUrl: null, status: 'active', parent: null },
    { name: 'Education & Training', slug: 'education-training', description: 'Schools, courses, and training programs', imageUrl: null, status: 'active', parent: null },
    { name: 'Fitness & Gyms', slug: 'fitness-gyms', description: 'Gyms, fitness centers, and workout classes', imageUrl: null, status: 'active', parent: null },
    { name: 'Restaurants & Cafes', slug: 'restaurants-cafes', description: 'Dining, cafes, and food outlets', imageUrl: null, status: 'active', parent: null },
    { name: 'Hotels & Accommodation', slug: 'hotels-accommodation', description: 'Hotels, hostels, and lodging services', imageUrl: null, status: 'active', parent: null },
    { name: 'Travel & Tourism', slug: 'travel-tourism', description: 'Travel agencies, tour packages, and guides', imageUrl: null, status: 'active', parent: null },
    { name: 'Electronics Repair', slug: 'electronics-repair', description: 'Repair and maintenance of electronic devices', imageUrl: null, status: 'active', parent: null },
    { name: 'Real Estate', slug: 'real-estate', description: 'Properties, rentals, and real estate services', imageUrl: null, status: 'active', parent: null },
    { name: 'Construction & Building', slug: 'construction-building', description: 'Construction materials and services', imageUrl: null, status: 'active', parent: null },
    { name: 'Automotive Insurance', slug: 'automotive-insurance', description: 'Vehicle insurance and policies', imageUrl: null, status: 'active', parent: null },
    { name: 'Electronics Insurance', slug: 'electronics-insurance', description: 'Insurance for electronics and gadgets', imageUrl: null, status: 'active', parent: null },
    { name: 'Gaming', slug: 'gaming', description: 'Video games, consoles, and accessories', imageUrl: null, status: 'active', parent: null },
    { name: 'Photography Equipment', slug: 'photography-equipment', description: 'Cameras, tripods, and lighting', imageUrl: null, status: 'active', parent: null },
    { name: 'Stationery', slug: 'stationery', description: 'Office and school stationery items', imageUrl: null, status: 'active', parent: null },
    { name: 'Home Decor', slug: 'home-decor', description: 'Decor items for homes and offices', imageUrl: null, status: 'active', parent: null },
    { name: 'Kitchenware', slug: 'kitchenware', description: 'Utensils, cookware, and kitchen gadgets', imageUrl: null, status: 'active', parent: null },
    { name: 'Footwear', slug: 'footwear', description: 'Shoes, sandals, sneakers for all', imageUrl: null, status: 'active', parent: null },
    { name: 'Clothing Accessories', slug: 'clothing-accessories', description: 'Belts, scarves, hats, and other accessories', imageUrl: null, status: 'active', parent: null },
    { name: 'Safety & Security', slug: 'safety-security', description: 'Safety equipment and home security products', imageUrl: null, status: 'active', parent: null },
    { name: 'Outdoors & Adventure', slug: 'outdoors-adventure', description: 'Camping, hiking, and adventure gear', imageUrl: null, status: 'active', parent: null },
    { name: 'DIY Craft Kits', slug: 'diy-craft-kits', description: 'Creative DIY craft kits for all ages', imageUrl: null, status: 'active', parent: null },
    { name: 'Collectibles', slug: 'collectibles', description: 'Collectible items and memorabilia', imageUrl: null, status: 'active', parent: null },
    { name: 'Luxury Goods', slug: 'luxury-goods', description: 'Premium and luxury items', imageUrl: null, status: 'active', parent: null },
    { name: 'Stationery & Office Decor', slug: 'stationery-office-decor', description: 'Stationery and office decorative items', imageUrl: null, status: 'active', parent: null },
    { name: 'Photography Services Max', slug: 'photography-services-max', description: 'Professional photography and photo editing', imageUrl: null, status: 'active', parent: null },
  ];

  for (const category of categories) {
    await Category.create(category);
  }

  console.log('Categories created successfully!');
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
    // await DummyCategories();
    // await DummyCustomers();
    // await DummyVendors();


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