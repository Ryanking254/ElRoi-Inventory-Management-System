import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/Card';
import { PLANS, formatPriceKes } from '../constants/plans';
import { billingService } from '../services/billingService';

const METHODS = [
  { id: 'mpesa', label: 'M-Pesa', icon: 'phone-portrait-outline', active: true },
  { id: 'card', label: 'Card', icon: 'card-outline', active: false },
  { id: 'paypal', label: 'PayPal', icon: 'logo-paypal', active: false },
];

export default function Paywall() {
  const router = useRouter();
  const { user, refreshSubscription, refreshProfile, updateUser } = useAuth();
  const { theme } = useTheme();

  const currentPlan = user?.plan || 'free';
  const [selectedPlan, setSelectedPlan] = useState(currentPlan === 'business' ? 'business' : 'starter');
  const [method, setMethod] = useState('mpesa');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const pollRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handlePay = async () => {
    if (user?.role !== 'owner') {
      Alert.alert('Forbidden', 'Only the shop owner can subscribe.');
      return;
    }

    if (['card', 'paypal'].includes(method)) {
      Alert.alert('Coming soon', method === 'card' ? 'Card payments coming soon – use M-Pesa for now.' : 'PayPal coming soon – use M-Pesa for now.');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Missing phone', 'Please enter your M-Pesa phone number (07..., 7..., or 2547...)');
      return;
    }

    if (selectedPlan === 'free') {
      Alert.alert('Invalid', 'Select Starter or Business to pay.');
      return;
    }

    setLoading(true);
    setStatusMsg('');
    try {
      const res = await billingService.startMpesaStk(selectedPlan, phone.trim());
      setStatusMsg(res.customerMessage || 'STK push sent. Check your phone to complete payment.');
      Alert.alert('Check your phone', 'STK push sent. Enter your M-Pesa PIN to complete the payment.');

      // Poll subscription until plan changes or timeout
      setPolling(true);
      let attempts = 0;
      pollRef.current = setInterval(async () => {
        attempts += 1;
        try {
          const sub = await billingService.getSubscription();
          if (sub?.plan === selectedPlan) {
            clearInterval(pollRef.current);
            setPolling(false);
            setStatusMsg('Payment confirmed! Plan updated.');
            updateUser({ plan: sub.plan, planExpiresAt: sub.planExpiresAt });
            refreshProfile?.();
            Alert.alert('Success', `Upgraded to ${PLANS[selectedPlan].name}!`, [
              { text: 'OK', onPress: () => router.replace('/subscription') },
            ]);
          }
        } catch (_) {}
        if (attempts >= 20) {
          clearInterval(pollRef.current);
          setPolling(false);
          setStatusMsg('Still waiting for confirmation. Pull to refresh on Subscription page.');
        }
      }, 3000);
    } catch (err) {
      const msg = err.message || 'Failed to start payment';
      if (err.code === 'NOT_IMPLEMENTED' || err.status === 501) {
        Alert.alert('Coming soon', msg + ' – use M-Pesa for now.');
      } else {
        Alert.alert('Payment failed', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceholderMethod = (m) => {
    if (!m.active) {
      Alert.alert('Coming soon', `${m.label} payments coming soon – use M-Pesa for now.`);
      return;
    }
    setMethod(m.id);
  };

  const price = PLANS[selectedPlan]?.priceKes || 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: theme.text }]}>Upgrade your shop</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Unlock unlimited items, staff and full report history.
      </Text>

      {/* Current plan notice */}
      <View style={[styles.currentBadge, { backgroundColor: theme.card, borderColor: '#e2e8f0' }]}>
        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
          Current: <Text style={{ fontWeight: '700', color: theme.text }}>{PLANS[currentPlan]?.name || currentPlan}</Text>
        </Text>
      </View>

      {/* Plan selector */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Select plan</Text>
      <View style={{ gap: 12 }}>
        {['starter', 'business'].map((pid) => {
          const p = PLANS[pid];
          const selected = selectedPlan === pid;
          return (
            <TouchableOpacity
              key={pid}
              onPress={() => setSelectedPlan(pid)}
              style={[
                styles.planCard,
                {
                  backgroundColor: theme.card,
                  borderColor: selected ? theme.primary : '#e2e8f0',
                  borderWidth: selected ? 2 : 1,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={[styles.planName, { color: theme.text }]}>{p.name}</Text>
                  <Text style={[styles.planPrice, { color: theme.primary }]}>{formatPriceKes(p.priceKes)}</Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    { borderColor: selected ? theme.primary : '#cbd5e1', backgroundColor: selected ? theme.primary : 'transparent' },
                  ]}
                >
                  {selected && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
              </View>
              <View style={{ marginTop: 10, gap: 6 }}>
                {(p.features || []).map((f) => (
                  <View key={f} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.accent} />
                    <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{f}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Payment method */}
      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Payment method</Text>
      <View style={styles.methodRow}>
        {METHODS.map((m) => {
          const isSelected = method === m.id;
          const disabled = !m.active;
          return (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.methodBtn,
                {
                  backgroundColor: isSelected ? theme.primary : theme.card,
                  borderColor: isSelected ? theme.primary : '#e2e8f0',
                  opacity: disabled && !isSelected ? 0.6 : 1,
                },
              ]}
              onPress={() => handlePlaceholderMethod(m)}
            >
              <Ionicons name={m.icon} size={22} color={isSelected ? '#fff' : theme.textSecondary} />
              <Text
                style={{
                  color: isSelected ? '#fff' : theme.text,
                  fontWeight: '600',
                  fontSize: 13,
                  textAlign: 'center',
                  marginTop: 6,
                }}
              >
                {m.label}
              </Text>
              {!m.active && (
                <Text style={{ fontSize: 10, color: isSelected ? '#fff' : '#94a3b8', marginTop: 2 }}>Soon</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* M-Pesa phone */}
      {method === 'mpesa' ? (
        <Card style={{ backgroundColor: theme.card, marginTop: 16 }}>
          <Text style={[styles.label, { color: theme.text }]}>M-Pesa phone number</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>
            Use 07…, 7… or 2547… – we'll normalize automatically
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.background, color: theme.text, borderColor: '#e2e8f0' },
            ]}
            placeholder="07XXXXXXXX or 2547XXXXXXXX"
            placeholderTextColor={theme.textSecondary}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 6 }}>
            You'll receive an STK prompt. Enter your M-Pesa PIN to pay KSh {price.toLocaleString()}.
          </Text>
        </Card>
      ) : (
        <Card style={{ backgroundColor: theme.card, marginTop: 16, alignItems: 'center', paddingVertical: 20 }}>
          <Ionicons name="time-outline" size={32} color={theme.textSecondary} />
          <Text style={{ color: theme.text, fontWeight: '600', marginTop: 8 }}>
            {method === 'card' ? 'Card payments' : 'PayPal'} coming soon
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 4 }}>
            Please use M-Pesa for now.
          </Text>
        </Card>
      )}

      {statusMsg ? (
        <View style={[styles.statusBox, { backgroundColor: '#f0fdf4', borderColor: theme.accent }]}>
          <ActivityIndicator color={theme.primary} size="small" />
          <Text style={{ color: theme.text, fontSize: 13, flex: 1 }}>{statusMsg}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[
          styles.payBtn,
          { backgroundColor: theme.primary, opacity: loading || polling ? 0.7 : 1 },
        ]}
        onPress={handlePay}
        disabled={loading || polling}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : polling ? (
          <>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.payText}>Waiting for confirmation…</Text>
          </>
        ) : (
          <Text style={styles.payText}>
            {method === 'mpesa' ? `Pay KSh ${price.toLocaleString()} via M-Pesa` : `Continue with ${method}`}
          </Text>
        )}
      </TouchableOpacity>

      {polling && (
        <TouchableOpacity
          style={{ marginTop: 12, alignItems: 'center' }}
          onPress={async () => {
            try {
              const sub = await billingService.getSubscription();
              if (sub?.plan) {
                updateUser({ plan: sub.plan, planExpiresAt: sub.planExpiresAt });
                if (sub.plan === selectedPlan) {
                  if (pollRef.current) clearInterval(pollRef.current);
                  setPolling(false);
                  Alert.alert('Success', 'Plan updated!');
                  router.replace('/subscription');
                } else {
                  Alert.alert('Still pending', 'Payment not yet confirmed. Keep your phone nearby.');
                }
              }
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          }}
        >
          <Text style={{ color: theme.primary, fontWeight: '600' }}>Check status manually</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }} onPress={() => router.back()}>
        <Text style={{ color: theme.textSecondary }}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 4 },
  currentBadge: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 10 },
  planCard: { padding: 16, borderRadius: 16 },
  planName: { fontSize: 18, fontWeight: '700' },
  planPrice: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  radio: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodRow: { flexDirection: 'row', gap: 10 },
  methodBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  statusBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  payBtn: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  payText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
