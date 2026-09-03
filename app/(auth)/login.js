import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Login failed', err.message);
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
        <Text style={styles.subtitle}>Inventory Management</Text>
      </View>

      <View style={[styles.form, { backgroundColor: theme.card }]}>
        <Text style={[styles.label, { color: theme.text }]}>Email</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: '#e2e8f0' }]}
          placeholder="you@example.com"
          placeholderTextColor="#94a3b8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={[styles.label, { color: theme.text }]}>Password</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: '#e2e8f0' }]}
          placeholder="••••••••"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/signup')} style={{ marginTop: 20 }}>
          <Text style={{ textAlign: 'center', color: theme.primary }}>
            Don't have an account? <Text style={{ fontWeight: '700' }}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(auth)/accept-invite')}>
          <Text style={{ textAlign: 'center', color: theme.primary, marginTop: 12 }}>
            Have an invite token? Join a shop
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 42, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 16, color: '#4ade80', marginTop: 6 },
  form: { borderRadius: 20, padding: 24 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
  },
  btn: {
    paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 28,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});