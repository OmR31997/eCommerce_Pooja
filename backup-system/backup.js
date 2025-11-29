import mongoose from "mongoose";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 
export const CreateBackup = async () => {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    const backupDir = path.join(__dirname, 'tmp');

    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }

    const fileName = `backup-${Date.now()}.json`;
    const backupPath = path.join(backupDir, fileName);

    let fullBackup = {};

    // Dump each collection
    for (const col of collections) {
        const data = await db.collection(col.name).find({}).toArray();
        fullBackup[col.name] = data;
    }

    // Save dump file
    fs.writeFileSync(backupPath, JSON.stringify(fullBackup, null, 2));

    return { success: true, message: "Backup created", fileName, backupPath };
}