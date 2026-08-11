import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import MetricCard from '../../components/MetricCard';
import {
  getLowStockItems,
  getTodayStats,
  getTotalStockValue,
  getTotalItems,
  formatCurrency,
} from '../../lib/calculations';
import { itemService } from '../../services/itemService';
import { movementService } from '../../services/movementService';
import { reportService } from '../../services/reportService';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [itemsData, movementsData, reportData] = await Promise.all([
        itemService.getAll(),
        movementService.getAll({ limit: 10 }),
        reportService.getDaily(
          new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          new Date().toISOString().slice(0, 10)
        ),
      ]);
      setItems(itemsData || []);
      setMovements(movementsData || []);
      setDailyData(reportData || []);
    } catch (err) {
      console.log('Dashboard load error:', err.message);
      // Keep empty arrays so UI still works
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

  const lowStock = getLowStockItems(items);
  const today = getTodayStats(movements);
  const stockValue = getTotalStockValue(items);
  const totalUnits = getTotalItems(items);

  const chartData = {
    labels: dailyData.map((d) => (d.date || '').slice(8)),
    datasets: [
      {
        data: dailyData.length ? dailyData.map((d) => d.revenue || 0) : [0],
        color: () => Colors.primary,
        strokeWidth: 2,
      },
      {
        data: dailyData.length ? dailyData.map((d) => d.profit || 0) : [0],
        color: () => Colors.accent,
        strokeWidth: 2,
      },
    ],
    legend: ['Revenue', 'Profit'],
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Welcome */}
      <View style={styles.welcome}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.shopName}>Elroi Shop</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>EO</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
          onPress={() => router.push('/record-sale')}
        >
          <Ionicons name="cart-outline" size={22} color="#fff" />
          <Text style={styles.actionText}>Record Sale</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: Colors.accent }]}
          onPress={() => router.push('/add-item')}
        >
          <Ionicons name="add-circle-outline" size={22} color="#fff" />
          <Text style={styles.actionText}>Add Item</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: Colors.primaryLight }]}
          onPress={() => router.push('/adjust-stock')}
        >
          <Ionicons name="swap-vertical-outline" size={22} color="#fff" />
          <Text style={styles.actionText}>Adjust</Text>
        </TouchableOpacity>
      </View>

      {/* Metric Cards */}
      <View style={styles.metricsRow}>
        <MetricCard
          title="Today Revenue"
          value={formatCurrency(today.revenue)}
          subtitle={`${today.salesCount} sales`}
          color={Colors.primary}
          icon={<Ionicons name="cash-outline" size={18} color={Colors.primary} />}
        />
        <View style={{ width: 12 }} />
        <MetricCard
          title="Today Profit"
          value={formatCurrency(today.profit)}
          subtitle="Net"
          color={Colors.accent}
          icon={<Ionicons name="trending-up-outline" size={18} color={Colors.accent} />}
        />
      </View>

      <View style={[styles.metricsRow, { marginTop: 12 }]}>
        <MetricCard
          title="Stock Value"
          value={formatCurrency(stockValue)}
          subtitle={`${totalUnits} units`}
          color={Colors.primaryDark}
          icon={<Ionicons name="cube-outline" size={18} color={Colors.primaryDark} />}
        />
        <View style={{ width: 12 }} />
        <MetricCard
          title="Low Stock"
          value={String(lowStock.length)}
          subtitle="items need attention"
          color={Colors.warning}
          icon={<Ionicons name="warning-outline" size={18} color={Colors.warning} />}
        />
      </View>

      {/* Chart */}
      <Card style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Revenue & Profit (Last 7 days)</Text>
        {dailyData.length > 0 ? (
          <LineChart
            data={chartData}
            width={width - 64}
            height={200}
            chartConfig={{
              backgroundColor: Colors.white,
              backgroundGradientFrom: Colors.white,
              backgroundGradientTo: Colors.white,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(13, 79, 60, ${opacity})`,
              labelColor: () => Colors.textSecondary,
              propsForDots: { r: '4', strokeWidth: '2', stroke: Colors.primary },
              propsForBackgroundLines: { stroke: Colors.border },
            }}
            bezier
            style={styles.chart}
            withInnerLines
            withOuterLines={false}
          />
        ) : (
          <Text style={styles.emptyText}>No sales data yet</Text>
        )}
      </Card>

      {/* Low Stock */}
      {lowStock.length > 0 && (
        <Card style={styles.lowStockCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Low Stock Alerts</Text>
            <TouchableOpacity onPress={() => router.push('/inventory')}>
              <Text style={styles.link}>View all</Text>
            </TouchableOpacity>
          </View>
          {lowStock.map((item) => (
            <View key={item.id} style={styles.lowStockRow}>
              <View style={styles.lowStockLeft}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: item.currentStock === 0 ? Colors.danger : Colors.warning },
                  ]}
                />
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCat}>{item.category?.name || item.categoryName}</Text>
                </View>
              </View>
              <Text
                style={[
                  styles.stockCount,
                  { color: item.currentStock === 0 ? Colors.danger : Colors.warning },
                ]}
              >
                {item.currentStock} left
              </Text>
            </View>
          ))}
        </Card>
      )}

      {/* Recent Activity */}
      <Card style={{ marginBottom: 30 }}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/history')}>
            <Text style={styles.link}>See all</Text>
          </TouchableOpacity>
        </View>
        {movements.length === 0 ? (
          <Text style={styles.emptyText}>No activity yet</Text>
        ) : (
          movements.slice(0, 5).map((m) => (
            <View key={m.id} style={styles.activityRow}>
              <View
                style={[
                  styles.typeBadge,
                  {
                    backgroundColor:
                      m.type === 'SALE'
                        ? Colors.accent + '25'
                        : m.type === 'IN'
                        ? Colors.primary + '25'
                        : Colors.warning + '25',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.typeText,
                    {
                      color:
                        m.type === 'SALE'
                          ? Colors.accent
                          : m.type === 'IN'
                          ? Colors.primary
                          : Colors.warning,
                    },
                  ]}
                >
                  {m.type}
                </Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.itemName}>{m.item?.name || m.itemName}</Text>
                <Text style={styles.activityMeta}>
                  {m.quantity > 0 ? '+' : ''}
                  {m.quantity} · {m.date?.slice(0, 10)}
                </Text>
              </View>
              {m.type === 'SALE' && (
                <Text style={styles.profitText}>+{formatCurrency(m.profit)}</Text>
              )}
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcome: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { fontSize: 14, color: Colors.textSecondary },
  shopName: { fontSize: 22, fontWeight: '700', color: Colors.text },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionText: { color: Colors.white, fontWeight: '600', fontSize: 13 },
  metricsRow: { flexDirection: 'row', marginBottom: 4 },
  chartCard: { marginTop: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 12 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  link: { color: Colors.primary, fontWeight: '600', fontSize: 13 },
  chart: { borderRadius: 12, marginLeft: -8 },
  emptyText: { textAlign: 'center', color: Colors.textLight, paddingVertical: 20 },
  lowStockCard: { marginBottom: 16 },
  lowStockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lowStockLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  itemName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  itemCat: { fontSize: 12, color: Colors.textLight },
  stockCount: { fontWeight: '700', fontSize: 14 },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  typeText: { fontSize: 11, fontWeight: '700' },
  activityInfo: { flex: 1 },
  activityMeta: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  profitText: { fontWeight: '700', color: Colors.accent, fontSize: 14 },
});