import express from 'express';
import './config/env.config.js';
import cors from 'cors';
import CorsConfig from '../server-app/config/cors.config.js';
import { DB_Connect } from './config/db.config.js';
import { seedDatabase } from './seeds/seed.js';
import mongoose from 'mongoose';

import AuthRoute from './routes/auth.route.js';
import AdminRoute from './routes/admin.route.js';
import VendorRoute from './routes/vendor.route.js';
import CategoryRoute from './routes/category.route.js';
import ProductRoute from './routes/product.route.js';
import CartRoute from './routes/cart.route.js';
import OrderRoute from './routes/order.route.js';

import { authentication, authorization } from './middlewares/auth.middleware.js';

const appServer = express();
appServer.use(express.json());
appServer.use(express.urlencoded({ extended: true }));
appServer.use(cors(CorsConfig));

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

appServer.use('/api/auth', AuthRoute);
appServer.use('/api/admin', authentication, authorization.ADMIN, AdminRoute);
appServer.use('/api/vendor', VendorRoute);
appServer.use('/api/category', CategoryRoute);
appServer.use('/api/product', ProductRoute);
appServer.use('/api/cart', CartRoute);
appServer.use('/api/order', OrderRoute);

const port = process.env.PORT;
appServer.listen(port, () => console.log(`Server is running at http://localhost:${port}/api/health`));