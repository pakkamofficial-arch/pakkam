import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setAddresses, setDefaultAddress } from '../redux/slices/addressSlice';
import client, { getStoredToken } from '../api/client';
import { BackButton } from '../components/BackButton';

export const AddAddressScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { returnScreen } = route?.params || {};

  const [fullName, setFullName] = useState((user as any)?.fullName || user?.name || '');
  const [mobileNumber, setMobileNumber] = useState((user as any)?.mobileNumber || user?.phone || '');
  const [pincode, setPincode] = useState('625001');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Madurai');
  const [state, setState] = useState('Tamil Nadu');
  const [landmark, setLandmark] = useState('');
  const [type, setType] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');

  const [validatingPin, setValidatingPin] = useState(false);
  const [pinStatus, setPinStatus] = useState<{
    valid: boolean | null;
    serviceable: boolean | null;
    message: string;
    city?: string;
    state?: string;
  }>({
    valid: true,
    serviceable: true,
    message: '✓ Valid PIN code • Delivery available',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update name/phone when user logs in
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName((user as any)?.fullName || user?.name || '');
      if (!mobileNumber) setMobileNumber((user as any)?.mobileNumber || user?.phone || '');
    }
  }, [user]);

  // Real-time 6-digit PIN code validation trigger
  useEffect(() => {
    const cleanPin = pincode.trim();
    if (cleanPin.length === 6 && /^\d{6}$/.test(cleanPin)) {
      validatePincode(cleanPin);
    } else if (cleanPin.length > 0 && cleanPin.length !== 6) {
      setPinStatus({
        valid: false,
        serviceable: false,
        message: 'Please enter a valid 6-digit Indian PIN code.',
      });
    } else {
      setPinStatus({ valid: null, serviceable: null, message: '' });
    }
  }, [pincode]);

  const validatePincode = async (pinStr: string) => {
    try {
      setValidatingPin(true);
      const res = await client.get(`/pincode/${pinStr}`);

      if (res.data.success && res.data.serviceable) {
        setPinStatus({
          valid: true,
          serviceable: true,
          message: '✓ Valid PIN code • Delivery available',
          city: res.data.city,
          state: res.data.state,
        });

        if (res.data.city) setCity(res.data.city);
        if (res.data.state) setState(res.data.state);
      } else if (res.data.success && !res.data.serviceable) {
        setPinStatus({
          valid: true,
          serviceable: false,
          message: '✕ Sorry, delivery is currently unavailable for this PIN code.',
          city: res.data.city,
          state: res.data.state,
        });
      } else {
        setPinStatus({
          valid: false,
          serviceable: false,
          message: res.data.message || 'Please enter a valid PIN code.',
        });
      }
    } catch (e: any) {
      setPinStatus({
        valid: false,
        serviceable: false,
        message: e.response?.data?.message || 'Please enter a valid PIN code.',
      });
    } finally {
      setValidatingPin(false);
    }
  };

  const handleConfirmAddress = async () => {
    setError('');

    // 1. Full Name Validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    // 2. Mobile Number Validation (Indian 10-digit)
    const cleanMobile = mobileNumber.trim();
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    // 3. PIN Code Validation (Format check only: 6 digits)
    const cleanPin = pincode.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      setError('Please enter a valid 6-digit PIN code.');
      return;
    }

    // 4. Address validation
    const cleanAddress = addressLine.trim();
    if (!cleanAddress || cleanAddress.length < 5) {
      setError('Please enter your complete address details (House/Flat, Street, Area).');
      return;
    }

    // 5. City and State validation
    if (!city.trim() || !state.trim()) {
      setError('Please enter city and state.');
      return;
    }

    try {
      setLoading(true);
      const locationObject = {
        _id: 'loc_' + Math.random().toString(36).substring(2, 9),
        name: fullName.trim(),
        fullName: fullName.trim(),
        phone: cleanMobile,
        mobileNumber: cleanMobile,
        houseFlat: cleanAddress,
        street: cleanAddress,
        area: city.trim(),
        addressLine: cleanAddress,
        city: city.trim(),
        state: state.trim(),
        pincode: cleanPin,
        landmark: landmark.trim(),
        type,
        isDefault: true,
      };

      dispatch(setDefaultAddress(locationObject));

      // If user is authenticated, also save to backend addresses DB
      const token = await getStoredToken();
      if (token && isAuthenticated) {
        try {
          const res = await client.post('/addresses', locationObject);
          if (res.data.success && res.data.address) {
            dispatch(setDefaultAddress(res.data.address));
          }
        } catch (apiErr) {
          console.warn('[AddressScreen] Saved local location, background API save note:', apiErr);
        }
      }

      navigation.replace('Checkout');
    } catch (e: any) {
      setError('Failed to confirm location. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.topBackRow}>
        <BackButton navigation={navigation} fallbackScreen="Checkout" />
      </View>

      <Text style={styles.title}>Select Delivery Location</Text>
      <Text style={styles.subtitle}>Deliver To</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.form}>
        {/* FULL NAME * */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>FULL NAME *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Ramesh Kumar"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        {/* MOBILE NUMBER * */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>MOBILE NUMBER *</Text>
          <TextInput
            style={styles.input}
            placeholder="10-digit Indian mobile number"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        {/* PIN CODE * (Requirement 2 & 3 & 71 & 72) */}
        <View style={styles.inputGroup}>
          <View style={styles.pinHeaderRow}>
            <Text style={styles.label}>PIN CODE *</Text>
            {validatingPin && <ActivityIndicator size="small" color="#16a34a" />}
          </View>

          {/* Important PIN Code Prominent Warning Labels */}
          <Text style={styles.pinNoticeTitle}>Important: Enter the correct delivery PIN code.</Text>
          <Text style={styles.pinNoticeSub}>Incorrect PIN code may prevent delivery.</Text>

          <TextInput
            style={[
              styles.input,
              pinStatus.valid === true && styles.inputSuccess,
              pinStatus.valid === false && styles.inputDanger,
            ]}
            placeholder="e.g. 625001"
            value={pincode}
            onChangeText={setPincode}
            keyboardType="number-pad"
            maxLength={6}
          />

          {/* PIN Status Feedback Banner */}
          {pinStatus.message ? (
            <View
              style={[
                styles.pinStatusBanner,
                pinStatus.valid !== false ? styles.pinBannerSuccess : styles.pinBannerDanger,
              ]}
            >
              <Text
                style={[
                  styles.pinStatusText,
                  pinStatus.valid !== false ? styles.pinTextSuccess : styles.pinTextDanger,
                ]}
              >
                {pinStatus.message}
              </Text>
            </View>
          ) : null}
        </View>

        {/* FULL ADDRESS * */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>FULL ADDRESS *</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="House / Flat No, Building name, Street, Area details"
            value={addressLine}
            onChangeText={setAddressLine}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* LANDMARK (Optional) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Landmark (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Near Anna Bus Stand (Optional)"
            value={landmark}
            onChangeText={setLandmark}
          />
        </View>

        {/* CITY * & STATE * */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>CITY *</Text>
            <TextInput
              style={styles.input}
              placeholder="City"
              value={city}
              onChangeText={setCity}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>STATE *</Text>
            <TextInput
              style={styles.input}
              placeholder="State"
              value={state}
              onChangeText={setState}
            />
          </View>
        </View>

        {/* SAVE AS TYPE CHIPS */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>SAVE ADDRESS AS</Text>
          <View style={styles.typeRow}>
            {(['HOME', 'WORK', 'OTHER'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeChip, type === t && styles.activeTypeChip]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.typeText, type === t && styles.activeTypeText]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CONFIRM LOCATION BUTTON */}
        <TouchableOpacity
          style={[styles.confirmButton, loading && styles.disabledBtn]}
          onPress={handleConfirmAddress}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.confirmButtonText}>Saving Location...</Text>
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
    flexGrow: 1,
  },
  topBackRow: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 16,
  },
  errorText: {
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    padding: 12,
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  pinHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pinNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
    marginTop: 1,
  },
  pinNoticeSub: {
    fontSize: 11,
    color: '#b91c1c',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  multilineInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  inputSuccess: {
    borderColor: '#16a34a',
    borderWidth: 2,
    backgroundColor: '#f0fdf4',
  },
  inputDanger: {
    borderColor: '#ef4444',
    borderWidth: 2,
    backgroundColor: '#fef2f2',
  },
  pinStatusBanner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  pinBannerSuccess: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  pinBannerDanger: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  pinStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pinTextSuccess: {
    color: '#15803d',
  },
  pinTextDanger: {
    color: '#b91c1c',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  activeTypeChip: {
    backgroundColor: '#f0fdf4',
    borderColor: '#16a34a',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  activeTypeText: {
    color: '#15803d',
    fontWeight: '800',
  },
  confirmButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0px 4px 6px rgba(22, 163, 74, 0.3)' } as any)
      : {
          shadowColor: '#16a34a',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }),
    elevation: 3,
  },
  disabledBtn: {
    backgroundColor: '#94a3b8',
    elevation: 0,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
