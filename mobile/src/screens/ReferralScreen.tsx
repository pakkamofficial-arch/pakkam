import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, Gift, Share2, Copy } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Colors, Radii, Spacing } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';

export const ReferralScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const code = user?.referralCode || 'PK88219';

  const handleCopy = () => {
    alert(`Referral code ${code} copied!`);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 60 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invite & Earn</Text>
          <View style={{ width: 22 }} />
        </View>

        <View style={styles.bannerCard}>
          <Gift size={48} color={Colors.primary} strokeWidth={1.75} />
          <Text style={styles.bannerTitle}>Earn ₹50 per Referral!</Text>
          <Text style={styles.bannerSub}>
            Share your unique code with friends. When they sign up on PAKKAM, you both get ₹50 credited to your Pakkam Wallet!
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Your Referral Code</Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{code}</Text>
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
            <Copy size={16} color={Colors.primary} strokeWidth={2} />
            <Text style={styles.copyText}>Copy</Text>
          </TouchableOpacity>
        </View>

        <PrimaryButton
          title="Share Invite Link"
          onPress={() => alert(`Share referral code: ${code}`)}
          style={{ marginTop: Spacing.lg }}
        />
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
  bannerCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 10,
  },
  bannerSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  codeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.chipSelected,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Radii.md,
    padding: Spacing.md,
  },
  codeText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
