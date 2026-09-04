import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AddressState {
  addresses: any[];
  defaultAddress: any | null;
  loading: boolean;
}

const initialState: AddressState = {
  addresses: [],
  defaultAddress: null,
  loading: false,
};

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    setAddresses: (state, action: PayloadAction<any[]>) => {
      state.addresses = action.payload;
      const def = action.payload.find((a) => a.isDefault);
      state.defaultAddress = def || action.payload[0] || null;
    },
    setDefaultAddress: (state, action: PayloadAction<any>) => {
      state.defaultAddress = action.payload;
    },
    setAddressLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setAddresses, setDefaultAddress, setAddressLoading } = addressSlice.actions;
export default addressSlice.reducer;
