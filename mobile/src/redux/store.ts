import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productReducer from './slices/productSlice';
import shopReducer from './slices/shopSlice';
import monthlyGroceryReducer from './slices/monthlyGrocerySlice';
import orderReducer from './slices/orderSlice';
import addressReducer from './slices/addressSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productReducer,
    shops: shopReducer,
    monthlyGrocery: monthlyGroceryReducer,
    orders: orderReducer,
    address: addressReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
