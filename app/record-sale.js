import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/Card';
import { formatCurrency } from '../lib/calculations';
import { itemService } from '../services/itemService';

export default function RecordSale() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const currency = user?.currency || 'KES';

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [saleAmount, setSaleAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const loadItems = useCallback(async () => {
    try {
      const data = await itemService.getAll();
      setItems(data || []);
    } catch (err) {
      console.log('Load items error:', err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const qty = Number(quantity) || 0;
  const revenue = Number(saleAmount) || 0;
  const cost = selectedItem ? qty * selectedItem.costPrice : 0;
  const profit = revenue - cost;

  const handleSave = async () => {
    if (!selectedItem) {
      Alert.alert('Select item', 'Please choose an item to sell');
      return;
    }
    if (!qty || qty <= 0) {
      Alert.alert('Invalid quantity', 'Enter a positive quantity');
      return;
    }
    if (saleAmount === '' || revenue < 0) {
      Alert.alert('Invalid amount', 'Enter the total amount received');
      return;
    }
    if (qty > selectedItem.currentStock) {
      Alert.alert('Insufficient stock', `Only ${selectedItem.currentStock} available`);
      return;
    }

    setSaving(true);
    try {
      await itemService.recordSale(selectedItem.id, {
        quantity: qty,
        saleAmount: revenue,
        note: note.trim() || undefined,
      });
      Alert.alert('Sale recorded', `${qty} × ${selectedItem.name}`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not record sale');
    } finally {
      setSaving(false);
    }
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
      keyboardShouldPersistTaps="handled"
    >
      {/* Search items */}
      <Text style={[styles.label, { color: theme.text }]}>Select Item</Text>
      <View
        style={[
          styles.searchBox,
          { backgroundColor: theme.card, borderColor: '#e2e8f0' },
        ]}
      >
        <Ionicons name="search" size={18} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search items..."
          placeholderTextColor={theme.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16, maxHeight: 90 }}
        ListEmptyComponent={
          <Text style={{ color: theme.textSecondary, padding: 12 }}>No items found</Text>
        }
        renderItem={({ item }) => {
          const isSelected = selectedItem?.id === item.id;
          const isLow = item.currentStock <= (item.lowStockThreshold || 5);
          return (
            <TouchableOpacity
              style={[
                styles.itemChip,
                {
                  backgroundColor: isSelected ? theme.primary : theme.card,
                  borderColor: isSelected ? theme.primary : '#e2e8f0',
                },
              ]}
              onPress={() => setSelectedItem(item)}
            >
              <Text
                style={[
                  styles.itemChipName,
                  { color: isSelected ? '#fff' : theme.text },
                ]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text
                style={[
                  styles.itemChipStock,
                  { color: isSelected ? '#bbf7d0' : isLow ? '#f59e0b' : theme.textSecondary },
                ]}
              >
                {item.currentStock} in stock
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {selectedItem && (
        <Card style={[styles.selectedCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.selectedName, { color: theme.text }]}>
            {selectedItem.name}
          </Text>
          <Text style={{ color: theme.textSecondary }}>
            Cost: {formatCurrency(selectedItem.costPrice, currency)} each · Stock:{' '}
            {selectedItem.currentStock}
          </Text>
        </Card>
      )}

      {/* Quantity */}
      <Text style={[styles.label, { color: theme.text }]}>Quantity sold</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.card, color: theme.text, borderColor: '#e2e8f0' },
        ]}
        placeholder="0"
        placeholderTextColor={theme.textSecondary}
        keyboardType="number-pad"
        value={quantity}
        onChangeText={setQuantity}
      />

      {/* Sale amount */}
      <Text style={[styles.label, { color: theme.text }]}>
        Total amount received ({currency})
      </Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.card, color: theme.text, borderColor: '#e2e8f0' },
        ]}
        placeholder="0.00"
        placeholderTextColor={theme.textSecondary}
        keyboardType="decimal-pad"
        value={saleAmount}
        onChangeText={setSaleAmount}
      />

      {/* Note */}
      <Text style={[styles.label, { color: theme.text }]}>Note (optional)</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.card, color: theme.text, borderColor: '#e2e8f0' },
        ]}
        placeholder="e.g. Cash sale"
        placeholderTextColor={theme.textSecondary}
        value={note}
        onChangeText={setNote}
      />

      {/* Profit summary */}
      {selectedItem && qty > 0 && (
        <Card style={[styles.summaryBox, { backgroundColor: theme.card }]}>
          <View style={styles.summaryRow}>
            <Text style={{ color: theme.textSecondary }}>Cost</Text>
            <Text style={{ color: theme.text, fontWeight: '600' }}>
              {formatCurrency(cost, currency)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={{ color: theme.textSecondary }}>Revenue</Text>
            <Text style={{ color: theme.text, fontWeight: '600' }}>
              {formatCurrency(revenue, currency)}
            </Text>
          </View>
          <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 10, marginTop: 4 }]}>
            <Text style={{ color: theme.text, fontWeight: '700' }}>Profit</Text>
            <Text
              style={{
                fontWeight: '700',
                color: profit >= 0 ? theme.accent : '#ef4444',
              }}
            >
              {formatCurrency(profit, currency)}
            </Text>
          </View>
        </Card>
      )}

      <TouchableOpacity
        style={[
          styles.saveBtn,
          { backgroundColor: theme.primary, opacity: saving ? 0.7 : 1 },
        ]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Record Sale</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 15 },
  itemChip: {
    width: 120,
    marginRight: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemChipName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  itemChipStock: { fontSize: 12 },
  selectedCard: { padding: 14, marginBottom: 8 },
  selectedName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  summaryBox: { marginTop: 20, padding: 16 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  saveBtn: {
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});