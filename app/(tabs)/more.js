import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import { api } from '../../lib/api'; // we will use this for team later

export default function More() {
  const router = useRouter();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTeam = useCallback(async () => {
    try {
      // Later this will be a real endpoint: /team or /users
      // For now we just keep it empty until the backend is ready
      const data = await api.get('/team').catch(() => []);
      setTeam(data || []);
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Profile */}
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>EO</Text>
        </View>
        <View>
          <Text style={styles.name}>Alex Owner</Text>
          <Text style={styles.email}>owner@elroi.com</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Owner</Text>
          </View>
        </View>
      </Card>

      {/* Team */}
      <Text style={styles.sectionTitle}>Team Members</Text>
      <Card>
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
        ) : team.length === 0 ? (
          <Text style={styles.empty}>No team members yet</Text>
        ) : (
          team.map((member) => (
            <View key={member.id} style={styles.memberRow}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberInitial}>
                  {(member.name || member.email || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>{member.name || 'Unnamed'}</Text>
                <Text style={styles.memberEmail}>{member.email}</Text>
              </View>
              <View
                style={[
                  styles.roleChip,
                  {
                    backgroundColor:
                      member.role === 'owner' ? Colors.primary + '20' : Colors.accent + '20',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.roleChipText,
                    { color: member.role === 'owner' ? Colors.primary : Colors.accent },
                  ]}
                >
                  {member.role}
                </Text>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity
          style={styles.inviteBtn}
          onPress={() => router.push('/invite')}
        >
          <Ionicons name="person-add-outline" size={18} color={Colors.white} />
          <Text style={styles.inviteText}>Invite Team Member</Text>
        </TouchableOpacity>
      </Card>

      {/* Settings */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Settings</Text>
      <Card>
        {[
          { icon: 'storefront-outline', label: 'Shop Name', value: 'Elroi Shop' },
          { icon: 'cash-outline', label: 'Currency', value: 'USD ($)' },
          { icon: 'notifications-outline', label: 'Low Stock Alerts', value: 'On' },
          { icon: 'color-palette-outline', label: 'Theme', value: 'Green' },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={styles.settingRow}>
            <Ionicons name={item.icon} size={20} color={Colors.primary} />
            <Text style={styles.settingLabel}>{item.label}</Text>
            <Text style={styles.settingValue}>{item.value}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
          </TouchableOpacity>
        ))}
      </Card>

      <TouchableOpacity style={styles.logoutBtn}>
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontSize: 22, fontWeight: '700' },
  name: { fontSize: 18, fontWeight: '700', color: Colors.text },
  email: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  roleText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  empty: { textAlign: 'center', color: Colors.textLight, paddingVertical: 16 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitial: { color: Colors.white, fontWeight: '700' },
  memberName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  memberEmail: { fontSize: 12, color: Colors.textLight },
  roleChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  roleChipText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  inviteText: { color: Colors.white, fontWeight: '600' },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLabel: { flex: 1, fontSize: 15, color: Colors.text },
  settingValue: { fontSize: 13, color: Colors.textSecondary, marginRight: 4 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 30,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.danger + '15',
  },
  logoutText: { color: Colors.danger, fontWeight: '600', fontSize: 15 },
});