import fs from 'fs';
import zlib from 'zlib';

export const CompressFile = (inputPath) => {
    return new Promise((resolve, reject) => {
        const outputPath = `${inputPath}.gz`;
        
        const input = fs.createReadStream(inputPath);
        const output = fs.createWriteStream(outputPath);
        const gZip = zlib.createGzip();

        input.pipe(gZip).pipe(output).on('finish', () => {
            resolve(outputPath);
        }).on('error', reject);
    });
}