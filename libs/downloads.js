import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { createClient } from 'redis';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);



export const DOWNLOADS_DIR = path.dirname(__filename) + '/../downloads/';

export async function list(category) {
    const directory = DOWNLOADS_DIR;
    // Create a Redis client using database 3
    const client = createClient({
        db: 3
    });
    client.on('error', (err) => console.log('Redis Client Error', err));
    await client.connect();
    const treatedSet = 'treatedFiles-'+category; // Redis set to store treated file names


    try {
        const allFiles = [];
        // List all files in the directory
        const files = await readdir(directory);

        for (const file of files) {
            const filePath = join(directory, file);
            const fileStats = await stat(filePath);
            if (fileStats.isFile()) {
                const isTreated = await client.sIsMember(treatedSet, file);
                if (isTreated) continue;
                allFiles.push({ file, path: filePath })
            }
        }
        return allFiles;
    } catch (error) {
        console.error('Error processing files:', error);
    } finally {
        await client.quit();
    }
}

export async function treated(category, filePath) {

    // Create a Redis client using database 3
    const client = createClient({
        db: 3
    });
    client.on('error', (err) => console.log('Redis Client Error', err));
    await client.connect();
    const treatedSet = 'treatedFiles-'+category; // Redis set to store treated file names


    const fileName = path.basename(filePath);

    await client.sAdd(treatedSet, fileName);
    
    fs.unlinkSync(filePath);
}

/*

        // Check if the file has been treated
        const isTreated = await client.sIsMember(treatedSet, filePath);

        if (!isTreated) {
          // Add untreated file to the Redis set
          await client.sAdd(treatedSet, filePath);
          console.log(`File treated and added to Redis: ${filePath}`);
        }
*/