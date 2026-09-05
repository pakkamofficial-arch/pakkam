import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product.js';
import { calculateProductPricing } from '../services/priceSyncService.js';
import { restoreOrderStock } from '../controllers/orderController.js';

dotenv.config();

async function runVerificationSuite() {
  console.log('--- STARTING VERIFICATION SUITE FOR EXPLICIT TEST CASES (1 to 5) ---');

  // TEST 1: Target Profit Margin & Zero Double Discounting
  console.log('\n[TEST 1] Testing purchasePrice=36, additionalCost=2, MRP=62, targetProfitMargin=0.27...');
  const calc1 = calculateProductPricing({
    purchasePrice: 36,
    additionalCost: 2,
    MRP: 62,
    targetProfitMargin: 0.27,
  });

  console.log('Test 1 Output:', {
    landedCost: calc1.landedCost,
    recommendedSellingPrice: calc1.recommendedSellingPrice,
    sellingPrice: calc1.sellingPrice,
    finalPrice: calc1.finalPrice,
    profitAmount: calc1.profitAmount,
    profitMargin: Number(calc1.profitMargin.toFixed(4)),
  });

  const t1Passed =
    calc1.landedCost === 38 &&
    Math.abs(calc1.recommendedSellingPrice - 52.054794520547944) < 0.01 &&
    Math.round(calc1.finalPrice) === 52 &&
    Math.round(calc1.profitAmount) === 14 &&
    Math.abs(calc1.profitMargin - 0.2692) < 0.01;

  console.log(`Test 1 Passed: ${t1Passed}`);

  // TEST 2: MRP Ceiling Enforcement
  console.log('\n[TEST 2] Testing purchasePrice=50, additionalCost=0, MRP=60, targetProfitMargin=0.30...');
  const calc2 = calculateProductPricing({
    purchasePrice: 50,
    additionalCost: 0,
    MRP: 60,
    targetProfitMargin: 0.30,
  });

  console.log('Test 2 Output:', {
    landedCost: calc2.landedCost,
    recommendedSellingPrice: calc2.recommendedSellingPrice,
    mrpCeiling: 60,
    finalPrice: calc2.finalPrice,
    actualProfit: calc2.profitAmount,
    actualProfitMargin: Number(calc2.profitMargin.toFixed(4)),
  });

  const t2Passed =
    calc2.landedCost === 50 &&
    calc2.finalPrice === 60 && // Capped at MRP 60 (cannot reach 71.43)
    calc2.profitAmount === 10 &&
    Math.abs(calc2.profitMargin - 0.1667) < 0.01;

  console.log(`Test 2 Passed: ${t2Passed}`);

  // TEST 3: Zero Cost Safe Calculations
  console.log('\n[TEST 3] Testing purchasePrice=0, additionalCost=0...');
  const calc3 = calculateProductPricing({
    purchasePrice: 0,
    additionalCost: 0,
    MRP: 50,
    sellingPrice: 50,
    discountPercent: 0,
  });

  console.log('Test 3 Output:', {
    landedCost: calc3.landedCost,
    finalPrice: calc3.finalPrice,
    profitAmount: calc3.profitAmount,
    profitMargin: calc3.profitMargin,
    isNaNCheck: isNaN(calc3.profitMargin),
  });

  const t3Passed =
    calc3.landedCost === 0 &&
    calc3.finalPrice === 50 &&
    calc3.profitAmount === 50 &&
    calc3.profitMargin === 1.0 &&
    !isNaN(calc3.profitMargin);

  console.log(`Test 3 Passed: ${t3Passed}`);

  // TEST 4: AvailableQuantity <= 0 -> stockStatus=OUT_OF_STOCK, isAvailable=false
  console.log('\n[TEST 4] Testing availableQuantity=0 synchronization...');
  const dummyProduct = new Product({
    name: 'Out of Stock Product Test',
    category: new mongoose.Types.ObjectId(),
    images: ['https://example.com/item.jpg'],
    price: 50,
    sellingPrice: 50,
    unit: '1 kg',
    availableUnits: ['1 kg'],
    availableQuantity: 0,
    shop: new mongoose.Types.ObjectId(),
  });

  // Trigger pre-save hook
  await new Promise<void>((resolve, reject) => {
    dummyProduct.schema.listeners('save').forEach((listener: any) => {
      listener.call(dummyProduct, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  console.log('Test 4 Output:', {
    availableQuantity: dummyProduct.availableQuantity,
    stockStatus: dummyProduct.stockStatus,
    isAvailable: dummyProduct.isAvailable,
  });

  const t4Passed =
    dummyProduct.availableQuantity === 0 &&
    dummyProduct.stockStatus === 'OUT_OF_STOCK' &&
    dummyProduct.isAvailable === false;

  console.log(`Test 4 Passed: ${t4Passed}`);

  // TEST 5: Order Cancellation Stock Restoration Idempotency
  console.log('\n[TEST 5] Testing Order Cancellation Stock Restoration...');
  const testProdId = new mongoose.Types.ObjectId();
  const mockProduct: any = new Product({
    _id: testProdId,
    name: 'Cancel Test Orange',
    category: new mongoose.Types.ObjectId(),
    images: ['https://example.com/orange.jpg'],
    price: 40,
    sellingPrice: 40,
    unit: '1 kg',
    availableUnits: ['1 kg'],
    availableQuantity: 10,
    stockStatus: 'IN_STOCK',
    isAvailable: true,
    shop: new mongoose.Types.ObjectId(),
  });

  const mockOrder: any = {
    orderNumber: 'TEST_CANCEL_001',
    isStockRestored: false,
    items: [
      {
        product: mockProduct,
        selectedUnit: '1 kg',
        unitMultiplier: 1,
        quantity: 5,
      },
    ],
    save: async function () {
      this.isStockRestored = true;
    },
  };

  // First cancellation call
  await restoreOrderStock(mockOrder);
  const firstRestoredQty = mockProduct.availableQuantity;
  const firstRestoredFlag = mockOrder.isStockRestored;

  // Second cancellation call (should do nothing because isStockRestored is true)
  await restoreOrderStock(mockOrder);
  const secondRestoredQty = mockProduct.availableQuantity;

  console.log('Test 5 Output:', {
    initialQty: 10,
    afterFirstRestoreQty: firstRestoredQty,
    afterSecondRestoreQty: secondRestoredQty,
    isStockRestored: firstRestoredFlag,
  });

  const t5Passed =
    firstRestoredQty === 15 &&
    secondRestoredQty === 15 &&
    firstRestoredFlag === true;

  console.log(`Test 5 Passed: ${t5Passed}`);

  console.log('\n====================================================');
  const allPassed = t1Passed && t2Passed && t3Passed && t4Passed && t5Passed;
  console.log(`ALL VERIFICATION TESTS PASSED: ${allPassed}`);
  console.log('====================================================');

  if (!allPassed) {
    throw new Error('One or more pricing/inventory tests failed!');
  }
}

runVerificationSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
