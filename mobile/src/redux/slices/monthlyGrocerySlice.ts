import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MonthlyGroceryState {
  lists: any[];
  templates: any[];
  activeList: any | null;
  loading: boolean;
}

const initialState: MonthlyGroceryState = {
  lists: [],
  templates: [],
  activeList: null,
  loading: false,
};

const monthlyGrocerySlice = createSlice({
  name: 'monthlyGrocery',
  initialState,
  reducers: {
    setMonthlyLists: (state, action: PayloadAction<any[]>) => {
      state.lists = action.payload;
    },
    setTemplates: (state, action: PayloadAction<any[]>) => {
      state.templates = action.payload;
    },
    setActiveList: (state, action: PayloadAction<any>) => {
      state.activeList = action.payload;
    },
    setMonthlyLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setMonthlyLists, setTemplates, setActiveList, setMonthlyLoading } = monthlyGrocerySlice.actions;
export default monthlyGrocerySlice.reducer;
