import swaggerAutogen from 'swagger-autogen';

const outputFile = './doc/swagger-output.json';   // Auto-generated file
const endpointsFiles = ['./server.js'];       // Your main server file

const doc = {
  info: {
    title: 'eCommerce Secure API',
    description: 'Auto-generated API documentation',
    version: '1.0.0',
  },
  host: process.env.NODE_ENV==='development' ? 'localhost:9000':process.env.BASE_URL,   // Change to production host when deploying
  schemes: ['http'],
  tags: [
    { name: 'Auth', description: 'Authentication routes' },
    { name: 'Admin', description: 'Admin routes' },
    { name: 'Vendor', description: 'Vendor routes' },
    { name: 'Category', description: 'Product category routes' },
    { name: 'Product', description: 'Product routes' },
    { name: 'Cart', description: 'Cart management routes' },
    { name: 'Order', description: 'Order management routes' },
  ],
};

swaggerAutogen()(outputFile, endpointsFiles, doc).then(() => {
  console.log('Swagger JSON generated successfully!');
});
