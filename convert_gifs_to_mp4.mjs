import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Only the 10 GIFs actually used in ProjectMarquee.tsx ──────────────────
const GIF_URLS = [
  // ROW 1
  "https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif",
  "https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif",
  "https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif",
  "https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif",
  "https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif",
  // ROW 2
  "https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif",
  "https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif",
  "https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif",
  "https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif",
  "https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif",
];

// Output directories
const videosDir  = path.join(__dirname, 'public', 'videos');
const postersDir = path.join(__dirname, 'public', 'images', 'posters');

// Local ffmpeg binary (portable, no install needed)
const ffmpegPath = path.join(
  __dirname,
  'ffmpeg-bin',
  'ffmpeg-master-latest-win64-gpl',
  'bin',
  'ffmpeg.exe'
);

async function downloadAndConvert() {
  // Ensure output dirs exist
  fs.mkdirSync(videosDir,  { recursive: true });
  fs.mkdirSync(postersDir, { recursive: true });

  if (!fs.existsSync(ffmpegPath)) {
    console.error(`\n❌ ffmpeg not found at:\n   ${ffmpegPath}`);
    console.error('   Run the download + extract step first.\n');
    process.exit(1);
  }

  console.log(`\n🎬 Starting conversion of ${GIF_URLS.length} GIFs...\n`);

  // Helper: fetch with retries (handles ECONNRESET on large GIF downloads)
  async function fetchWithRetry(url, retries = 3, delayMs = 2000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res;
      } catch (err) {
        if (attempt === retries) throw err;
        console.log(`   ⚠️  Attempt ${attempt} failed (${err.message}). Retrying in ${delayMs / 1000}s...`);
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }

  for (const url of GIF_URLS) {
    const filename  = url.split('/').pop();          // hero-xxx.gif
    const basename  = filename.replace('.gif', '');  // hero-xxx
    const gifPath   = path.join(videosDir, filename);
    const mp4Path   = path.join(videosDir,  `${basename}.mp4`);
    const webpPath  = path.join(postersDir, `${basename}.webp`);

    const mp4Done  = fs.existsSync(mp4Path);
    const webpDone = fs.existsSync(webpPath);

    if (mp4Done && webpDone) {
      console.log(`✅ Skipping ${basename} — both outputs already exist.`);
      continue;
    }

    try {
      // ── 1. Download GIF (with retry) ──────────────────────────────────
      console.log(`⬇️  Downloading ${filename}...`);
      const response = await fetchWithRetry(url);
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(gifPath, Buffer.from(buffer));
      console.log(`   Saved GIF (${(buffer.byteLength / 1024).toFixed(0)} KB)`);

      // ── 2. Convert GIF → MP4 (H.264, GPU-friendly, web-optimised) ─────
      if (!mp4Done) {
        console.log(`🎞️  Converting → MP4...`);
        const mp4Cmd = [
          `"${ffmpegPath}"`,
          `-y -i "${gifPath}"`,
          `-movflags faststart`,
          `-pix_fmt yuv420p`,
          `-vf "scale=trunc(iw/2)*2:trunc(ih/2)*2"`,
          `-crf 26`,
          `-preset fast`,
          `"${mp4Path}"`
        ].join(' ');
        await execAsync(mp4Cmd);
        const mp4Size = (fs.statSync(mp4Path).size / 1024).toFixed(0);
        console.log(`   ✅ MP4 saved (${mp4Size} KB) → public/videos/${basename}.mp4`);
      }

      // ── 3. Extract first frame → WebP (static poster) ─────────────────
      if (!webpDone) {
        console.log(`🖼️  Extracting poster → WebP...`);
        const webpCmd = [
          `"${ffmpegPath}"`,
          `-y -i "${gifPath}"`,
          `-vframes 1`,
          `-quality 82`,
          `"${webpPath}"`
        ].join(' ');
        await execAsync(webpCmd);
        const webpSize = (fs.statSync(webpPath).size / 1024).toFixed(0);
        console.log(`   ✅ WebP poster saved (${webpSize} KB) → public/images/posters/${basename}.webp`);
      }

      // ── 4. Clean up GIF ───────────────────────────────────────────────
      if (fs.existsSync(gifPath)) {
        fs.unlinkSync(gifPath);
        console.log(`   🗑️  GIF removed.`);
      }

      console.log('');
    } catch (err) {
      // Per-GIF error — log and continue with next one
      console.error(`\n❌ Failed processing ${basename}: ${err.message}`);
      // Clean up partial GIF download if present
      if (fs.existsSync(gifPath)) fs.unlinkSync(gifPath);
      console.log('   Skipping — will need to re-run script for this file.\n');
    }
  }

  console.log('─────────────────────────────────────────────');
  console.log('🎉  All done!');
  console.log(`   Videos  → public/videos/`);
  console.log(`   Posters → public/images/posters/`);
  console.log('─────────────────────────────────────────────\n');
}

downloadAndConvert().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
