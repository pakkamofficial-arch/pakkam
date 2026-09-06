import fs from 'fs';
import path from 'path';

const filePaths = [
  path.resolve(process.cwd(), 'data/products.seed.json'),
  path.resolve(process.cwd(), 'src/data/products.seed.json'),
];

const brandMap: Record<string, string[]> = {
  'Cooking Oils': ['Fortune', 'Saffola', 'Gold Winner', 'Idhayam', 'Sundrop', 'Freedom'],
  'Dairy & Cooking': ['Amul', 'Aavin', 'Heritage', 'Hatsun', 'Nandini'],
  'Dairy': ['Amul', 'Aavin', 'Heritage', 'Hatsun', 'Nandini'],
  'Flours': ['Aashirvaad', 'Pillsbury', 'Tata Sampann', 'Golden Harvest'],
  'Rice & Grains': ['India Gate', 'Daawat', '24 Mantra Organic', 'Fortune', 'Royal'],
  'Pulses': ['Tata Sampann', '24 Mantra Organic', 'Organic Tattva', 'Natureland'],
  'Spices': ['Aachi', 'Everest', 'MDH', 'MTR', 'Catch', 'Eastern'],
  'Seasonings': ['Aachi', 'Everest', 'MDH', 'Catch'],
  'Sauces': ['Kissan', 'Maggi', 'Ching\'s Secret', 'Del Monte'],
  'Condiments': ['Kissan', 'Mother\'s Recipe', 'Priya', 'Aachi'],
  'Eggs': ['Suguna', 'EGGO', 'Farm Fresh'],
  'Groceries': ['Tata', 'Fortune', 'Nirma', 'Sunpure'],
};

const getBrandForProduct = (pName: string, category: string): string => {
  const lowerName = pName.toLowerCase();
  const lowerCat = category.toLowerCase();

  // Fresh produce has no brand
  if (lowerCat === 'vegetables' || lowerCat === 'fruits' || lowerName.includes('fresh') || lowerName.includes('loose') || lowerName.includes('leafy')) {
    return '';
  }

  const choices = brandMap[category] || ['Pakkam Select', 'Tata Sampann', 'Fortune'];
  const hash = pName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return choices[hash % choices.length];
};

const getUnitConfig = (pName: string, category: string) => {
  const lowerName = pName.toLowerCase();
  const lowerCat = category.toLowerCase();

  if (
    lowerCat.includes('oil') ||
    lowerCat.includes('beverage') ||
    lowerName.includes('oil') ||
    lowerName.includes('milk') ||
    lowerName.includes('juice') ||
    lowerName.includes('ghee') ||
    lowerName.includes('vinegar')
  ) {
    return {
      unitType: 'volume',
      availableUnits: ['250ml', '500ml', '750ml', '1 litre'],
      unit: '1 litre',
    };
  }

  if (
    lowerCat === 'eggs' ||
    lowerName.includes('egg') ||
    lowerName.includes('coconut') ||
    lowerName.includes('cauliflower') ||
    lowerName.includes('cabbage') ||
    lowerName.includes('pumpkin') ||
    lowerName.includes('bread') ||
    lowerName.includes('bun')
  ) {
    return {
      unitType: 'count',
      availableUnits: lowerName.includes('egg') ? ['6 pcs', '12 pcs', '30 pcs'] : ['1 pc', '2 pcs', '5 pcs'],
      unit: lowerName.includes('egg') ? '12 pcs' : '1 pc',
    };
  }

  return {
    unitType: 'weight',
    availableUnits: ['250g', '500g', '750g', '1kg'],
    unit: '1kg',
  };
};

const getDescription = (pName: string, category: string, brand: string): string => {
  const brandPrefix = brand ? `${brand} ` : '';
  return `Premium quality ${brandPrefix}${pName.toLowerCase()} delivered fresh from local verified shops to your doorstep via PAKKAM.`;
};

const runEnrichment = () => {
  filePaths.forEach((filePath) => {
    if (!fs.existsSync(filePath)) return;

    const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const enriched = rawData.map((p: any) => {
      const brand = p.brand !== undefined ? p.brand : getBrandForProduct(p.name, p.category);
      const unitConfig = getUnitConfig(p.name, p.category);
      const description = p.description || getDescription(p.name, p.category, brand);

      const mrp = p.mrp ? Math.round(p.mrp) : undefined;
      const sellingPrice = p.sellingPrice ? Math.round(p.sellingPrice) : (p.price ? Math.round(p.price) : mrp);
      const purchasePrice = p.purchasePrice ? Math.round(p.purchasePrice) : 0;
      const additionalCost = p.additionalCost ? Math.round(p.additionalCost) : 0;

      return {
        ...p,
        brand,
        description,
        unitType: p.unitType || unitConfig.unitType,
        unit: p.unit || unitConfig.unit,
        availableUnits: p.availableUnits || unitConfig.availableUnits,
        mrp: mrp ?? sellingPrice,
        sellingPrice: sellingPrice ?? mrp,
        price: sellingPrice ?? mrp,
        purchasePrice,
        additionalCost,
      };
    });

    fs.writeFileSync(filePath, JSON.stringify(enriched, null, 2), 'utf-8');
    console.log(`[Enrichment] Updated ${enriched.length} products in ${filePath}`);
  });
};

runEnrichment();
