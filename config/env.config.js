import { config } from "dotenv";
config();

export const ENV = {
    NODE_ENV: process.env.NODE_ENV || "development",
    IS_DEV: process.env.NODE_ENV === "development",
    IS_PROD: process.env.NODE_ENV === "production",
};
