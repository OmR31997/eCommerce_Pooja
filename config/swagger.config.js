import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'eCommerce Secured API',
      version: '1.0.0',
      description: 'API documentation using Swagger UI',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    servers: [
      {
        url: process.env.NODE_ENV !== 'development'
          ? `${process.env.BASE_URL}/api`
          : 'http://localhost:9000/api',
      },
    ],
  },
  apis: ['./routes/**/*.js'],
};


const swaggerSpec = swaggerJSDoc(swaggerOptions);

export { swaggerUi, swaggerSpec };