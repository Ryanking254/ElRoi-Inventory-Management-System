import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/Card';
import { api } from '../../lib/api';

export default function More() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTeam = useCallback(async () => {
    try {
      const data = await api.get('/team').catch(() => []);
      setTeam(Array.isArray(data) ? data : []);
    } catch (err) {
      setTeam([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTeam();
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const currencyLabel = {
    KES: 'KSh (Kenyan Shilling)',
    GBP: '£ (British Pound)',
    USD: '$ (US Dollar)',
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Profile */}
      <Card style={[styles.profileCard, { backgroundColor: theme.card }]}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>
            {(user?.name || 'O').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.text }]}>
            {user?.name || 'Owner'}
          </Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>
            {user?.email || ''}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: theme.primary + '20' }]}>
            <Text style={[styles.roleText, { color: theme.primary }]}>
              {user?.role || 'owner'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Shop info */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Shop</Text>
      <Card style={{ backgroundColor: theme.card }}>
        <View style={styles.infoRow}>
          <Ionicons name="storefront-outline" size={20} color={theme.primary} />
          <Text style={[styles.infoLabel, { color: theme.text }]}>Shop Name</Text>
          <Text style={[styles.infoValue, { color: theme.textSecondary }]}>
            {user?.shopName || 'Elroi Shop'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={20} color={theme.primary} />
          <Text style={[styles.infoLabel, { color: theme.text }]}>Currency</Text>
          <Text style={[styles.infoValue, { color: theme.textSecondary }]}>
            {currencyLabel[user?.currency] || user?.currency || 'KES'}
          </Text>
        </View>
      </Card>

      {/* Team */}
      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>
        Team Members
      </Text>
      <Card style={{ backgroundColor: theme.card }}>
        {loading ? (
          <ActivityIndicator color={theme.primary} style={{ marginVertical: 20 }} />
        ) : team.length === 0 ? (
          <Text style={[styles.empty, { color: theme.textSecondary }]}>
            No team members yet
          </Text>
        ) : (
          team.map((member) => (
            <View key={member.id} style={styles.memberRow}>
              <View style={[styles.memberAvatar, { backgroundColor: theme.primaryLight }]}>
                <Text style={styles.memberInitial}>
                  {(member.name || member.email || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.memberName, { color: theme.text }]}>
                  {member.name || 'Unnamed'}
                </Text>
                <Text style={[styles.memberEmail, { color: theme.textSecondary }]}>
                  {member.email}
                </Text>
              </View>
              <View
                style={[
                  styles.roleChip,
                  {
                    backgroundColor:
                      member.role === 'owner' ? theme.primary + '20' : theme.accent + '20',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.roleChipText,
                    { color: member.role === 'owner' ? theme.primary : theme.accent },
                  ]}
                >
                  {member.role}
                </Text>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity
          style={[styles.inviteBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/invite')}
        >
          <Ionicons name="person-add-outline" size={18} color="#fff" />
          <Text style={styles.inviteText}>Invite Team Member</Text>
        </TouchableOpacity>
      </Card>

      {/* Settings link */}
      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>
        Settings
      </Text>
      <Card style={{ backgroundColor: theme.card }}>
        <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={20} color={theme.primary} />
          <Text style={[styles.settingLabel, { color: theme.text }]}>
            Currency & Theme
          </Text>
          <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
        </TouchableOpacity>
      </Card>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: '#ef444415' }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  name: { fontSize: 18, fontWeight: '700' },
  email: { fontSize: 13, marginTop: 2 },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  roleText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  infoLabel: { flex: 1, fontSize: 15 },
  infoValue: { fontSize: 13 },
  empty: { textAlign: 'center', paddingVertical: 16 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitial: { color: '#fff', fontWeight: '700' },
  memberName: { fontSize: 14, fontWeight: '600' },
  memberEmail: { fontSize: 12 },
  roleChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  roleChipText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  inviteText: { color: '#fff', fontWeight: '600' },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  settingLabel: { flex: 1, fontSize: 15 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 30,
    paddingVertical: 14,
    borderRadius: 12,
  },
  logoutText: { color: '#ef4444', fontWeight: '600', fontSize: 15 },
});