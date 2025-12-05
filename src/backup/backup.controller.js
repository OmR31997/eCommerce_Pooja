import { CreateBackup } from "../../backup-system/backup.js";
import { CompressFile } from '../../backup-system/compress.js';
import { RestoreDB } from '../../backup-system/restore.js';
import fs from 'fs';
import { CreateBackupInMemory, CreateExcelBuffer, CreateZipBuffer } from "../../backup-system/backupMemory.js";

export const create_backup = async (req, res) => {
    try {
        if (!['admin', 'super_admin'].includes(req.user.role)) {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to create backup`,
                success: false,
            }
        }

        // Checking... Secret Key
        const securedKey = req.headers['x-backup-key'];
        if (!securedKey || securedKey !== process.env.BACKUP_SECRET) {
            throw {
                status: 403,
                message: `Invalid backup key or not provided`,
                success: false,
            }
        }

        // Execute CreateBackup - Creating Backup
        const { fileName, backupPath } = await CreateBackup();

        // Execute CompressFile - Creating Compressed File
        const zipPath = await CompressFile(backupPath);

        res.download(backupPath, fileName, (error) => {
            if(error) {
                console.error("Download error:", error);
            }

            setTimeout(() => {
                try {
                    fs.unlinkSync(backupPath);
                    fs.unlinkSync(zipPath);
                    console.log("Backup files deleted automatically");
                } catch (error) {
                    console.error("Error deleting files:", error);
                }
            }, 5*60*1000)
        });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message, success: error.success })
        }
        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

export const restore_backup = async (req, res) => {
    try {
        const { mongoUri, fileName } = req.query;

        if (req.user.role !== 'super_admin') {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to restore`,
                success: false,
            }
        }

        if (!mongoUri || !fileName) {
            throw {
                status: 400,
                message: `Fields: 'mongo_Uri' & 'fileName' must be Required!`,
                success: false
            }
        }

        await RestoreDB(`../backup-system/tmp/${fileName}`, mongo_Uri);
        return res.status(200).json({ message: 'Database restored successfully', success: true })

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message, success: error.success })
        }
        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}

export const backup_in_excel = async (req, res) => {
    try {

        if (!['admin', 'super_admin'].includes(req.user.role)) {
            throw {
                status: 401,
                message: `Unauthorized: You don't have permission to create backup`,
                success: false,
            }
        }

        // Checking... Secret Key
        const securedKey = req.headers['x-backup-key'];
        if (!securedKey || securedKey !== process.env.BACKUP_SECRET) {
            throw {
                status: 403,
                message: `Invalid backup key or not provided`,
                success: false,
            }
        }

        const jsonBuffer = await CreateBackupInMemory();

        const jsonData = JSON.parse(jsonBuffer.toString());

        const excelBuffer = await CreateExcelBuffer(jsonData);

        // const compressed = zlib.gzipSync(excelBuffer);
        // const jsonFileName = `backup-${Date.now()}.json.gz`;


        const zipFileName = `backup-${Date.now()}.zip`;
        const zipBuffer = await CreateZipBuffer(`backup-${Date.now()}.xlsx`, excelBuffer);

        // Set Headers (so browser triggers download)
        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", `attachment; filename="${zipFileName}"`);
        res.setHeader("Content-Length", zipBuffer.length);


        return res.end(zipBuffer);

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message, success: error.success })
        }
        return res.status(500).json({ success: false, error: `Internal Server Error ${error}` });
    }
}