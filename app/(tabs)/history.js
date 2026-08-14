import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/Card';
import { formatCurrency } from '../../lib/calculations';
import { movementService } from '../../services/movementService';

const FILTERS = ['All', 'SALE', 'IN', 'ADJUST'];

export default function History() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const currency = user?.currency || 'KES';

  const [movements, setMovements] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMovements = useCallback(async () => {
    try {
      const params = filter === 'All' ? {} : { type: filter };
      const data = await movementService.getAll(params);
      setMovements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log('History error:', err.message);
      setMovements([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    loadMovements();
  }, [loadMovements]);

  const onRefresh = () => {
    setRefreshing(true);
    loadMovements();
  };

  const renderItem = ({ item }) => {
    const isSale = item.type === 'SALE';
    const isIn = item.type === 'IN';
    const dateStr = item.date
      ? new Date(item.date).toLocaleString()
      : '';

    return (
      <Card style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.row}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isSale
                  ? theme.accent + '25'
                  : isIn
                  ? '#3b82f625'
                  : '#f59e0b25',
              },
            ]}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: isSale ? theme.accent : isIn ? '#3b82f6' : '#f59e0b',
              }}
            >
              {item.type}
            </Text>
          </View>
          <Text style={[styles.date, { color: theme.textSecondary }]}>{dateStr}</Text>
        </View>

        <Text style={[styles.itemName, { color: theme.text }]}>
          {item.item?.name || 'Unknown item'}
        </Text>
        <Text style={[styles.qty, { color: theme.textSecondary }]}>
          Qty: {item.quantity}
        </Text>

        {isSale && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ color: theme.text }}>
              Revenue: {formatCurrency(item.totalRevenue, currency)}
            </Text>
            <Text
              style={{
                color: (item.profit || 0) >= 0 ? theme.accent : '#ef4444',
                fontWeight: '600',
              }}
            >
              Profit: {formatCurrency(item.profit, currency)}
            </Text>
          </View>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f ? theme.primary : theme.card,
                borderColor: filter === f ? theme.primary : '#e2e8f0',
              },
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={{
                color: filter === f ? '#fff' : theme.textSecondary,
                fontWeight: '600',
                fontSize: 13,
              }}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={movements}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.textSecondary }]}>
            No activity yet
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filters: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  card: { marginBottom: 12, padding: 14 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  date: { fontSize: 12 },
  itemName: { fontSize: 16, fontWeight: '600' },
  qty: { fontSize: 13, marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 40 },
});