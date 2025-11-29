import fs from 'fs';
import path from 'path';

const TMP_DIR = path.join(process.cwd(), "backup-system/tmp");
const HRS = 0.25;
const MAX_DURATION = Math.floor(HRS * 60 ) * 60 * 1000;

export const AutoDeleteTMP = () => {
    try {
        if(!fs.existsSync(TMP_DIR)) return;

        const files = fs.readdirSync(TMP_DIR);

        files.forEach(file => {
            filePath = path.join(TMP_DIR, file);
            const stats = fs.statSync(filePath);

            const now = Date.now();
            const fileAge = now - stats.mtimeMs;

            if(fileAge > MAX_DURATION) {
                fs.unlinkSync(filePath);
                console.log(`[AUTO-DELETE] removed old file ->`, file);
            }
        });
    } catch (error) {
        console.log(`[AUTO-DELETE ERROR]: `, error);
    }
}