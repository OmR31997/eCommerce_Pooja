import swaggerAutogen from 'swagger-autogen';
import path from 'path';
import fs from 'fs';

const outputFile = './docs/swagger-output.json';
const endpointsFiles = ['./server.js', './routes/*.js'];

const isProd = process.env.NODE_ENV === 'production';
const host = isProd ? 'ecommerce-pooja.onrender.com' : 'localhost:9000';
const schemes = isProd ? ['https'] : ['http'];

const doc = {
  openapi: '3.0.0', // 🔥 NEW — modern API version
  info: {
    title: 'E-Commerce API',
    description: 'Automatically generated Swagger documentation',
    version: '1.0.0',
  },
  servers: [
    {
      url: `${schemes[0]}://${host}`,
      description: isProd ? 'Production Server' : 'Local Dev Server'
    }
  ],
  consumes: ['application/json', 'multipart/form-data'],
  produces: ['application/json'],

  tags: [
    { name: 'Auth', description: 'Authentication routes' },
    { name: 'Dashboard', description: 'Dashboard routes' },
    { name: 'Admin', description: 'Admin routes' },
    { name: 'Staff', description: 'Staff management routes' },
    { name: 'Vendor', description: 'Vendor management routes' },
    { name: 'Customer', description: 'Customer/User management routes' },
    { name: 'Category', description: 'Product category management routes' },
    { name: 'Permission', description: 'Permissions routes' },
    { name: 'Role', description: 'Roles routes' },
    { name: 'Product', description: 'Product management routes' },
    { name: 'Cart', description: 'Cart management routes' },
    { name: 'Order', description: 'Order management routes' },
    { name: 'Payment', description: 'Payment management routes' },
    { name: 'API Testing', description: 'Health check & testing endpoints' }
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: `Enter JWT token as: Bearer <your_token>`
      }
    }
  },

  security: [{ bearerAuth: [] }]
};

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc)
  .then(() => {
    console.log(`Swagger JSON generated at: ${outputFile}`);

    const jsonPath = path.resolve(outputFile);
    const swagger = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    // Assign tags dynamically based on route
    Object.keys(swagger.paths).forEach(route => {
      const tag = getTagFromRoute(route);

      if (tag) {
        Object.keys(swagger.paths[route]).forEach(method => {
          swagger.paths[route][method].tags = [tag];
        });
      }
    });

    fs.writeFileSync(jsonPath, JSON.stringify(swagger, null, 2));
    console.log('Tags assigned successfully with name & description!');
  });

/* ---------------------------------------------------
   TAG MAPPING FUNCTION (Improved & cleaner)
--------------------------------------------------- */
const getTagFromRoute = (route) => {
  const mapping = {
    '/auth': 'Auth',
    '/dashboard': 'Dashboard',
    '/admin': 'Admin',
    '/permission': 'Permission',
    '/role': 'Role',
    '/staff': 'Staff',
    '/vendor': 'Vendor',
    '/user': 'Customer',
    '/category': 'Category',
    '/product': 'Product',
    '/cart': 'Cart',
    '/order': 'Order',
    '/payment': 'Payment',
    '/health': 'API Testing'
  };

  return Object.entries(mapping).find(([key]) => route.includes(key))?.[1] || null;
};
