import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../lib/api';
import Card from '../components/Card';

const CURRENCIES = [
  { code: 'KES', label: 'Kenyan Shilling (KSH)' },
  { code: 'GBP', label: 'British Pound (£)' },
  { code: 'USD', label: 'US Dollar ($)' },
];

export default function Settings() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuth();
  const { theme, themeKey, setTheme, themes } = useTheme();
  const [saving, setSaving] = useState(false);

  const changeCurrency = async (code) => {
    setSaving(true);
    try {
      await api.patch('/shop/currency', { currency: code });
      updateUser({ currency: code });
      Alert.alert('Saved', `Currency changed to ${code}`);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={{ padding: 16 }}>
      {/* Currency */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Currency</Text>
      <Card style={{ backgroundColor: theme.card }}>
        {CURRENCIES.map((c) => (
          <TouchableOpacity
            key={c.code}
            style={styles.row}
            onPress={() => changeCurrency(c.code)}
            disabled={saving}
          >
            <Text style={[styles.rowLabel, { color: theme.text }]}>{c.label}</Text>
            {user?.currency === c.code && (
              <Ionicons name="checkmark-circle" size={22} color={theme.accent} />
            )}
          </TouchableOpacity>
        ))}
      </Card>

      {/* Theme */}
      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Theme</Text>
      <Card style={{ backgroundColor: theme.card }}>
        {Object.keys(themes).map((key) => (
          <TouchableOpacity
            key={key}
            style={styles.row}
            onPress={() => setTheme(key)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: themes[key].primary }} />
              <Text style={[styles.rowLabel, { color: theme.text }]}>{themes[key].name}</Text>
            </View>
            {themeKey === key && (
              <Ionicons name="checkmark-circle" size={22} color={theme.accent} />
            )}
          </TouchableOpacity>
        ))}
      </Card>

      {/* Subscription */}
      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Billing</Text>
      <Card style={{ backgroundColor: theme.card }}>
        <TouchableOpacity style={styles.row} onPress={() => router.push('/subscription')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="star-outline" size={20} color={theme.primary} />
            <View>
              <Text style={[styles.rowLabel, { color: theme.text }]}>Subscription</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                {user?.plan ? `${user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} plan` : 'Free plan'}
                {user?.planExpiresAt ? ` • expires ${new Date(user.planExpiresAt).toLocaleDateString()}` : ''}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => router.push('/paywall')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="rocket-outline" size={20} color={theme.primary} />
            <Text style={[styles.rowLabel, { color: theme.text }]}>Upgrade Plan</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
        </TouchableOpacity>
      </Card>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: '#ef444415' }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={{ color: '#ef4444', fontWeight: '600', fontSize: 15 }}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  rowLabel: { fontSize: 15 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 40,
    paddingVertical: 14,
    borderRadius: 12,
  },
});