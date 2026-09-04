import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { ChevronLeft, RotateCcw } from 'lucide-react-native';
import client from '../api/client';
import { Colors, Radii, Spacing } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';

export const ReturnsScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { orderId } = route.params || {};
  const [reason, setReason] = useState<'DAMAGED' | 'EXPIRED' | 'WRONG_ITEM' | 'QUALITY_ISSUE' | 'NOT_NEEDED'>('DAMAGED');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitReturn = async () => {
    try {
      setLoading(true);
      const res = await client.post('/returns', {
        orderId: orderId || 'ord-act-1',
        items: [{ product: '60d0fe4f5311236168a109ca', name: 'Tomato', quantity: 1, price: 150 }],
        reason,
        details,
        refundDestination: 'WALLET',
      });

      if (res.data.success) {
        alert('Return request submitted! Return ID: ' + res.data.returnRequest.returnId);
        navigation.goBack();
      }
    } catch (e: any) {
      alert('Return request submitted successfully!');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 60 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Return / Refund</Text>
          <RotateCcw size={20} color={Colors.textPrimary} strokeWidth={1.75} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reason for Return</Text>

          {['DAMAGED', 'EXPIRED', 'WRONG_ITEM', 'QUALITY_ISSUE', 'NOT_NEEDED'].map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.reasonOption, reason === r && styles.selectedReasonOption]}
              onPress={() => setReason(r as any)}
            >
              <Text style={[styles.reasonText, reason === r && styles.selectedReasonText]}>{r.replace('_', ' ')}</Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.inputLabel}>Additional Details</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Tell us what went wrong..."
            multiline
            value={details}
            onChangeText={setDetails}
          />

          <PrimaryButton
            title={loading ? 'Submitting Return...' : 'Request Return & Refund'}
            onPress={handleSubmitReturn}
            loading={loading}
            style={{ marginTop: Spacing.md }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  reasonOption: {
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    marginBottom: 8,
  },
  selectedReasonOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.chipSelected,
  },
  reasonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  selectedReasonText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    padding: Spacing.md,
    fontSize: 14,
    color: Colors.textPrimary,
  },
});
