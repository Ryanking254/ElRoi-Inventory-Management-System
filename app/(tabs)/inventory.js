import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCategories } from '../../context/CategoryContext';
import Card from '../../components/Card';
import { formatCurrency } from '../../lib/calculations';
import { itemService } from '../../services/itemService';

export default function Inventory() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { categories } = useCategories();
  const currency = user?.currency || 'KES';

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      const data = await itemService.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log('Inventory error:', err.message);
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const onRefresh = () => {
    setRefreshing(true);
    loadItems();
  };

  const filtered = items.filter((item) => {
    const matchesSearch = (item.name || '').toLowerCase().includes(search.toLowerCase());
    const catName = item.category?.name || item.categoryName || '';
    const matchesCat = selectedCategory === 'All' || catName === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const renderItem = ({ item }) => {
    const isLow = item.currentStock <= (item.lowStockThreshold || 5);
    const catName = item.category?.name || item.categoryName || 'Uncategorized';

    return (
      <Card style={[styles.itemCard, { backgroundColor: theme.card }]}>
        <View style={styles.itemHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.itemCat, { color: theme.textSecondary }]}>{catName}</Text>
          </View>
          <View
            style={[
              styles.stockBadge,
              { backgroundColor: isLow ? '#f59e0b25' : theme.accent + '25' },
            ]}
          >
            <Text style={[styles.stockText, { color: isLow ? '#f59e0b' : theme.accent }]}>
              {item.currentStock} in stock
            </Text>
          </View>
        </View>

        <View style={[styles.priceRow, { borderTopColor: '#e2e8f0' }]}>
          <View>
            <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Cost</Text>
            <Text style={[styles.priceValue, { color: theme.text }]}>
              {formatCurrency(item.costPrice, currency)}
            </Text>
          </View>
          <View>
            <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Sell</Text>
            <Text style={[styles.priceValue, { color: theme.text }]}>
              {item.sellingPrice ? formatCurrency(item.sellingPrice, currency) : '—'}
            </Text>
          </View>
          <View>
            <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Margin</Text>
            <Text style={[styles.priceValue, { color: theme.accent }]}>
              {item.sellingPrice
                ? (((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100).toFixed(0) + '%'
                : '—'}
            </Text>
          </View>
        </View>
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
        horizontal
        data={['All', ...(categories || []).map((c) => c.name)]}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        style={styles.catList}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.catChip,
              {
                backgroundColor: selectedCategory === item ? theme.primary : theme.card,
                borderColor: selectedCategory === item ? theme.primary : '#e2e8f0',
              },
            ]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text
              style={[
                styles.catText,
                { color: selectedCategory === item ? '#fff' : theme.textSecondary },
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={[styles.count, { color: theme.textSecondary }]}>
              {filtered.length} items
            </Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: theme.primary }]}
                onPress={() => router.push('/add-category')}
              >
                <Ionicons name="folder-outline" size={16} color={theme.primary} />
                <Text style={[styles.secondaryBtnText, { color: theme.primary }]}>Category</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: theme.primary }]}
                onPress={() => router.push('/add-item')}
              >
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.addBtnText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.textSecondary }]}>
            No items yet. Add your first product.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15 },
  catList: { maxHeight: 44, marginBottom: 8 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  catText: { fontSize: 13, fontWeight: '500' },
  list: { padding: 16, paddingTop: 0 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  count: { fontSize: 14 },
  headerButtons: { flexDirection: 'row', gap: 8 },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  secondaryBtnText: { fontWeight: '600', fontSize: 13 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  itemCard: { marginBottom: 12 },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemCat: { fontSize: 12, marginTop: 2 },
  stockBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  stockText: { fontSize: 12, fontWeight: '700' },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  priceLabel: { fontSize: 11 },
  priceValue: { fontSize: 15, fontWeight: '600', marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 40 },
});