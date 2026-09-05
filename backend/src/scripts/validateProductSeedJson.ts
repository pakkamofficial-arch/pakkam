import fs from 'fs';
import path from 'path';

export const validateAndFixProductSeedJson = () => {
  const rootDir = process.cwd();
  const primarySeedPath = path.resolve(rootDir, 'data/product.seed.json');
  const fallbackPaths = [
    path.resolve(rootDir, 'data/products.seed.json'),
    path.resolve(rootDir, 'src/data/products.seed.json'),
  ];

  let targetPath = primarySeedPath;
  if (!fs.existsSync(primarySeedPath)) {
    for (const p of fallbackPaths) {
      if (fs.existsSync(p)) {
        targetPath = p;
        break;
      }
    }
  }

  console.log(`[ValidateJSON] Reading seed JSON from: ${targetPath}`);
  let rawContent = fs.readFileSync(targetPath, 'utf-8');

  // Clean any leading/trailing Markdown code fences or accidental text
  rawContent = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();

  // Strip accidental phrases like "Use code with caution."
  rawContent = rawContent.replace(/Use code with caution\./gi, '');

  let rawProducts: any[];
  try {
    rawProducts = JSON.parse(rawContent);
  } catch (err: any) {
    console.error('[ValidateJSON] Failed to parse JSON strictly. Attempting repair...', err.message);
    // Find first '[' and last ']'
    const firstBracket = rawContent.indexOf('[');
    const lastBracket = rawContent.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      const extracted = rawContent.substring(firstBracket, lastBracket + 1);
      rawProducts = JSON.parse(extracted);
    } else {
      throw err;
    }
  }

  if (!Array.isArray(rawProducts)) {
    throw new Error('[ValidateJSON] Expected JSON root to be an array of product objects');
  }

  console.log(`[ValidateJSON] Initial count: ${rawProducts.length} records.`);

  const seenKeys = new Set<string>();
  const cleanedProducts: any[] = [];
  let duplicatesRemoved = 0;

  for (let i = 0; i < rawProducts.length; i++) {
    const p = rawProducts[i];
    if (!p || typeof p !== 'object') continue;

    const name = String(p.name || '').trim();
    if (!name) continue;

    const unit = String(p.unit || '1 kg').trim();
    const key = (p.sku ? String(p.sku).trim() : `${name.toLowerCase()}_${unit.toLowerCase()}`);

    if (seenKeys.has(key)) {
      duplicatesRemoved++;
      continue;
    }
    seenKeys.add(key);

    let category = String(p.category || 'Vegetables').trim();
    if (category.toLowerCase() === 'grocery') category = 'Groceries';
    if (category.toLowerCase() === 'vegetables') category = 'Vegetables';
    if (category.toLowerCase() === 'fruits') category = 'Fruits';
    if (category.toLowerCase() === 'spices') category = 'Spices';
    if (category.toLowerCase() === 'dairy') category = 'Dairy';

    let image = String(p.image || p.images?.[0] || '').trim();
    if (!image || !image.startsWith('http')) {
      const queryName = encodeURIComponent(name);
      image = `https://placehold.co/600x600/png?text=${queryName}`;
    }

    const cleanedItem = {
      name,
      category,
      unit,
      purchasePrice: typeof p.purchasePrice === 'number' ? p.purchasePrice : 0,
      additionalCost: typeof p.additionalCost === 'number' ? p.additionalCost : 0,
      mrp: typeof p.mrp === 'number' ? p.mrp : (p.sellingPrice || p.price || 10),
      sellingPrice: typeof p.sellingPrice === 'number' ? p.sellingPrice : (p.price || 10),
      discountPercent: typeof p.discountPercent === 'number' ? p.discountPercent : 0,
      targetProfitMargin: typeof p.targetProfitMargin === 'number' ? p.targetProfitMargin : 0.20,
      minimumSellingPrice: typeof p.minimumSellingPrice === 'number' ? p.minimumSellingPrice : 0,
      stock: typeof p.stock === 'number' ? p.stock : (p.availableQuantity !== undefined ? p.availableQuantity : 50),
      image,
      isAvailable: p.isAvailable !== undefined ? Boolean(p.isAvailable) : true,
    };

    cleanedProducts.push(cleanedItem);
  }

  const formattedJson = JSON.stringify(cleanedProducts, null, 2);

  // Write to primary path
  fs.writeFileSync(primarySeedPath, formattedJson, 'utf-8');
  console.log(`[ValidateJSON] Wrote clean JSON to ${primarySeedPath}`);

  // Sync to fallback paths to ensure consistency
  for (const fPath of fallbackPaths) {
    const dir = path.dirname(fPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fPath, formattedJson, 'utf-8');
    console.log(`[ValidateJSON] Synced clean JSON to ${fPath}`);
  }

  console.log(`[ValidateJSON] Success! Final products count: ${cleanedProducts.length}. Duplicates removed: ${duplicatesRemoved}`);
  return {
    valid: true,
    productCount: cleanedProducts.length,
    duplicatesRemoved,
    primarySeedPath,
  };
};

if (process.argv[1] && process.argv[1].includes('validateProductSeedJson')) {
  try {
    validateAndFixProductSeedJson();
  } catch (e) {
    console.error('[ValidateJSON Error]', e);
    process.exit(1);
  }
}
