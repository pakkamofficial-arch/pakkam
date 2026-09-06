import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeft, MapPin, Check } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setAddresses, setDefaultAddress } from '../redux/slices/addressSlice';
import { updateUser } from '../redux/slices/authSlice';
import client from '../api/client';
import { Colors, Radii, Spacing } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { IconChip } from '../components/IconChip';

export const LocationSelectScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const isExplicitAdd = route.params?.isExplicitAdd || false;
  const dispatch = useDispatch();
  const { defaultAddress, addresses } = useSelector((state: RootState) => state.address);
  const { user } = useSelector((state: RootState) => state.auth);

  // Form Fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [pincode, setPincode] = useState('');
  const [houseFlat, setHouseFlat] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>('Home');

  // Touched / Errors
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [fetchingPincode, setFetchingPincode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Skip check for returning users if not explicitly adding
  useEffect(() => {
    if (!isExplicitAdd && defaultAddress) {
      navigation.replace('MainTabs');
    }
  }, [defaultAddress, isExplicitAdd]);

  // Pincode Lookup Handler
  const handlePincodeBlur = async () => {
    setTouched((prev) => ({ ...prev, pincode: true }));
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      try {
        setFetchingPincode(true);
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await res.json();
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          if (po.District) setCity(po.District);
          if (po.State) setState(po.State);
        }
      } catch (e) {
        console.error('Pincode fetch error:', e);
      } finally {
        setFetchingPincode(false);
      }
    }
  };

  // Validation Logic
  const errors: Record<string, string> = {};
  if (!name.trim()) errors.name = 'Full Name is required';
  if (!phone.trim() || !/^\d{10}$/.test(phone.trim())) errors.phone = 'Enter valid 10-digit mobile number';
  if (!pincode.trim() || !/^\d{6}$/.test(pincode.trim())) errors.pincode = 'Enter valid 6-digit pincode';
  if (!houseFlat.trim()) errors.houseFlat = 'Address Line 1 is required';
  if (!city.trim()) errors.city = 'City is required';
  if (!state.trim()) errors.state = 'State is required';

  const isValid = Object.keys(errors).length === 0;

  const handleConfirmAddress = async () => {
    if (!isValid) return;

    try {
      setSubmitting(true);
      const addressPayload = {
        name,
        phone,
        pincode,
        houseFlat,
        street: houseFlat,
        landmark,
        area: landmark || houseFlat,
        city,
        state,
        type: addressType.toUpperCase(),
        isDefault: true,
      };

      const res = await client.post('/addresses', addressPayload);
      if (res.data.success) {
        const saved = res.data.address;
        dispatch(setDefaultAddress(saved));
        dispatch(setAddresses([...addresses, saved]));
      } else {
        const fallback = { ...addressPayload, _id: 'addr-' + Date.now() };
        dispatch(setDefaultAddress(fallback));
      }

      // Also update User profile name, phone & hasCompletedOnboarding per spec section 1 & 6
      try {
        await client.put('/auth/profile', {
          name,
          phone,
          hasCompletedOnboarding: true,
        });
      } catch (err) {
        // ignore fallback
      }

      dispatch(updateUser({ name, phone, hasCompletedOnboarding: true }));
    } catch (e) {
      const fallback = {
        _id: 'addr-' + Date.now(),
        name,
        phone,
        pincode,
        houseFlat,
        street: houseFlat,
        landmark,
        area: landmark || houseFlat,
        city,
        state,
        type: addressType.toUpperCase(),
        isDefault: true,
      };
      dispatch(setDefaultAddress(fallback));
      dispatch(updateUser({ name, phone, hasCompletedOnboarding: true }));
    } finally {
      setSubmitting(false);
      if (route.params?.directPurchaseItem || route.params?.source === 'cart' || isExplicitAdd) {
        navigation.replace('Checkout', route.params);
      } else {
        navigation.replace('MainTabs');
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 110 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          {isExplicitAdd && (
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Delivery Address</Text>
          <View style={{ width: 22 }} />
        </View>

        <Text style={styles.subHeading}>Enter your delivery location details below</Text>

        {/* White Rounded Card Form */}
        <View style={styles.formCard}>
          {/* 1. Full Name */}
          <Text style={styles.inputLabel}>Full Name *</Text>
          <TextInput
            style={[styles.input, touched.name && errors.name ? styles.inputError : null]}
            placeholder="e.g. Rahul Sharma"
            placeholderTextColor={Colors.textPlaceholder}
            value={name}
            onChangeText={(v) => {
              setName(v);
              setTouched((prev) => ({ ...prev, name: true }));
            }}
          />
          {touched.name && errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : <View style={styles.errorSpacer} />}

          {/* 2. Mobile Number */}
          <Text style={styles.inputLabel}>Mobile Number *</Text>
          <TextInput
            style={[styles.input, touched.phone && errors.phone ? styles.inputError : null]}
            placeholder="10-digit mobile number"
            placeholderTextColor={Colors.textPlaceholder}
            keyboardType="numeric"
            maxLength={10}
            value={phone}
            onChangeText={(v) => {
              setPhone(v);
              setTouched((prev) => ({ ...prev, phone: true }));
            }}
          />
          {touched.phone && errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : <View style={styles.errorSpacer} />}

          {/* 3. Pincode */}
          <View style={styles.labelWithLoader}>
            <Text style={styles.inputLabel}>Pincode *</Text>
            {fetchingPincode && <ActivityIndicator size="small" color={Colors.primary} />}
          </View>
          <TextInput
            style={[styles.input, touched.pincode && errors.pincode ? styles.inputError : null]}
            placeholder="6-digit pincode"
            placeholderTextColor={Colors.textPlaceholder}
            keyboardType="numeric"
            maxLength={6}
            value={pincode}
            onBlur={handlePincodeBlur}
            onChangeText={(v) => {
              setPincode(v);
              if (v.length === 6) {
                setTimeout(handlePincodeBlur, 100);
              }
            }}
          />
          {touched.pincode && errors.pincode ? <Text style={styles.errorText}>{errors.pincode}</Text> : <View style={styles.errorSpacer} />}

          {/* 4. Address Line 1 */}
          <Text style={styles.inputLabel}>Address Line 1 (House / Flat / Street) *</Text>
          <TextInput
            style={[styles.input, touched.houseFlat && errors.houseFlat ? styles.inputError : null]}
            placeholder="Flat no., Building, Street name"
            placeholderTextColor={Colors.textPlaceholder}
            value={houseFlat}
            onChangeText={(v) => {
              setHouseFlat(v);
              setTouched((prev) => ({ ...prev, houseFlat: true }));
            }}
          />
          {touched.houseFlat && errors.houseFlat ? <Text style={styles.errorText}>{errors.houseFlat}</Text> : <View style={styles.errorSpacer} />}

          {/* 5. Address Line 2 / Landmark (Optional) */}
          <Text style={styles.inputLabel}>Address Line 2 / Landmark (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Nearby landmark, park, or shop"
            placeholderTextColor={Colors.textPlaceholder}
            value={landmark}
            onChangeText={setLandmark}
          />
          <View style={styles.errorSpacer} />

          {/* 6. City */}
          <Text style={styles.inputLabel}>City *</Text>
          <TextInput
            style={[styles.input, touched.city && errors.city ? styles.inputError : null]}
            placeholder="City"
            placeholderTextColor={Colors.textPlaceholder}
            value={city}
            onChangeText={(v) => {
              setCity(v);
              setTouched((prev) => ({ ...prev, city: true }));
            }}
          />
          {touched.city && errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : <View style={styles.errorSpacer} />}

          {/* 7. State */}
          <Text style={styles.inputLabel}>State *</Text>
          <TextInput
            style={[styles.input, touched.state && errors.state ? styles.inputError : null]}
            placeholder="State"
            placeholderTextColor={Colors.textPlaceholder}
            value={state}
            onChangeText={(v) => {
              setState(v);
              setTouched((prev) => ({ ...prev, state: true }));
            }}
          />
          {touched.state && errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : <View style={styles.errorSpacer} />}

          {/* 8. Address Type Selector */}
          <Text style={styles.inputLabel}>Address Type</Text>
          <View style={styles.chipRow}>
            {(['Home', 'Work', 'Other'] as const).map((t) => (
              <IconChip
                key={t}
                label={t}
                selected={addressType === t}
                onPress={() => setAddressType(t)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Pinned Confirm Button */}
      <View style={styles.footerBar}>
        <PrimaryButton
          title={submitting ? 'Saving Address...' : 'Confirm'}
          onPress={handleConfirmAddress}
          disabled={!isValid || submitting}
          loading={submitting}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // Mint background #EAF6EC
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  backBtn: {
    padding: 2,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subHeading: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  formCard: {
    backgroundColor: Colors.surface, // White rounded card
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  labelWithLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  inputError: {
    borderColor: Colors.danger,
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 11,
    color: Colors.danger, // Danger red inline error text
    marginTop: 2,
    marginBottom: 6,
  },
  errorSpacer: {
    height: 12, // Reserve space so error text doesn't shift layout
  },
  chipRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
});
