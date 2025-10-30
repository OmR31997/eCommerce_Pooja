import mongoose from "mongoose";

export const DB_Connect = async (DB_URI) => {
    
    if (!DB_URI || DB_URI.length === 0) {
        console.log('DB_URI Missing');
    }

    try {
        const db_response = await mongoose.connect(DB_URI);

        if(db_response) {
            console.log('DB Connected Successfully');
        }
    } catch (error) {
        console.log(`DB Connection Error: `, error);
    }
}

export const DB_Disconnect = async () => {
    try {
        await mongoose.disconnect();
        console.log('DB Disconnected');
    } catch (error) {
        console.log(`DB Connection Error: `, error);
    }
}