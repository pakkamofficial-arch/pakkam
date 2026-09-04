import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OrderState {
  orders: any[];
  activeOrder: any | null;
  loading: boolean;
}

const initialState: OrderState = {
  orders: [],
  activeOrder: null,
  loading: false,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<any[]>) => {
      state.orders = action.payload;
    },
    setActiveOrder: (state, action: PayloadAction<any>) => {
      state.activeOrder = action.payload;
    },
    setOrderLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setOrders, setActiveOrder, setOrderLoading } = orderSlice.actions;
export default orderSlice.reducer;
