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
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import { formatCurrency } from '../../lib/calculations';
import { movementService } from '../../services/movementService';
import { useAuth } from '../../context/AuthContext';

const FILTERS = ['All', 'SALE', 'IN', 'ADJUST'];

export default function History() {
  const [filter, setFilter] = useState('All');
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const currency = user?.currency || 'KES';

  const loadMovements = useCallback(async () => {
    try {
      const params = filter === 'All' ? {} : { type: filter };
      const data = await movementService.getAll(params);
      setMovements(data || []);
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

    return (
      <Card style={styles.row}>
        <View style={styles.top}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isSale
                  ? Colors.accent + '25'
                  : isIn
                  ? Colors.primary + '25'
                  : Colors.warning + '25',
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: isSale
                    ? Colors.accent
                    : isIn
                    ? Colors.primary
                    : Colors.warning,
                },
              ]}
            >
              {item.type}
            </Text>
          </View>
          <Text style={styles.date}>{item.date?.slice(0, 10)}</Text>
        </View>

        <Text style={styles.itemName}>{item.item?.name || item.itemName || 'Unknown item'}</Text>

        <View style={styles.details}>
          <Text style={styles.qty}>
            Qty: {item.quantity > 0 ? '+' : ''}
            {item.quantity}
          </Text>
          {isSale && (
            <View style={{ marginTop: 6 }}>
              <Text style={styles.money}>
              Revenue: {formatCurrency(item.totalRevenue, currency)}
              </Text>
              <Text style={[styles.money, { color: (item.profit || 0) >= 0 ? '#22c55e' : '#ef4444' }]}>
                Profit: {formatCurrency(item.profit, currency)}
              </Text>
            </View>
          )}
          {isIn && (
            <Text style={styles.detail}>Cost: {formatCurrency(item.totalCost)}</Text>
          )}
        </View>

        {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
        <Text style={styles.by}>by {item.performedBy?.name || item.performedBy || 'Owner'}</Text>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={movements}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={styles.empty}>No movements found</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filters: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: Colors.white },
  list: { padding: 16, paddingTop: 8 },
  row: { marginBottom: 12 },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  date: { fontSize: 12, color: Colors.textLight },
  itemName: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  details: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  qty: { fontSize: 13, color: Colors.textSecondary },
  detail: { fontSize: 13, color: Colors.textSecondary },
  note: { fontSize: 12, color: Colors.textLight, marginTop: 6, fontStyle: 'italic' },
  by: { fontSize: 11, color: Colors.textLight, marginTop: 6 },
  empty: { textAlign: 'center', color: Colors.textLight, marginTop: 40 },
});