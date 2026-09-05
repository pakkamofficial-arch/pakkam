import fs from 'fs';
import path from 'path';

const seedPath = path.resolve(process.cwd(), 'data/product.seed.json');
const products = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

const cats = new Set();
products.forEach((p: any) => {
  cats.add(p.category);
});

console.log('Total Products:', products.length);
console.log('Categories:', Array.from(cats));
products.forEach((p: any, idx: number) => {
  console.log(`${idx + 1}. [${p.category}] ${p.name} -> ${p.image}`);
});
