import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useCategories } from '../context/CategoryContext';
import { itemService } from '../services/itemService';
import { useAuth } from '../context/AuthContext';
import { PLANS } from '../constants/plans';

export default function AddItem() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { categories } = useCategories();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [initialStock, setInitialStock] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !costPrice) {
      Alert.alert('Missing fields', 'Please fill name and cost price');
      return;
    }
    if (!categoryId) {
      Alert.alert('Missing category', 'Please select a category');
      return;
    }

    setSaving(true);
    try {
      await itemService.create({
        name: name.trim(),
        categoryId,
        costPrice: Number(costPrice),
        sellingPrice: sellingPrice ? Number(sellingPrice) : null,
        currentStock: initialStock ? Number(initialStock) : 0,
      });
      Alert.alert('Success', `${name} added to inventory`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      if (err.code === 'PLAN_LIMIT' || err.upgradeRequired) {
        Alert.alert('Upgrade required', err.message || 'Free plan allows up to 30 items. Upgrade to add more.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/paywall') },
        ]);
      } else {
        Alert.alert('Error', err.message || 'Could not add item');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ padding: 20 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.label, { color: theme.text }]}>Item Name</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: '#e2e8f0' }]}
        placeholder="e.g. Rice 5kg"
        placeholderTextColor={theme.textSecondary}
        value={name}
        onChangeText={setName}
      />

      <Text style={[styles.label, { color: theme.text }]}>Category</Text>
      {(categories || []).length === 0 ? (
        <Text style={{ color: theme.textSecondary, fontStyle: 'italic' }}>
          No categories yet. Please add one first.
        </Text>
      ) : (
        <View style={styles.catRow}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.catChip,
                {
                  backgroundColor: categoryId === c.id ? theme.primary : theme.card,
                  borderColor: categoryId === c.id ? theme.primary : '#e2e8f0',
                },
              ]}
              onPress={() => setCategoryId(c.id)}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: categoryId === c.id ? '#fff' : theme.textSecondary,
                }}
              >
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={[styles.label, { color: theme.text }]}>Cost Price (buy)</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: '#e2e8f0' }]}
        placeholder="0.00"
        placeholderTextColor={theme.textSecondary}
        keyboardType="decimal-pad"
        value={costPrice}
        onChangeText={setCostPrice}
      />

      <Text style={[styles.label, { color: theme.text }]}>Selling Price (optional)</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: '#e2e8f0' }]}
        placeholder="0.00"
        placeholderTextColor={theme.textSecondary}
        keyboardType="decimal-pad"
        value={sellingPrice}
        onChangeText={setSellingPrice}
      />

      <Text style={[styles.label, { color: theme.text }]}>Initial Stock</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: '#e2e8f0' }]}
        placeholder="0"
        placeholderTextColor={theme.textSecondary}
        keyboardType="number-pad"
        value={initialStock}
        onChangeText={setInitialStock}
      />

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: theme.primary, opacity: saving ? 0.7 : 1 }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Add to Inventory</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});