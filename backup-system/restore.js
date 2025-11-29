import mongoose from "mongoose"
import fs from 'fs';

export const RestoreDB = async (backupFilePath, mongoUrl) => {
    await mongoose.connect(mongoUrl);
    const db = mongoose.connection.db;

    const backupData = JSON.parse(fs.readFileSync(backupFilePath));

    for (const [collectionName, docs] of Object.entries(backupData)) {
        const collection = db.collection(collectionName);

        await collection.deleteMany({});

        if (docs.length > 0) {
            await collection.insertMany(docs);
        }
    }

    console.log("Database restored successfully!");
    process.exit();
}