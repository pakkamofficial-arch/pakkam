import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'SELLER' | 'DELIVERY' | 'ADMIN';
  shop?: any;
  referralCode?: string;
  avatar?: string;
  hasCompletedOnboarding?: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  activeRoleView: 'CUSTOMER' | 'SELLER' | 'DELIVERY' | 'ADMIN';
}

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  activeRoleView: 'CUSTOMER',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.activeRoleView = action.payload.user.role;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setActiveRoleView: (state, action: PayloadAction<'CUSTOMER' | 'SELLER' | 'DELIVERY' | 'ADMIN'>) => {
      state.activeRoleView = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.activeRoleView = 'CUSTOMER';
    },
  },
});

export const { setCredentials, updateUser, setActiveRoleView, logout } = authSlice.actions;
export default authSlice.reducer;
