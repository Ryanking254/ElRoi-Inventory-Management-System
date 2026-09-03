import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { api } from '../lib/api';

export default function Invite() {
  const router = useRouter();
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('staff');
  const [saving, setSaving] = useState(false);
  const [inviteLink, setInviteLink] = useState(null);
  const [invitedEmail, setInvitedEmail] = useState('');

  const handleInvite = async () => {
    if (!email.trim()) {
      Alert.alert('Missing email', 'Please enter an email address');
      return;
    }

    setSaving(true);
    try {
      const data = await api.post('/invitations', {
        email: email.trim().toLowerCase(),
        role,
      });

      const link =
        data.inviteLink ||
        `elroi-inventory://invite/${data.token}`;

      setInvitedEmail(email.trim());
      setInviteLink(link);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not create invitation');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteLink) return;
    await Clipboard.setStringAsync(inviteLink);
    Alert.alert('Copied', 'Invite link copied to clipboard');
  };

  const handleShare = async () => {
    if (!inviteLink) return;
    try {
      await Share.share({
        message: `You're invited to join our shop on Elroi Inventory.\n\nOpen this link to accept:\n${inviteLink}`,
        title: 'Elroi Inventory Invite',
      });
    } catch (err) {
      // user cancelled
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {!inviteLink ? (
        <>
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
            {['staff', 'owner'].map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.roleBtn,
                  {
                    backgroundColor: role === r ? theme.primary : theme.card,
                    borderColor: role === r ? theme.primary : '#e2e8f0',
                  },
                ]}
                onPress={() => setRole(r)}
              >
                <Text
                  style={{
                    fontWeight: '600',
                    color: role === r ? '#fff' : theme.textSecondary,
                    textTransform: 'capitalize',
                  }}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
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
              <Text style={styles.saveText}>Create Invitation</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={[styles.successBox, { backgroundColor: theme.card }]}>
            <Ionicons name="checkmark-circle" size={48} color={theme.accent} />
            <Text style={[styles.successTitle, { color: theme.text }]}>
              Invitation created
            </Text>
            <Text style={[styles.successSub, { color: theme.textSecondary }]}>
              Share this link with {invitedEmail} via WhatsApp or any app
            </Text>

            <View
              style={[
                styles.linkBox,
                { backgroundColor: theme.background, borderColor: '#e2e8f0' },
              ]}
            >
              <Text
                style={[styles.linkText, { color: theme.text }]}
                numberOfLines={4}
                selectable
              >
                {inviteLink}
              </Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: theme.card, borderColor: theme.primary },
              ]}
              onPress={handleCopy}
            >
              <Ionicons name="copy-outline" size={20} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.primary }]}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.primary }]}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={20} color="#fff" />
              <Text style={[styles.actionText, { color: '#fff' }]}>Share</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{ marginTop: 24, alignItems: 'center' }}
            onPress={() => {
              setInviteLink(null);
              setEmail('');
              setInvitedEmail('');
            }}
          >
            <Text style={{ color: theme.primary, fontWeight: '600' }}>
              Invite another person
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 16, alignItems: 'center' }}
            onPress={() => router.back()}
          >
            <Text style={{ color: theme.textSecondary }}>Done</Text>
          </TouchableOpacity>
        </>
      )}
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
  successBox: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginTop: 20,
  },
  successTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  successSub: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  linkBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    width: '100%',
  },
  linkText: { fontSize: 13 },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionText: { fontWeight: '700', fontSize: 15 },
});