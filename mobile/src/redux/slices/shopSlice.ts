import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ShopState {
  shops: any[];
  selectedShop: any | null;
  loading: boolean;
}

const initialState: ShopState = {
  shops: [],
  selectedShop: null,
  loading: false,
};

const shopSlice = createSlice({
  name: 'shops',
  initialState,
  reducers: {
    setShops: (state, action: PayloadAction<any[]>) => {
      state.shops = action.payload;
    },
    setSelectedShop: (state, action: PayloadAction<any>) => {
      state.selectedShop = action.payload;
    },
    setShopLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setShops, setSelectedShop, setShopLoading } = shopSlice.actions;
export default shopSlice.reducer;
