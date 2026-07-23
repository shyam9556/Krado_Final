import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GIF_URLS = [
  "https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif",
  "https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif",
  "https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif",
  "https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif",
  "https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif",
  "https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif",
  "https://motionsites.ai/assets/hero-vitara-preview-Cjz2QYyU.gif",
  "https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif",
  "https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif",
  "https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif",
  "https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif",
  "https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif",
  "https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif",
  "https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif",
  "https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif",
  "https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif",
  "https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif",
  "https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif",
  "https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif",
  "https://motionsites.ai/assets/hero-celestia-preview-0yO3jXO8.gif"
];

const videosDir = path.join(__dirname, 'public', 'videos');

async function downloadAndConvert() {
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }

  console.log('Starting GIF downloads and MP4 conversions...');
  console.log('Ensure you have ffmpeg installed and available in your PATH.\n');

  for (const url of GIF_URLS) {
    const filename = url.split('/').pop();
    const basename = filename.replace('.gif', '');
    const gifPath = path.join(videosDir, filename);
    const mp4Path = path.join(videosDir, `${basename}.mp4`);

    if (fs.existsSync(mp4Path)) {
      console.log(`Skipping ${basename}.mp4, already exists.`);
      continue;
    }

    try {
      console.log(`Fetching ${filename}...`);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(gifPath, Buffer.from(buffer));

      console.log(`Converting ${filename} to MP4...`);
      // Use local ffmpeg binary
      const ffmpegPath = path.join(__dirname, 'ffmpeg-bin', 'ffmpeg-master-latest-win64-gpl', 'bin', 'ffmpeg.exe');
      const command = `"${ffmpegPath}" -y -i "${gifPath}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "${mp4Path}"`;
      await execAsync(command);

      console.log(`Successfully created ${basename}.mp4`);
      
      // Clean up original GIF
      fs.unlinkSync(gifPath);
    } catch (err) {
      console.error(`Error processing ${filename}:`, err.message);
    }
  }
  console.log('\nAll done! MP4s are ready in /public/videos/');
}

downloadAndConvert();
