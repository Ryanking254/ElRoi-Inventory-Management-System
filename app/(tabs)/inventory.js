import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import { items as mockItems, categories } from '../../data/mockData';
import { formatCurrency } from '../../lib/calculations';

export default function Inventory() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = mockItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      selectedCategory === 'All' || item.categoryName === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const renderItem = ({ item }) => {
    const isLow = item.currentStock <= item.lowStockThreshold;
    return (
      <Card style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemCat}>{item.categoryName}</Text>
          </View>
          <View
            style={[
              styles.stockBadge,
              {
                backgroundColor: isLow ? Colors.warning + '25' : Colors.accent + '25',
              },
            ]}
          >
            <Text
              style={[
                styles.stockText,
                { color: isLow ? Colors.warning : Colors.accent },
              ]}
            >
              {item.currentStock} in stock
            </Text>
          </View>
        </View>
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>Cost</Text>
            <Text style={styles.priceValue}>{formatCurrency(item.costPrice)}</Text>
          </View>
          <View>
            <Text style={styles.priceLabel}>Sell</Text>
            <Text style={styles.priceValue}>{formatCurrency(item.sellingPrice)}</Text>
          </View>
          <View>
            <Text style={styles.priceLabel}>Margin</Text>
            <Text style={[styles.priceValue, { color: Colors.accent }]}>
              {(((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100).toFixed(0)}%
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          placeholderTextColor={Colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Categories */}
      <FlatList
        horizontal
        data={['All', ...categories.map((c) => c.name)]}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        style={styles.catList}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.catChip,
              selectedCategory === item && styles.catChipActive,
            ]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text
              style={[
                styles.catText,
                selectedCategory === item && styles.catTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Items */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.count}>{filtered.length} items</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => router.push('/add-item')}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addBtnText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text },
  catList: { maxHeight: 44, marginBottom: 8 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  catTextActive: { color: Colors.white },
  list: { padding: 16, paddingTop: 0 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  count: { fontSize: 14, color: Colors.textSecondary },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: { color: Colors.white, fontWeight: '600', fontSize: 13 },
  itemCard: { marginBottom: 12 },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemName: { fontSize: 16, fontWeight: '600', color: Colors.text },
  itemCat: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  stockBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  stockText: { fontSize: 12, fontWeight: '700' },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  priceLabel: { fontSize: 11, color: Colors.textLight },
  priceValue: { fontSize: 15, fontWeight: '600', color: Colors.text, marginTop: 2 },
});
