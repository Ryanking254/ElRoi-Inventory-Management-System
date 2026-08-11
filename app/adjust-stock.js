import React, { useState, useEffect } from 'react';
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
import { itemService } from '../services/itemService';

export default function AdjustStock() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [type, setType] = useState('IN'); // IN | OUT
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await itemService.getAll();
        setItems(data || []);
      } catch (err) {
        console.log(err.message);
      } finally {
        setLoadingItems(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!selectedItem || !quantity) {
      Alert.alert('Missing fields', 'Select item and quantity');
      return;
    }

    setSaving(true);
    try {
      await itemService.adjustStock(selectedItem.id, {
        type,
        quantity: Number(quantity),
        note: note.trim() || undefined,
      });
      Alert.alert(
        'Stock Adjusted',
        `${type === 'IN' ? '+' : '-'}${quantity} ${selectedItem.name}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not adjust stock');
    } finally {
      setSaving(false);
    }
  };

  if (loadingItems) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Select Item</Text>
      {items.length === 0 ? (
        <Text style={styles.empty}>No items in inventory yet</Text>
      ) : (
        <View style={styles.itemList}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.itemChip,
                selectedItem?.id === item.id && styles.itemChipActive,
              ]}
              onPress={() => setSelectedItem(item)}
            >
              <Text
                style={[
                  styles.itemText,
                  selectedItem?.id === item.id && styles.itemTextActive,
                ]}
              >
                {item.name} · Current: {item.currentStock}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.label}>Type</Text>
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeBtn, type === 'IN' && styles.typeBtnActive]}
          onPress={() => setType('IN')}
        >
          <Text style={[styles.typeText, type === 'IN' && styles.typeTextActive]}>
            + Add Stock
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, type === 'OUT' && styles.typeBtnOut]}
          onPress={() => setType('OUT')}
        >
          <Text style={[styles.typeText, type === 'OUT' && styles.typeTextActive]}>
            − Remove Stock
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Quantity</Text>
      <TextInput
        style={styles.input}
        placeholder="0"
        keyboardType="number-pad"
        value={quantity}
        onChangeText={setQuantity}
        placeholderTextColor={Colors.textLight}
      />

      <Text style={styles.label}>Note (optional)</Text>
      <TextInput
        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
        placeholder="Reason for adjustment..."
        multiline
        value={note}
        onChangeText={setNote}
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
          <Text style={styles.saveText}>Save Adjustment</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  empty: { color: Colors.textLight, fontStyle: 'italic' },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeBtnOut: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  typeText: { fontWeight: '600', color: Colors.textSecondary },
  typeTextActive: { color: Colors.white },
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
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 28,
  },
  saveText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
});