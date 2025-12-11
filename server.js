import express from 'express';
import './config/env.config.js';
import fs from 'fs';
import cors from 'cors';
import path from 'path';
import CorsConfig from './config/cors.config.js';
import { DB_Connect } from './config/db.config.js';
import { seedDatabase } from './seeds/seed.js';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';

import AuthRoute from './routes/auth.route.js';
import AdminRoute from './routes/admin.route.js';
import PermissionsRoute from './routes/permission.route.js';
import RolesRoute from './routes/role.route.js';
import StaffRoute from './routes/staff.route.js';
import VendorRoute from './routes/vendor.route.js';
import UserRoute from './routes/user.route.js';
import CategoryRoute from './routes/category.route.js';
import ProductRoute from './routes/product.route.js';
import CartRoute from './routes/cart.route.js';
import PaymentRoute from './routes/payment.route.js';
import PayoutRoute from './routes/payout.route.js';
import OrderRoute from './routes/order.route.js';
import DashboardRoute from './routes/dashboard.route.js';
import BackupRoute from './routes/backup.route.js';
import ReturnRoute from './routes/return.route.js';
import NotificationRoute from './routes/notification.route.js';
import ChatRoute from './routes/chat.route.js';
import { Authentication } from './middlewares/auth.middleware.js';
import { ErrorHandle_H } from './utils/helper.js';

const appServer = express();
appServer.use(express.json());
appServer.use(express.urlencoded({ extended: true }));
appServer.use(cors(CorsConfig));
appServer.use('/public', express.static(path.join(process.cwd(), 'public')))

const db_uri = process.env.DB_URI;

DB_Connect(db_uri, 'DB-Connected Successfully');

await new Promise((resolve) => {
    mongoose.connection.once("open", resolve);
});

if (process.env.NODE_ENV === 'production') {
    const flag = await mongoose.connection.db.collection("system_flags").findOne({ key: "seeded" });

    if (!flag) {
        await seedDatabase(false);

        await mongoose.connection.db.collection("system_flags").insertOne({ key: "seeded", value: true });
    }
    else {
        console.log("Already seeded - skipping");
    }
}

appServer.get('/api/health', async (req, res) => {
    res.status(200).json({ message: 'API health is good!' });
});

// Mount Swagger UI
const swaggerPath = path.join(process.cwd(), 'docs', 'swagger-output.json');
let swaggerDocument = {};
try {
    swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
} catch (err) {
    console.warn('⚠️ swagger-output.json missing. Run `npm run build:swagger` first.');
}

// Serve Swagger UI
appServer.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { swaggerOptions: { persistAuthorization: true } }));

appServer.use('/api/auth', AuthRoute);
appServer.use('/api/admin', Authentication, AdminRoute);
appServer.use('/api/permission', Authentication, PermissionsRoute);
appServer.use('/api/role', Authentication, RolesRoute)
appServer.use('/api/staff', Authentication, StaffRoute);
appServer.use('/api/vendor', Authentication, VendorRoute);
appServer.use('/api/category', Authentication, CategoryRoute);
appServer.use('/api/product', ProductRoute);
appServer.use('/api/cart', Authentication, CartRoute);
appServer.use('/api/notification', Authentication, NotificationRoute)
appServer.use('/api/payment', Authentication, PaymentRoute);
appServer.use('/api/payout-vendor', Authentication, PayoutRoute);
appServer.use('/api/order', Authentication, OrderRoute);
appServer.use('/api/return', Authentication, ReturnRoute);
appServer.use('/api/user', Authentication, UserRoute);
appServer.use('/api/dashboard', Authentication, DashboardRoute);
appServer.use('/api/backup', Authentication, BackupRoute);
appServer.use('/api/chat', ChatRoute);

appServer.use((err, req, res, next) => {
    const handled = ErrorHandle_H(err);

    return res.status(handled.status || 500).json({
        success: false, 
        message: handled.message,
        errors: handled.errors || null
    });
});

const port = process.env.PORT;

const baseUrl = process.env.NODE_ENV === 'development' ? `http://localhost:${port}/api-docs` : `${process.env.BASE_URL}`;

appServer.listen(port, () => console.log(`Server is running at ${baseUrl}`));