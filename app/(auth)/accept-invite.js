import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../lib/api';

export default function AcceptInvite() {
  const router = useRouter();
  const { theme } = useTheme();
  const { token: paramToken } = useLocalSearchParams();
  // Support both deep link token and manual paste
  const [token, setToken] = useState(paramToken || '');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  // If AuthContext has a way to set session after accept:
  // we mirror login by saving token + relying on app reload, or call a setter if you add one

  const handleAccept = async () => {
    if (!token.trim()) {
      Alert.alert('Missing token', 'Paste the invite token or open the invite link');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Password', 'Use at least 6 characters');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Password', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const data = await api.post('/invitations/accept', {
        token: token.trim(),
        name: name.trim() || undefined,
        password,
      });

      await AsyncStorage.setItem('token', data.token);
      // Force app to treat user as logged in – simplest: reload by replacing to tabs
      // Better: expose setSession on AuthContext (see note below)
      Alert.alert('Welcome', 'Your account is ready', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
      // Soft reload auth: restart by clearing and the root layout will pick token on next cold start
      // For immediate login, add setSession to AuthContext (snippet below)
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not accept invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.primary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>Elroi</Text>
        <Text style={styles.subtitle}>Join the team</Text>
      </View>

      <View style={[styles.form, { backgroundColor: theme.card }]}>
        <Text style={[styles.label, { color: theme.text }]}>Invite token</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
          placeholder="Paste token from the link"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
          value={token}
          onChangeText={setToken}
        />

        <Text style={[styles.label, { color: theme.text }]}>Your name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
          placeholder="Optional"
          placeholderTextColor={theme.textSecondary}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.label, { color: theme.text }]}>Password</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
          placeholder="••••••••"
          placeholderTextColor={theme.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={[styles.label, { color: theme.text }]}>Confirm password</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
          placeholder="••••••••"
          placeholderTextColor={theme.textSecondary}
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
          onPress={handleAccept}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Join shop</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={{ marginTop: 20 }}>
          <Text style={{ textAlign: 'center', color: theme.primary }}>
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 42, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 16, color: '#4ade80', marginTop: 6 },
  form: { borderRadius: 20, padding: 24 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  btn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 28,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});