import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, 'public');

// Images to compress and convert to webp
const imagesToProcess = [
  'highlight-real.jpg',
  'highlight-tall-v2.png',
  'highlight-tall.jpg',
  'jivraj-tall-v2.png',
  'jivraj-tall.jpg',
  'work-01.png',
  'work-02.png',
  'work-03.png',
  'work-04.png',
  'work-highlight.png',
  'work-hrpl.png',
  'work-jivraj.png'
];

async function processImages() {
  for (const imgName of imagesToProcess) {
    const inputPath = path.join(publicDir, imgName);
    if (!fs.existsSync(inputPath)) {
      console.log(`Skipping ${imgName}, does not exist.`);
      continue;
    }

    const ext = path.extname(imgName);
    const base = path.basename(imgName, ext);
    const outputPath = path.join(publicDir, `${base}.webp`);

    console.log(`Processing ${imgName} -> ${base}.webp...`);
    try {
      await sharp(inputPath)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);
      
      console.log(`Successfully converted ${imgName} to WebP.`);
      
      // Delete original to save space
      fs.unlinkSync(inputPath);
    } catch (err) {
      console.error(`Error processing ${imgName}:`, err);
    }
  }
}

processImages();
