import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { api } from '../lib/api';

export default function Invite() {
  const router = useRouter();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('staff');
  const [saving, setSaving] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) {
      Alert.alert('Missing email', 'Please enter an email address');
      return;
    }

    setSaving(true);
    try {
      await api.post('/invitations', {
        email: email.trim().toLowerCase(),
        role,
      });
      Alert.alert('Invitation Sent', `Invite sent to ${email}`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not send invitation');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.label, { color: theme.text }]}>Email Address</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.card, color: theme.text, borderColor: '#e2e8f0' },
        ]}
        placeholder="colleague@example.com"
        placeholderTextColor={theme.textSecondary}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={[styles.label, { color: theme.text }]}>Role</Text>
      <View style={styles.roleRow}>
        <TouchableOpacity
          style={[
            styles.roleBtn,
            {
              backgroundColor: role === 'staff' ? theme.primary : theme.card,
              borderColor: role === 'staff' ? theme.primary : '#e2e8f0',
            },
          ]}
          onPress={() => setRole('staff')}
        >
          <Text
            style={{
              fontWeight: '600',
              color: role === 'staff' ? '#fff' : theme.textSecondary,
            }}
          >
            Staff
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.roleBtn,
            {
              backgroundColor: role === 'owner' ? theme.primary : theme.card,
              borderColor: role === 'owner' ? theme.primary : '#e2e8f0',
            },
          ]}
          onPress={() => setRole('owner')}
        >
          <Text
            style={{
              fontWeight: '600',
              color: role === 'owner' ? '#fff' : theme.textSecondary,
            }}
          >
            Owner
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.saveBtn,
          { backgroundColor: theme.primary, opacity: saving ? 0.7 : 1 },
        ]}
        onPress={handleInvite}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Send Invitation</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  roleRow: { flexDirection: 'row', gap: 12 },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});