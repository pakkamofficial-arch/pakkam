import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  _id?: string;
  product: any;
  shop: any;
  selectedUnit: string;
  unitMultiplier: number;
  quantity: number;
  price: number;
  discountPrice?: number;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  coupon: any | null;
  walletApplied: number;
  tax: number;
  loading: boolean;
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  deliveryFee: 0,
  freeDeliveryThreshold: 499,
  amountNeededForFreeDelivery: 499,
  coupon: null,
  walletApplied: 0,
  tax: 0,
  loading: false,
};

const recalculateTotals = (state: CartState) => {
  let sub = 0;
  state.items.forEach((item) => {
    const itemPrice = item.discountPrice || item.price || 0;
    const mult = item.unitMultiplier || 1;
    sub += itemPrice * mult * item.quantity;
  });

  state.subtotal = Math.round(sub);
  state.deliveryFee = state.subtotal >= state.freeDeliveryThreshold ? 0 : (state.items.length > 0 ? 40 : 0);
  state.amountNeededForFreeDelivery = Math.max(0, state.freeDeliveryThreshold - state.subtotal);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartData: (
      state,
      action: PayloadAction<{
        items: CartItem[];
        subtotal: number;
        deliveryFee: number;
        freeDeliveryThreshold?: number;
        amountNeededForFreeDelivery?: number;
      }>
    ) => {
      state.items = action.payload.items;
      state.subtotal = action.payload.subtotal;
      state.deliveryFee = action.payload.deliveryFee;
      if (action.payload.freeDeliveryThreshold !== undefined) {
        state.freeDeliveryThreshold = action.payload.freeDeliveryThreshold;
      }
      recalculateTotals(state);
    },
    updateLocalItemQty: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
      const idx = state.items.findIndex((i) => i._id === action.payload.itemId);
      if (idx > -1) {
        if (action.payload.quantity <= 0) {
          state.items.splice(idx, 1);
        } else {
          state.items[idx].quantity = action.payload.quantity;
        }
        recalculateTotals(state);
      }
    },
    removeLocalItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
      recalculateTotals(state);
    },
    addLocalProduct: (
      state,
      action: PayloadAction<{ product: any; selectedUnit?: string; quantity?: number }>
    ) => {
      const { product, selectedUnit = '1 kg', quantity = 1 } = action.payload;
      if (!product) return;
      const prodId = product._id;
      const existingIdx = state.items.findIndex((item) => {
        const pId = typeof item?.product === 'object' ? item.product?._id : item?.product;
        return pId === prodId;
      });

      const price = product.sellingPrice || product.price || 0;

      if (existingIdx > -1) {
        if (quantity <= 0) {
          state.items.splice(existingIdx, 1);
        } else {
          state.items[existingIdx].quantity = quantity;
          if (selectedUnit) state.items[existingIdx].selectedUnit = selectedUnit;
        }
      } else if (quantity > 0) {
        state.items.push({
          _id: `guest_item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          product,
          shop: product.shop || null,
          selectedUnit,
          unitMultiplier: 1,
          quantity,
          price,
          discountPrice: price,
        });
      }
      recalculateTotals(state);
    },
    setCoupon: (state, action: PayloadAction<any>) => {
      state.coupon = action.payload;
    },
    clearCoupon: (state) => {
      state.coupon = null;
    },
    setWalletApplied: (state, action: PayloadAction<number>) => {
      state.walletApplied = action.payload;
    },
    setCartLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    resetCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.deliveryFee = 0;
      state.coupon = null;
      state.walletApplied = 0;
    },
  },
});

export const {
  setCartData,
  updateLocalItemQty,
  removeLocalItem,
  addLocalProduct,
  setCoupon,
  clearCoupon,
  setWalletApplied,
  setCartLoading,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;
