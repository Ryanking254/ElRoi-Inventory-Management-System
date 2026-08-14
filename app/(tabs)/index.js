import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/Card';
import {
  formatCurrency, getTodayStats, getTotalStockValue, getLowStockItems,
} from '../../lib/calculations';
import { itemService } from '../../services/itemService';
import { movementService } from '../../services/movementService';
import { reportService } from '../../services/reportService';

const screenWidth = Dimensions.get('window').width;

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const currency = user?.currency || 'KES';

  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 6);

      const startStr = start.toISOString().slice(0, 10);
      const endStr = end.toISOString().slice(0, 10);

      const [itemsData, movesData, daily] = await Promise.all([
        itemService.getAll().catch(() => []),
        movementService.getAll({ limit: 50 }).catch(() => []),
        reportService.getDaily(startStr, endStr).catch(() => []),
      ]);

      setItems(itemsData || []);
      setMovements(movesData || []);
      setDailyData(daily || []);
    } catch (err) {
      console.log('Dashboard load error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const today = getTodayStats(movements);
  const stockValue = getTotalStockValue(items);
  const lowStock = getLowStockItems(items);

  const chartData = {
    labels: dailyData.length
      ? dailyData.map((d) => d.date.slice(8))
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: dailyData.length
          ? dailyData.map((d) => d.revenue || 0)
          : [0, 0, 0, 0, 0, 0, 0],
        color: () => theme.accent,
        strokeWidth: 2,
      },
    ],
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={[styles.greeting, { color: theme.text }]}>
        Hello, {user?.name || 'Owner'} 👋
      </Text>
      <Text style={[styles.shopName, { color: theme.textSecondary }]}>
        {user?.shopName || 'Elroi Shop'}
      </Text>

      {/* Metrics */}
      <View style={styles.metricsRow}>
        <Card style={[styles.metricCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Today Revenue</Text>
          <Text style={[styles.metricValue, { color: theme.text }]}>
            {formatCurrency(today.revenue, currency)}
          </Text>
        </Card>
        <Card style={[styles.metricCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Today Profit</Text>
          <Text style={[styles.metricValue, { color: theme.accent }]}>
            {formatCurrency(today.profit, currency)}
          </Text>
        </Card>
      </View>

      <View style={styles.metricsRow}>
        <Card style={[styles.metricCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Stock Value</Text>
          <Text style={[styles.metricValue, { color: theme.text }]}>
            {formatCurrency(stockValue, currency)}
          </Text>
        </Card>
        <Card style={[styles.metricCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Low Stock</Text>
          <Text style={[styles.metricValue, { color: lowStock.length ? '#f59e0b' : theme.text }]}>
            {lowStock.length} items
          </Text>
        </Card>
      </View>

      {/* Chart */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Revenue (Last 7 days)</Text>
      <Card style={{ backgroundColor: theme.card, paddingVertical: 12 }}>
        <LineChart
          data={chartData}
          width={screenWidth - 64}
          height={180}
          chartConfig={{
            backgroundColor: theme.card,
            backgroundGradientFrom: theme.card,
            backgroundGradientTo: theme.card,
            decimalPlaces: 0,
            color: () => theme.primary,
            labelColor: () => theme.textSecondary,
            propsForDots: { r: '4', strokeWidth: '2', stroke: theme.accent },
          }}
          bezier
          style={{ borderRadius: 12 }}
        />
      </Card>

      {/* Quick actions */}
      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/record-sale')}
        >
          <Ionicons name="cart-outline" size={22} color="#fff" />
          <Text style={styles.actionText}>Record Sale</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.accent }]}
          onPress={() => router.push('/add-item')}
        >
          <Ionicons name="add-circle-outline" size={22} color="#fff" />
          <Text style={styles.actionText}>Add Item</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  greeting: { fontSize: 22, fontWeight: '700' },
  shopName: { fontSize: 14, marginBottom: 16 },
  metricsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  metricCard: { flex: 1, padding: 14 },
  metricLabel: { fontSize: 12, marginBottom: 4 },
  metricValue: { fontSize: 18, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10, marginTop: 8 },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 12,
  },
  actionText: { color: '#fff', fontWeight: '600' },
});