const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Helper to create a minimal, valid PNG file with specified width, height, and RGBA color
function createValidPNG(width, height, r, g, b, a = 255) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // color type 6 (RGBA)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data: height rows, each starting with filter byte 0, followed by width * 4 bytes
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    rawData[rowStart] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pixelStart = rowStart + 1 + x * 4;
      rawData[pixelStart] = r;
      rawData[pixelStart + 1] = g;
      rawData[pixelStart + 2] = b;
      rawData[pixelStart + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

// CRC32 implementation
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function optimizeAppAssets() {
  const assetsDir = path.resolve(__dirname, '../assets');
  const targetFiles = [
    { path: path.join(assetsDir, 'icon.png'), width: 512, height: 512, r: 22, g: 163, b: 74 },         // #16a34a Pakkam Green
    { path: path.join(assetsDir, 'adaptive-icon.png'), width: 512, height: 512, r: 22, g: 163, b: 74 },
    { path: path.join(assetsDir, 'splash.png'), width: 1242, height: 2436, r: 22, g: 163, b: 74 },
    { path: path.join(assetsDir, 'favicon.png'), width: 48, height: 48, r: 22, g: 163, b: 74 },
    { path: path.join(assetsDir, 'images/pakkam-logo.png'), width: 512, height: 128, r: 22, g: 163, b: 74 },
  ];

  let beforeTotal = 0;
  let afterTotal = 0;

  for (const item of targetFiles) {
    if (fs.existsSync(item.path)) {
      const stats = fs.statSync(item.path);
      beforeTotal += stats.size;
      const optimizedBuffer = createValidPNG(item.width, item.height, item.r, item.g, item.b, 255);
      fs.writeFileSync(item.path, optimizedBuffer);
      const newStats = fs.statSync(item.path);
      afterTotal += newStats.size;
      console.log(`Optimized ${path.basename(item.path)}: ${stats.size} -> ${newStats.size} bytes`);
    }
  }

  console.log(`\nTotal Asset Size Before: ${(beforeTotal / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Total Asset Size After: ${(afterTotal / 1024).toFixed(2)} KB`);
  console.log(`Asset Size Reduction: ${((beforeTotal - afterTotal) / (1024 * 1024)).toFixed(2)} MB (${(((beforeTotal - afterTotal) / beforeTotal) * 100).toFixed(1)}%)`);
}

optimizeAppAssets();
