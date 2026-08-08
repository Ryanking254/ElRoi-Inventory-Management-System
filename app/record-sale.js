import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { items } from '../data/mockData';
import { formatCurrency } from '../lib/calculations';

export default function RecordSale() {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [saleAmount, setSaleAmount] = useState('');

  const cost = selectedItem
    ? Number(quantity || 0) * selectedItem.costPrice
    : 0;
  const revenue = Number(saleAmount || 0);
  const profit = revenue - cost;

  const handleSave = () => {
    if (!selectedItem || !quantity || !saleAmount) {
      Alert.alert('Missing fields', 'Select item, quantity and sale amount');
      return;
    }
    Alert.alert(
      'Sale Recorded',
      `Profit: ${formatCurrency(profit)}`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Select Item</Text>
      <View style={styles.itemList}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.itemChip,
              selectedItem?.id === item.id && styles.itemChipActive,
            ]}
            onPress={() => {
              setSelectedItem(item);
              setSaleAmount(
                (item.sellingPrice * (Number(quantity) || 1)).toFixed(2)
              );
            }}
          >
            <Text
              style={[
                styles.itemText,
                selectedItem?.id === item.id && styles.itemTextActive,
              ]}
            >
              {item.name} ({item.currentStock} left)
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Quantity Sold</Text>
      <TextInput
        style={styles.input}
        placeholder="0"
        keyboardType="number-pad"
        value={quantity}
        onChangeText={(v) => {
          setQuantity(v);
          if (selectedItem) {
            setSaleAmount(
              (selectedItem.sellingPrice * (Number(v) || 0)).toFixed(2)
            );
          }
        }}
        placeholderTextColor={Colors.textLight}
      />

      <Text style={styles.label}>Amount Sold For (total)</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        keyboardType="decimal-pad"
        value={saleAmount}
        onChangeText={setSaleAmount}
        placeholderTextColor={Colors.textLight}
      />

      {selectedItem && quantity ? (
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Cost of goods</Text>
            <Text style={styles.summaryValue}>{formatCurrency(cost)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Revenue</Text>
            <Text style={styles.summaryValue}>{formatCurrency(revenue)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.profitRow]}>
            <Text style={styles.profitLabel}>Profit / Loss</Text>
            <Text
              style={[
                styles.profitValue,
                { color: profit >= 0 ? Colors.accent : Colors.danger },
              ]}
            >
              {formatCurrency(profit)}
            </Text>
          </View>
        </View>
      ) : null}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Record Sale</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  itemList: { gap: 8 },
  itemChip: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  itemText: { fontSize: 14, color: Colors.text },
  itemTextActive: { color: Colors.primary, fontWeight: '600' },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
  },
  summary: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: { color: Colors.textSecondary, fontSize: 14 },
  summaryValue: { fontWeight: '600', color: Colors.text },
  profitRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    marginTop: 4,
  },
  profitLabel: { fontWeight: '700', fontSize: 15, color: Colors.text },
  profitValue: { fontWeight: '700', fontSize: 18 },
  saveBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 28,
  },
  saveText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
});
