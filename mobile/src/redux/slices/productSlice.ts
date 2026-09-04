import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProductState {
  products: any[];
  freshTodayProducts: any[];
  popularProducts: any[];
  categories: any[];
  selectedCategory: string | null;
  searchQuery: string;
  loading: boolean;
}

const initialState: ProductState = {
  products: [],
  freshTodayProducts: [],
  popularProducts: [],
  categories: [],
  selectedCategory: null,
  searchQuery: '',
  loading: false,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<any[]>) => {
      state.products = action.payload;
    },
    setFreshTodayProducts: (state, action: PayloadAction<any[]>) => {
      state.freshTodayProducts = action.payload;
    },
    setPopularProducts: (state, action: PayloadAction<any[]>) => {
      state.popularProducts = action.payload;
    },
    setCategories: (state, action: PayloadAction<any[]>) => {
      state.categories = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setProductLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setProducts,
  setFreshTodayProducts,
  setPopularProducts,
  setCategories,
  setSelectedCategory,
  setSearchQuery,
  setProductLoading,
} = productSlice.actions;
export default productSlice.reducer;
