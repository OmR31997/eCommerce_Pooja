import express from 'express';
import './config/env.config.js';
import cors from 'cors';
import CorsConfig from '../server-app/config/cors.config.js';
import {DB_Connect, DB_Disconnect} from './config/db.config.js';

import AuthRoute from './routes/auth.route.js'; 
import AdminRoute from './routes/admin.route.js';
import VendorRoute from './routes/vendor.route.js';
import CategoryRoute from './routes/category.route.js';
import { authentication, authorization } from './middlewares/auth.middleware.js';

const appServer = express();
appServer.use(express.json());
appServer.use(express.urlencoded({extended: true}));
appServer.use(cors(CorsConfig));

const db_uri = process.env.DB_URI;
DB_Connect(db_uri);

appServer.get('/api/health', async (req, res) => {
    res.status(200).json({message: 'API health is good!'});
});

appServer.use('/api/auth', AuthRoute);
appServer.use('/api/admin', authentication, authorization.ADMIN, AdminRoute);
appServer.use('/api/vendor', VendorRoute);
appServer.use('/api/category', authentication, authorization.ADMIN, CategoryRoute);

const port = process.env.PORT;
appServer.listen(port, () => console.log(`Server is running at http://localhost:${port}/api/health`));