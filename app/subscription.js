import React, { useEffect, useState, useCallback } from 'react';
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
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/Card';
import { PLANS, formatPriceKes } from '../constants/plans';
import { billingService } from '../services/billingService';

export default function Subscription() {
  const router = useRouter();
  const { user, refreshSubscription } = useAuth();
  const { theme } = useTheme();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await billingService.getSubscription();
      setSubscription(data);
    } catch (err) {
      // Fallback to user context if billing endpoint fails
      const planId = user?.plan || 'free';
      const plan = PLANS[planId] || PLANS.free;
      setSubscription({
        plan: planId,
        planName: plan.name,
        planExpiresAt: user?.planExpiresAt || null,
        priceKes: plan.priceKes,
        limits: {
          maxItems: plan.maxItems,
          maxStaff: plan.maxStaff,
          reportDays: plan.reportDays,
        },
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.plan, user?.planExpiresAt]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    refreshSubscription?.();
    load();
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const planId = subscription?.plan || 'free';
  const plan = PLANS[planId] || PLANS.free;
  const isOwner = user?.role === 'owner';
  const expiry = subscription?.planExpiresAt ? new Date(subscription.planExpiresAt) : null;
  const isExpiringSoon = expiry ? (expiry - new Date()) / (1000 * 60 * 60 * 24) < 5 : false;

  const features = plan.features || [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {!isOwner && (
        <Card style={[styles.warning, { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}>
          <Ionicons name="lock-closed-outline" size={20} color="#92400e" />
          <Text style={{ color: '#92400e', flex: 1, fontSize: 13 }}>
            Only the shop owner can manage subscriptions.
          </Text>
        </Card>
      )}

      {/* Current plan */}
      <Card style={[styles.planCard, { backgroundColor: theme.card, borderColor: theme.primary + '20' }]}>
        <View style={styles.planHeader}>
          <View>
            <Text style={[styles.planName, { color: theme.text }]}>{plan.name}</Text>
            <Text style={[styles.planPrice, { color: theme.textSecondary }]}>
              {formatPriceKes(plan.priceKes)}
            </Text>
          </View>
          <View style={[styles.planBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.planBadgeText}>{planId === 'free' ? 'FREE' : 'ACTIVE'}</Text>
          </View>
        </View>

        {expiry && (
          <View style={[styles.expiryRow, { backgroundColor: isExpiringSoon ? '#fef2f2' : theme.background }]}>
            <Ionicons name="calendar-outline" size={16} color={isExpiringSoon ? '#ef4444' : theme.textSecondary} />
            <Text style={{ color: isExpiringSoon ? '#ef4444' : theme.textSecondary, fontSize: 13 }}>
              {planId === 'free' ? 'No expiry' : `Expires: ${expiry.toLocaleDateString()} ${expiry.toLocaleTimeString()}`}
            </Text>
          </View>
        )}

        <View style={styles.features}>
          {features.map((f) => (
            <View key={f} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color={theme.accent} />
              <Text style={[styles.featureText, { color: theme.text }]}>{f}</Text>
            </View>
          ))}
        </View>

        <View style={styles.limitsRow}>
          <View style={[styles.limitChip, { backgroundColor: theme.background }]}>
            <Text style={[styles.limitLabel, { color: theme.textSecondary }]}>Items</Text>
            <Text style={[styles.limitValue, { color: theme.text }]}>
              {plan.maxItems === null ? 'Unlimited' : `${plan.maxItems}`}
            </Text>
          </View>
          <View style={[styles.limitChip, { backgroundColor: theme.background }]}>
            <Text style={[styles.limitLabel, { color: theme.textSecondary }]}>Staff</Text>
            <Text style={[styles.limitValue, { color: theme.text }]}>
              {plan.maxStaff === null ? 'Unlimited' : `${plan.maxStaff}`}
            </Text>
          </View>
          <View style={[styles.limitChip, { backgroundColor: theme.background }]}>
            <Text style={[styles.limitLabel, { color: theme.textSecondary }]}>Reports</Text>
            <Text style={[styles.limitValue, { color: theme.text }]}>
              {plan.reportDays === null ? 'Full' : `${plan.reportDays} days`}
            </Text>
          </View>
        </View>
      </Card>

      {/* Actions */}
      {isOwner && (
        <TouchableOpacity
          style={[styles.upgradeBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/paywall')}
        >
          <Ionicons name="rocket-outline" size={20} color="#fff" />
          <Text style={styles.upgradeText}>
            {planId === 'free' ? 'Upgrade Plan' : 'Change Plan'}
          </Text>
        </TouchableOpacity>
      )}

      {/* All plans comparison */}
      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>All Plans</Text>
      {Object.values(PLANS).map((p) => {
        const active = p.id === planId;
        return (
          <Card
            key={p.id}
            style={{
              backgroundColor: theme.card,
              borderWidth: active ? 2 : 1,
              borderColor: active ? theme.primary : '#e2e8f0',
              marginBottom: 12,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.compareName, { color: theme.text }]}>{p.name}</Text>
              <Text style={[styles.comparePrice, { color: theme.primary }]}>{formatPriceKes(p.priceKes)}</Text>
            </View>
            <View style={{ marginTop: 8, gap: 6 }}>
              {(p.features || []).map((f) => (
                <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="checkmark" size={14} color={theme.accent} />
                  <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{f}</Text>
                </View>
              ))}
            </View>
            {active && (
              <View style={[styles.activeLabel, { backgroundColor: theme.primary + '15' }]}>
                <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 12 }}>Current plan</Text>
              </View>
            )}
          </Card>
        );
      })}

      <TouchableOpacity
        style={{ marginTop: 8, alignItems: 'center' }}
        onPress={() => refreshSubscription?.().then(load)}
      >
        <Text style={{ color: theme.primary, fontWeight: '600' }}>Refresh status</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  planCard: { borderWidth: 1, padding: 20 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planName: { fontSize: 22, fontWeight: '800' },
  planPrice: { fontSize: 15, marginTop: 4, fontWeight: '600' },
  planBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  planBadgeText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 10,
    borderRadius: 10,
  },
  features: { marginTop: 16, gap: 10 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 14 },
  limitsRow: { flexDirection: 'row', gap: 8, marginTop: 20 },
  limitChip: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 10 },
  limitLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  limitValue: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  upgradeText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  compareName: { fontSize: 16, fontWeight: '700' },
  comparePrice: { fontSize: 14, fontWeight: '700' },
  activeLabel: { marginTop: 12, padding: 8, borderRadius: 8, alignItems: 'center' },
});
