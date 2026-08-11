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
import { Colors } from '../constants/colors';
import { useCategories } from '../context/CategoryContext';
import { itemService } from '../services/itemService';

export default function AddItem() {
  const router = useRouter();
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
      Alert.alert('Error', err.message || 'Could not add item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Item Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Rice 5kg"
        value={name}
        onChangeText={setName}
        placeholderTextColor={Colors.textLight}
      />

      <Text style={styles.label}>Category</Text>
      {categories.length === 0 ? (
        <Text style={styles.empty}>No categories yet. Please add one first.</Text>
      ) : (
        <View style={styles.catRow}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.catChip, categoryId === c.id && styles.catChipActive]}
              onPress={() => setCategoryId(c.id)}
            >
              <Text style={[styles.catText, categoryId === c.id && styles.catTextActive]}>
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.label}>Cost Price (buy)</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        keyboardType="decimal-pad"
        value={costPrice}
        onChangeText={setCostPrice}
        placeholderTextColor={Colors.textLight}
      />

      <Text style={styles.label}>Selling Price (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        keyboardType="decimal-pad"
        value={sellingPrice}
        onChangeText={setSellingPrice}
        placeholderTextColor={Colors.textLight}
      />

      <Text style={styles.label}>Initial Stock</Text>
      <TextInput
        style={styles.input}
        placeholder="0"
        keyboardType="number-pad"
        value={initialStock}
        onChangeText={setInitialStock}
        placeholderTextColor={Colors.textLight}
      />

      <TouchableOpacity
        style={[styles.saveBtn, saving && { opacity: 0.7 }]}
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
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
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
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  catText: { fontSize: 13, color: Colors.textSecondary },
  catTextActive: { color: Colors.white },
  empty: {
    color: Colors.textLight,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  saveText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
});