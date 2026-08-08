import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import { movements } from '../../data/mockData';
import { formatCurrency } from '../../lib/calculations';

const FILTERS = ['All', 'SALE', 'IN', 'ADJUST'];

export default function History() {
  const [filter, setFilter] = useState('All');

  const filtered =
    filter === 'All' ? movements : movements.filter((m) => m.type === filter);

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
          <Text style={styles.date}>{item.date}</Text>
        </View>
        <Text style={styles.itemName}>{item.itemName}</Text>
        <View style={styles.details}>
          <Text style={styles.qty}>
            Qty: {item.quantity > 0 ? '+' : ''}
            {item.quantity}
          </Text>
          {isSale && (
            <>
              <Text style={styles.detail}>Rev: {formatCurrency(item.totalRevenue)}</Text>
              <Text style={[styles.detail, { color: Colors.accent }]}>
                Profit: {formatCurrency(item.profit)}
              </Text>
            </>
          )}
          {isIn && (
            <Text style={styles.detail}>Cost: {formatCurrency(item.totalCost)}</Text>
          )}
        </View>
        {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
        <Text style={styles.by}>by {item.performedBy}</Text>
      </Card>
    );
  };

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
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No movements found</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
