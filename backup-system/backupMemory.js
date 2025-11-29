import mongoose from "mongoose";
import XLSX from 'xlsx';
import { zipSync, strToU8 } from 'fflate';

export async function CreateBackupInMemory(jsonData) {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    let finalDump = {};

    for (const col of collections) {
        const data = await db.collection(col.name).find({}).toArray();
        finalDump[col.name] = data;
    }

    // Convert to Buffer (so we can send as file)
    const jsonBuffer = Buffer.from(JSON.stringify(finalDump, null, 2));

    return jsonBuffer;
}

export const CreateExcelBuffer = async (jsonData) => {
    const wb = XLSX.utils.book_new();

    for (const [sheetName, docs] of Object.entries(jsonData)) {
        if (!Array.isArray(docs) || docs.length === 0) {
            const ws = XLSX.utils.aoa_to_sheet([["(empty"]]);
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
            continue;
        }

        const ws = XLSX.utils.json_to_sheet(docs);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

export const CreateZipBuffer = async (fileNameInsideZip, excelBuffer) => {
    const zipped = zipSync({
        [fileNameInsideZip]: new Uint8Array(excelBuffer)
    });

    return Buffer.from(zipped);
}