const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Standard CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

function encodePng(width, height, pixelBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(rowLength * height);

  for (let y = 0; y < height; y++) {
    const rawOffset = y * rowLength;
    rawData[rawOffset] = 0; // Filter None
    const srcOffset = y * width * 4;
    pixelBuffer.copy(rawData, rawOffset + 1, srcOffset, srcOffset + width * 4);
  }

  const idatChunk = makeChunk('IDAT', zlib.deflateSync(rawData));
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

/**
 * Generate a modern, stylized Turbo-Fox / Speed-Globe browser icon.
 * Inspired by UC Browser's energetic orange mascot aesthetic, but unique, modern, and sleek.
 */
function generateBrandIcon(size, isAdaptive = false) {
  const buffer = Buffer.alloc(size * size * 4);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = isAdaptive ? size * 0.44 : size * 0.46;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx); // -PI to PI

      // Base background gradient: Vibrant UC Orange (#FF4500 to #FFA500)
      const gradT = (x + y) / (size * 2);
      let r = Math.round(255 * (1 - gradT * 0.1));
      let g = Math.round(68 + gradT * 105);
      let b = Math.round(0 + gradT * 20);
      let a = 255;

      if (!isAdaptive) {
        // Rounded squircle container
        const cornerR = size * 0.22;
        const qx = Math.max(0, Math.abs(dx) - (cx - cornerR));
        const qy = Math.max(0, Math.abs(dy) - (cy - cornerR));
        const qDist = Math.sqrt(qx * qx + qy * qy);

        if (qDist > cornerR) {
          a = 0;
          buffer[idx] = 0;
          buffer[idx + 1] = 0;
          buffer[idx + 2] = 0;
          buffer[idx + 3] = 0;
          continue;
        } else if (qDist > cornerR - 1.5) {
          a = Math.round(255 * (cornerR - qDist) / 1.5);
        }
      }

      // 1. Sleek Turbo Outer Ring Orbit
      const ringInner = outerR * 0.78;
      const ringOuter = outerR * 0.95;
      if (dist >= ringInner && dist <= ringOuter) {
        // Arc opening on top-right for dynamic velocity look
        const inArc = angle < 0.8 && angle > -2.6;
        if (inArc) {
          const ringAlpha = (1 - Math.abs(dist - (ringInner + ringOuter) / 2) / ((ringOuter - ringInner) / 2));
          const blend = Math.max(0, Math.min(1, ringAlpha * 0.9));
          r = Math.round(r * (1 - blend) + 255 * blend);
          g = Math.round(g * (1 - blend) + 255 * blend);
          b = Math.round(b * (1 - blend) + 255 * blend);
        }
      }

      // 2. Stylized Speed Fox / Turbo Mascot Silhouette in Center (White & Gold)
      // Head base circle & ears
      const headDist = Math.sqrt(dx * dx + (dy + size * 0.04) * (dy + size * 0.04));
      const headR = size * 0.24;

      // Ears: Two sharp triangles at top
      const leftEar = (dx > -size * 0.26 && dx < -size * 0.06 && dy < -size * 0.08 && dy > -size * 0.36 && (dx * 1.6 + dy) < -size * 0.12);
      const rightEar = (dx < size * 0.26 && dx > size * 0.06 && dy < -size * 0.08 && dy > -size * 0.36 && (-dx * 1.6 + dy) < -size * 0.12);

      // Snout: downward sharp chevron
      const snout = (dy > -size * 0.02 && dy < size * 0.22 && Math.abs(dx) < (size * 0.22 - dy) * 0.9);

      const inMascot = headDist < headR || leftEar || rightEar || snout;

      if (inMascot) {
        // Fox white fur with subtle pearlescent shading
        const shade = 1 - (dy / size) * 0.25;
        r = Math.min(255, Math.round(255 * shade));
        g = Math.min(255, Math.round(250 * shade));
        b = Math.min(255, Math.round(245 * shade));

        // Fox inner ears (Warm Orange Gold)
        const leftInnerEar = (dx > -size * 0.22 && dx < -size * 0.10 && dy < -size * 0.12 && dy > -size * 0.30);
        const rightInnerEar = (dx < size * 0.22 && dx > size * 0.10 && dy < -size * 0.12 && dy > -size * 0.30);
        if (leftInnerEar || rightInnerEar) {
          r = 255;
          g = 138;
          b = 40;
        }

        // Fox sleek speed eyes (Vibrant Deep Blue / Cyan glow)
        const leftEye = Math.sqrt((dx + size * 0.09) * (dx + size * 0.09) + (dy + size * 0.01) * (dy + size * 0.01)) < size * 0.038;
        const rightEye = Math.sqrt((dx - size * 0.09) * (dx - size * 0.09) + (dy + size * 0.01) * (dy + size * 0.01)) < size * 0.038;
        if (leftEye || rightEye) {
          r = 24;
          g = 43;
          b = 73;
        }

        // Cute dark nose tip
        const noseDist = Math.sqrt(dx * dx + (dy - size * 0.18) * (dy - size * 0.18));
        if (noseDist < size * 0.026) {
          r = 30;
          g = 30;
          b = 36;
        }
      }

      // 3. Dynamic Lightning / Speed Dash across bottom
      if (dy > size * 0.22 && dy < size * 0.30 && Math.abs(dx + dy * 0.2) < size * 0.32) {
        const dashBlend = 0.85;
        r = Math.round(r * (1 - dashBlend) + 255 * dashBlend);
        g = Math.round(g * (1 - dashBlend) + 215 * dashBlend);
        b = Math.round(b * (1 - dashBlend) + 0 * dashBlend);
      }

      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }

  return encodePng(size, height = size, buffer);
}

// Generate the icons
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

console.log('Generating high-res brand icons...');

const appIcon = generateBrandIcon(1024, false);
const adaptiveIcon = generateBrandIcon(1024, true);
const splashIcon = generateBrandIcon(1024, false);
const favicon = generateBrandIcon(512, false);

fs.writeFileSync(path.join(assetsDir, 'icon.png'), appIcon);
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), adaptiveIcon);
fs.writeFileSync(path.join(assetsDir, 'splash-icon.png'), splashIcon);
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), favicon);

// Also generate for Android mipmaps
const resDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

const mipmapConfigs = [
  { dir: 'mipmap-mdpi', size: 48 },
  { dir: 'mipmap-hdpi', size: 72 },
  { dir: 'mipmap-xhdpi', size: 96 },
  { dir: 'mipmap-xxhdpi', size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

mipmapConfigs.forEach(cfg => {
  const targetFolder = path.join(resDir, cfg.dir);
  if (fs.existsSync(targetFolder)) {
    const iconPng = generateBrandIcon(cfg.size, false);
    const adaptiveFg = generateBrandIcon(cfg.size, true);
    fs.writeFileSync(path.join(targetFolder, 'ic_launcher.png'), iconPng);
    fs.writeFileSync(path.join(targetFolder, 'ic_launcher_round.png'), iconPng);
    fs.writeFileSync(path.join(targetFolder, 'ic_launcher_foreground.png'), adaptiveFg);
  }
});

// Also write splashscreen logos in drawables
const drawableConfigs = [
  'drawable-mdpi',
  'drawable-hdpi',
  'drawable-xhdpi',
  'drawable-xxhdpi',
  'drawable-xxxhdpi',
];

drawableConfigs.forEach(d => {
  const targetFolder = path.join(resDir, d);
  if (fs.existsSync(targetFolder)) {
    fs.writeFileSync(path.join(targetFolder, 'splashscreen_logo.png'), splashIcon);
  }
});

console.log('All brand and drawable icons generated successfully!');

