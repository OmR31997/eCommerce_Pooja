// ./config/swagger.config.js
import swaggerAutogen from 'swagger-autogen';

const outputFile = './docs/swagger-output.json';   // generated file path
const endpointsFiles = ['./server.js', './routes/*.js'];           // file that loads all routes


const isProd = process.env.NODE_ENV === 'production';
const host = isProd ? process.env.PROD_HOST || 'ecommerce-pooja.onrender.com' : 'localhost:9000';
const schemes = isProd ? ['https'] : ['http'];

const doc = {
  info: {
    title: 'E-Commerce API',
    description: 'Automatically generated Swagger documentation',
    version: '1.0.0',
  },
  host,
  basePath: '/',
  schemes,
  tags: [
    { name: 'Auth', description: 'Authentication routes' },
    { name: 'Admin', description: 'Admin routes' },
    { name: 'Vendor', description: 'Vendor routes' },
    { name: 'Customer', description: 'Customer/User management routes' },
    { name: 'Category', description: 'Product category routes' },
    { name: 'Product', description: 'Product routes' },
    { name: 'Cart', description: 'Cart management routes' },
    { name: 'Order', description: 'Order management routes' },
    { name: 'Payment', description: 'Payment management routes' },
  ],
};

swaggerAutogen()(outputFile, endpointsFiles, doc).then(() => {
  console.log(`✅ Swagger JSON generated at: ${outputFile}`);
});
