import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Modal, TextInput } from 'react-native';
import {
  MapPin,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  User,
  Package,
  Bell,
  Settings,
  ChevronLeft,
  Heart,
  Wallet as WalletIcon,
  Gift,
  RotateCcw,
  Tag,
  Edit3,
  Calendar,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import client, { clearStoredToken } from '../api/client';
import { logout, updateUser } from '../redux/slices/authSlice';
import { resetCart } from '../redux/slices/cartSlice';
import { setAddresses, setDefaultAddress } from '../redux/slices/addressSlice';
import { Colors, Radii, Spacing } from '../theme';

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      const res = await client.get('/auth/me');
      if (res.data.success && res.data.user) {
        dispatch(updateUser(res.data.user));
        setEditName(res.data.user.name || '');
        setEditPhone(res.data.user.phone || '');
        setEditEmail(res.data.user.email || '');
      }
    } catch (e) {
      console.error('Error fetching user profile:', e);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      alert('Full Name is required');
      return;
    }
    if (!editPhone.trim() || !/^\d{10}$/.test(editPhone.trim())) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    if (editEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail.trim())) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      setSaving(true);
      const res = await client.put('/auth/profile', {
        name: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail ? editEmail.trim() : undefined,
      });

      if (res.data.success && res.data.user) {
        dispatch(updateUser(res.data.user));
        setShowEditModal(false);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await clearStoredToken();
    dispatch(logout());
    dispatch(resetCart());
    dispatch(setAddresses([]));
    dispatch(setDefaultAddress(null));
  };

  const menuItems = [
    { id: 'm-orders', label: 'My Orders', icon: Package, screen: 'OrdersHistory' },
    { id: 'm-monthly', label: 'Monthly Grocery List', icon: Calendar, screen: 'MonthlyGrocery' },
    { id: 'm-addrs', label: 'My Addresses', icon: MapPin, screen: 'LocationSelect' },
    { id: 'm-pay', label: 'Payment Methods', icon: CreditCard, screen: 'Checkout' },
    { id: 'm-wish', label: 'Favorites / Wishlist', icon: Heart, screen: 'Wishlist' },
    { id: 'm-offers', label: 'Available Offers', icon: Tag, screen: 'Coupons' },
    { id: 'm-notif', label: 'Notifications', icon: Bell, screen: 'Notifications' },
    { id: 'm-help', label: 'Help & Support', icon: HelpCircle, screen: 'Support' },
  ];

  if (!isAuthenticated || !user) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Clean Guest Profile Card */}
        <View style={styles.guestCard}>
          <View style={styles.guestAvatarCircle}>
            <User size={48} color={Colors.textSecondary} strokeWidth={1.5} />
          </View>
          <Text style={styles.guestTitle}>Welcome to PAKKAM</Text>
          <Text style={styles.guestSubtitle}>Please sign in to view your profile, manage addresses, and track orders.</Text>
          <TouchableOpacity
            style={styles.guestSignInBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.88}
          >
            <Text style={styles.guestSignInBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Header: back arrow, centered "Profile" */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.editIconBtn}
          onPress={() => {
            setEditName(user.name || '');
            setEditPhone(user.phone || '');
            setEditEmail(user.email || '');
            setShowEditModal(true);
          }}
        >
          <Edit3 size={18} color={Colors.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Dynamic Authenticated User Section */}
      <View style={styles.avatarSection}>
        <View style={styles.largeAvatarCircle}>
          <User size={48} color={Colors.textSecondary} strokeWidth={1.5} />
        </View>
        <Text style={styles.userName}>{user.fullName || user.name}</Text>
        <Text style={styles.userPhone}>Mobile: {user.mobileNumber || user.phone}</Text>
        <Text style={styles.userEmail}>Email: {user.email && user.email.trim() ? user.email : 'Not added'}</Text>
        <Text style={styles.userIdText}>User ID: {user.username || user.userId || 'N/A'}</Text>

        <TouchableOpacity
          style={styles.editProfilePill}
          onPress={() => {
            setEditName(user.name || '');
            setEditPhone(user.phone || '');
            setEditEmail(user.email || '');
            setShowEditModal(true);
          }}
        >
          <Text style={styles.editProfilePillText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Menu List */}
      <View style={styles.menuBox}>
        {menuItems.map((item) => {
          const IconComp = item.icon;
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.menuRow}
              onPress={() => {
                if (item.screen) {
                  navigation.navigate(item.screen);
                } else {
                  alert(`${item.label} opened`);
                }
              }}
            >
              <IconComp size={18} color={Colors.textPrimary} strokeWidth={1.75} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <ChevronRight size={16} color={Colors.textSecondary} strokeWidth={1.75} />
            </TouchableOpacity>
          );
        })}

        {/* Logout */}
        <TouchableOpacity style={styles.menuRow} onPress={handleLogout}>
          <LogOut size={18} color={Colors.danger} strokeWidth={1.75} />
          <Text style={[styles.menuLabel, { color: Colors.danger }]}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="e.g. Ramesh Kumar"
            />

            <Text style={styles.inputLabel}>Mobile Number *</Text>
            <TextInput
              style={styles.input}
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
              maxLength={10}
              placeholder="10-digit mobile number"
            />

            <Text style={styles.inputLabel}>Email Address (Optional)</Text>
            <TextInput
              style={styles.input}
              value={editEmail}
              onChangeText={setEditEmail}
              keyboardType="email-address"
              placeholder="example@email.com (Optional)"
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                <Text style={styles.modalSaveText}>{saving ? 'Saving...' : 'SAVE CHANGES'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  backBtn: {
    padding: 2,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  editIconBtn: {
    padding: 4,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  largeAvatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  userPhone: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  userIdText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 1,
  },
  editProfilePill: {
    backgroundColor: Colors.chipSelected,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: Radii.pill,
    marginTop: 8,
  },
  editProfilePillText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  menuBox: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  modalSaveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.md,
  },
  modalSaveText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  guestCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    padding: 24,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  guestAvatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  guestSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  guestSignInBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: Radii.pill,
  },
  guestSignInBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
