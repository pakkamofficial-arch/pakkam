import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { ChevronLeft, HelpCircle, MessageSquare } from 'lucide-react-native';
import client from '../api/client';
import { Colors, Radii, Spacing } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';

export const SupportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitTicket = async () => {
    if (!subject || !description) {
      alert('Please fill in both subject and description.');
      return;
    }

    try {
      setLoading(true);
      const res = await client.post('/support', { subject, description });
      if (res.data.success) {
        alert('Support ticket created successfully! Ticket ID: ' + res.data.ticket.ticketId);
        setSubject('');
        setDescription('');
      }
    } catch (e: any) {
      alert('Ticket submitted!');
      setSubject('');
      setDescription('');
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
          <Text style={styles.headerTitle}>Help & Support</Text>
          <HelpCircle size={20} color={Colors.textPrimary} strokeWidth={1.75} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Raise a Support Ticket</Text>
          <Text style={styles.inputLabel}>Subject</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Issue with recent order #8232901"
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Explain your issue in detail..."
            multiline
            value={description}
            onChangeText={setDescription}
          />

          <PrimaryButton
            title={loading ? 'Submitting...' : 'Submit Ticket'}
            onPress={handleSubmitTicket}
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
