import swaggerAutogen from 'swagger-autogen';
import path from 'path';
import fs from 'fs';

const outputFile = './docs/swagger-output.json';         // generated file path
const endpointsFiles = ['./server.js', './routes/*.js']; // file that loads all routes

const isProd = process.env.NODE_ENV === 'production';
const host = isProd ? 'ecommerce-pooja.onrender.com' : 'localhost:9000';
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
  consumes: ['application/json', 'multipart/form-data'],
  tags: [
    { name: 'Auth', description: 'Authentication routes' },
    { name: 'Admin', description: 'Admin routes' },
    { name: 'Permission', description: 'Permissions routes' },
    { name: 'Role', description: 'Roles routes' },
    { name: 'Staff', description: 'Staff management routes' },
    { name: 'Vendor', description: 'Vendor management routes' },
    { name: 'Customer', description: 'Customer/User management routes' },
    { name: 'Category', description: 'Product category management routes' },
    { name: 'Product', description: 'Product management routes' },
    { name: 'Cart', description: 'Cart management routes' },
    { name: 'Order', description: 'Order management routes' },
    { name: 'Payment', description: 'Payment management routes' },
    { name: 'API Testing', description: 'To testing end-point' }
  ],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: `Enter JWT token as: **Bearer &lt;your_token&gt;**`,
    },
  },
  security: [{ bearerAuth: [] }],
};

swaggerAutogen()(outputFile, endpointsFiles, doc).then(() => {
  console.log(`Swagger JSON generated at: ${outputFile}`);

  const jsonPath = path.resolve(outputFile);
  const swagger = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  Object.keys(swagger.paths).forEach(route => {
    const tag = getTagsFromRoute(route);

    if (tag) {
      Object.keys(swagger.paths[route]).forEach(method => {
        swagger.paths[route][method].tags = [tag];
      });
    }
  });

  fs.writeFileSync(jsonPath, JSON.stringify(swagger, null, 2));
  console.log('Tags assigned successfully with name & description globally!');
});

const getTagsFromRoute = (route) => {
  if (route.includes('/auth')) return 'Auth';
  if (route.includes('/admin')) return 'Admin';
  if (route.includes('/permission')) return 'Permission';
  if (route.includes('/role')) return 'Role';
  if (route.includes('/staff')) return 'Staff';
  if (route.includes('/vendor')) return 'Vendor';
  if (route.includes('/user')) return 'Customer';
  if (route.includes('/category')) return 'Category';
  if (route.includes('/product')) return 'Product';
  if (route.includes('/cart')) return 'Cart';
  if (route.includes('/order')) return 'Order';
  if (route.includes('/payment')) return 'Payment';
  if (route.includes('/health')) return 'API Testing';
  return null;
}
