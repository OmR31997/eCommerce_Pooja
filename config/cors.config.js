export default {
    origin: [process.env.DEV_CLIENT_0, process.env.DEV_CLIENT_1],
    method: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}