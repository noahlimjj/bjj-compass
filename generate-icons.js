// Icon generator for BJJ Compass PWA
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create SVG for the icon
const createSvg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#e63946"/>
      <stop offset="100%" style="stop-color:#8B0000"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#bg)"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.35}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="${size * 0.02}"/>
  <text x="${size/2}" y="${size/2 + size * 0.12}" font-family="Arial Black, sans-serif" font-size="${size * 0.5}" font-weight="bold" fill="white" text-anchor="middle">B</text>
</svg>
`;

async function generateIcons() {
  const publicDir = path.join(__dirname, 'public');
  
  for (const size of sizes) {
    const svg = createSvg(size);
    const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);
    
    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);
    console.log(`Generated: icon-${size}x${size}.png`);
  }
  
  // Also create pwa icons
  for (const size of [192, 512]) {
    const svg = createSvg(size);
    const outputPath = path.join(publicDir, `pwa-${size}x${size}.png`);
    
    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);
    console.log(`Generated: pwa-${size}x${size}.png`);
  }
  
  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
