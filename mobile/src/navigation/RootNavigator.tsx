import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Grid, Package, ShoppingCart, User } from 'lucide-react-native';

import { tokens } from '../theme/tokens';

import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { LocationSelectScreen } from '../screens/LocationSelectScreen';
import { AddAddressScreen } from '../screens/AddAddressScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { ShopScreen } from '../screens/ShopScreen';
import { ShopDetailScreen } from '../screens/ShopDetailScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { CartScreen } from '../screens/CartScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { OrderConfirmationScreen } from '../screens/OrderConfirmationScreen';
import { OrderTrackingScreen } from '../screens/OrderTrackingScreen';
import { OrdersHistoryScreen } from '../screens/OrdersHistoryScreen';
import { MonthlyGroceryListScreen } from '../screens/MonthlyGroceryListScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SellerDashboardScreen } from '../screens/SellerDashboardScreen';
import { DeliveryDashboardScreen } from '../screens/DeliveryDashboardScreen';

import { WishlistScreen } from '../screens/WishlistScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { ReferralScreen } from '../screens/ReferralScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { SupportScreen } from '../screens/SupportScreen';
import { ReturnsScreen } from '../screens/ReturnsScreen';
import { CouponsScreen } from '../screens/CouponsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: tokens.colors.primary,
        tabBarInactiveTintColor: tokens.colors.textMuted,
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: tokens.colors.white,
          borderTopWidth: 1,
          borderTopColor: tokens.colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: tokens.typography.weights.medium,
        },
        tabBarIcon: ({ color }) => {
          const iconSize = 20;
          const strokeWidth = 1.75;
          if (route.name === 'HomeTab') return <Home size={iconSize} color={color} strokeWidth={strokeWidth} />;
          if (route.name === 'CategoriesTab') return <Grid size={iconSize} color={color} strokeWidth={strokeWidth} />;
          if (route.name === 'OrdersTab') return <Package size={iconSize} color={color} strokeWidth={strokeWidth} />;
          if (route.name === 'CartTab') return <ShoppingCart size={iconSize} color={color} strokeWidth={strokeWidth} />;
          if (route.name === 'ProfileTab') return <User size={iconSize} color={color} strokeWidth={strokeWidth} />;
          return <Home size={iconSize} color={color} strokeWidth={strokeWidth} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="CategoriesTab" component={CategoriesScreen} options={{ tabBarLabel: 'Categories' }} />
      <Tab.Screen name="OrdersTab" component={OrdersHistoryScreen} options={{ tabBarLabel: 'Orders' }} />
      <Tab.Screen name="CartTab" component={CartScreen} options={{ tabBarLabel: 'Cart' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="LocationSelect" component={LocationSelectScreen} />
      <Stack.Screen name="AddAddress" component={AddAddressScreen} />
      <Stack.Screen name="ShopScreen" component={ShopScreen} />
      <Stack.Screen name="ShopDetail" component={ShopDetailScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <Stack.Screen name="MonthlyGrocery" component={MonthlyGroceryListScreen} />
      <Stack.Screen name="OrdersHistory" component={OrdersHistoryScreen} />
      <Stack.Screen name="SellerDashboard" component={SellerDashboardScreen} />
      <Stack.Screen name="DeliveryDashboard" component={DeliveryDashboardScreen} />
      
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="Referral" component={ReferralScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Returns" component={ReturnsScreen} />
      <Stack.Screen name="Coupons" component={CouponsScreen} />
    </Stack.Navigator>
  );
};
