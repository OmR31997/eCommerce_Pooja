import mongoose from "mongoose";

export const DB_Connect = async (DB_URI, DB_Message) => {

    if (!DB_URI || DB_URI.length === 0) {
        throw new Error('DB_URI is missing!');
    }

    try {
        const db_response = await mongoose.connect(DB_URI);

        if (db_response) {
            console.log(DB_Message);
        }
    } catch (error) {
        console.log(`DB Connection Error: `, error);
    }
}

export const DB_Disconnect = async (DB_Message) => {
    try {
        await mongoose.disconnect();
        console.log(DB_Message);
    } catch (error) {
        console.log(`DB Connection Error: `, error);
    }
}