import fs from 'fs';
import path from 'path';
import { validateAndFixProductSeedJson } from './validateProductSeedJson.js';
import { seedProductsOnly } from './seedProducts.js';

const HD_IMAGE_MAP: Record<string, string> = {
  // Vegetables
  'tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80',
  'onion': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80',
  'potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80',
  'green chilli': 'https://images.unsplash.com/photo-1588879460618-9249e7d947d1?w=800&q=80',
  'ginger': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80',
  'garlic': 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=800&q=80',
  'carrot': 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?w=800&q=80',
  'beetroot': 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=800&q=80',
  'ladies finger': 'https://images.unsplash.com/photo-1425543103986-224137c0d857?w=800&q=80',
  'cabbage': 'https://images.unsplash.com/photo-1550081699-79c1c2e785e6?w=800&q=80',
  'cauliflower': 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=800&q=80',
  'capsicum': 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&q=80',
  'bottle gourd': 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=800&q=80',
  'bitter gourd': 'https://images.unsplash.com/photo-1628773822503-930a85854652?w=800&q=80',
  'cucumber': 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=800&q=80',
  'brinjal': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80',
  'ridge gourd': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=800&q=80',
  'snake gourd': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
  'pumpkin': 'https://images.unsplash.com/photo-1506917728037-b6af01a7d403?w=800&q=80',
  'drumstick': 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=800&q=80',
  'radish': 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=800&q=80',
  'lemon': 'https://images.unsplash.com/photo-1534531141161-e41d133a8979?w=800&q=80',
  'coriander leaves': 'https://images.unsplash.com/photo-1588879460618-9249e7d947d1?w=800&q=80',
  'mint leaves': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
  'curry leaves': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80',
  'spinach': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&q=80',
  'green peas': 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=800&q=80',
  'french beans': 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=800&q=80',
  'sweet corn': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&q=80',
  'raw banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&q=80',
  'mushroom': 'https://images.unsplash.com/photo-1504470695779-75300268aa0e?w=800&q=80',

  // Fruits
  'banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&q=80',
  'apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&q=80',
  'pomegranate': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80',
  'mosambi': 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&q=80',
  'orange': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=800&q=80',
  'papaya': 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=800&q=80',
  'watermelon': 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=800&q=80',
  'guava': 'https://images.unsplash.com/photo-1536511135882-96f7c46f6341?w=800&q=80',
  'chikoo': 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&q=80',
  'green grapes': 'https://images.unsplash.com/photo-1596368708386-5d0f67975459?w=800&q=80',
  'black grapes': 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800&q=80',
  'pineapple': 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&q=80',
  'mango': 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80',
  'kiwi': 'https://images.unsplash.com/photo-1585059819970-31190d6ff3ec?w=800&q=80',
  'dragon fruit': 'https://images.unsplash.com/photo-1527325678964-549216468488?w=800&q=80',

  // Groceries / Grains / Flours / Pulses
  'basmati rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
  'sona masoori rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
  'ponni boiled rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
  'idli rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
  'wheat flour': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
  'wheat flour (atta)': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
  'maida': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
  'sooji rava': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
  'rava (sooji)': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
  'toor dal': 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=800&q=80',
  'moong dal': 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=800&q=80',
  'urad dal': 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=800&q=80',
  'chana dal': 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=800&q=80',
  'masoor dal': 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=800&q=80',
  'kabuli chana': 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=800&q=80',
  'rajma': 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=800&q=80',
  'sunflower oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80',
  'mustard oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80',
  'sugar': 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=800&q=80',
  'jaggery': 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=800&q=80',
  'salt': 'https://images.unsplash.com/photo-1518110168401-f2841ee59280?w=800&q=80',
  'poha': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
  'besan': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
  'tea': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80',
  'coffee powder': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',

  // Spices
  'turmeric powder': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80',
  'red chilli powder': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
  'coriander powder': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
  'cumin seeds': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
  'black pepper': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
  'garam masala': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
  'sambar powder': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
  'rasam powder': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',

  // Personal Care & Household Essentials
  'shampoo anti-dandruff': 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&q=80',
  'coconut hair oil': 'https://images.unsplash.com/photo-1608248597263-00de46808261?w=800&q=80',
  'toothpaste': 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&q=80',
  'toothbrush soft': 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&q=80',
  'face wash': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
  'moisturizing cream': 'https://images.unsplash.com/photo-1608248597263-00de46808261?w=800&q=80',
  'hand wash liquid': 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=800&q=80',
  'tissue paper roll': 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=800&q=80',
  'garbage bags medium': 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800&q=80',
  'aluminium foil': 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800&q=80',
  'dishwash scrub pad': 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=800&q=80',
};

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  'vegetables': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80',
  'fruits': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&q=80',
  'groceries': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
  'spices': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
  'personal care': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
  'household essentials': 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=800&q=80',
  'rice & grains': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
  'flours': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
};

export const updateHdProductImages = async () => {
  const seedPath = path.resolve(process.cwd(), 'data/product.seed.json');
  console.log('[HD Images] Reading seed file:', seedPath);
  const products: any[] = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

  let updatedCount = 0;
  for (const p of products) {
    const nameKey = String(p.name || '').trim().toLowerCase();
    const catKey = String(p.category || 'Vegetables').trim().toLowerCase();

    let hdUrl = HD_IMAGE_MAP[nameKey];
    if (!hdUrl) {
      hdUrl = CATEGORY_DEFAULT_IMAGES[catKey] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80';
    }

    p.image = hdUrl;
    p.isAvailable = true; // Ensure isAvailable: true as required
    updatedCount++;
  }

  const jsonContent = JSON.stringify(products, null, 2);
  fs.writeFileSync(seedPath, jsonContent, 'utf-8');
  console.log(`[HD Images] Successfully updated ${updatedCount} products with online HD HTTPS images.`);

  // Validate and sync across all candidate paths
  validateAndFixProductSeedJson();

  // Seeding to MongoDB
  console.log('[HD Images] Re-seeding database...');
  await seedProductsOnly(true);
};

if (process.argv[1] && process.argv[1].includes('updateHdProductImages')) {
  updateHdProductImages()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error('[HD Images Error]', e);
      process.exit(1);
    });
}
