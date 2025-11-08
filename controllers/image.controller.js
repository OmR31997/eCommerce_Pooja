import { imageDecryption } from "../services/token.service.js";
import path from 'path';
import fs from 'fs';

export const read_path = async (req, res) => {
    try {
        const { token } = req.params;
        const realPath = imageDecryption(token);

        if (!realPath) {
            return res.status(404).json({
                error: 'Invalid or expired token',
                success: false,
            });
        }

        const absolutePath = path.join(process.cwd(), realPath);

        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({
                error: 'Image not found on server',
                success: false,
            });
        }

        // Serve actual image
        res.sendFile(absolutePath);
    } 
    catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Internal Server Error',
            success: false,
        });
    }
}