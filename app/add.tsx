import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/context/AppContext';

const TYPES = ['شقة', 'فيلا', 'أرض', 'محل'] as const;
const PURPOSES = ['بيع', 'إيجار', 'استثمار'] as const;

export default function AddScreen() {
  const { addProperty } = useApp();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<typeof TYPES[number]>('شقة');
  const [purpose, setPurpose] = useState<typeof PURPOSES[number]>('بيع');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!title.trim() || !city.trim() || !price.trim()) {
      Alert.alert('حقول ناقصة', 'العنوان، المدينة، والسعر مطلوبة');
      return;
    }
    addProperty({
      title: title.trim(),
      type,
      purpose,
      city: city.trim(),
      district: district.trim(),
      price: parseFloat(price) || 0,
      area: parseFloat(area) || 0,
      bedrooms: parseInt(bedrooms) || 0,
      bathrooms: parseInt(bathrooms) || 0,
      description: description.trim(),
    });
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>العنوان *</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="مثال: فيلا فاخرة بحي الياسمين" placeholderTextColor="#94A3B8" />

      <Text style={styles.label}>نوع العقار</Text>
      <View style={styles.chips}>
        {TYPES.map(t => (
          <TouchableOpacity key={t} style={[styles.chip, type === t && styles.chipActive]} onPress={() => setType(t)}>
            <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>الغرض</Text>
      <View style={styles.chips}>
        {PURPOSES.map(p => (
          <TouchableOpacity key={p} style={[styles.chip, purpose === p && styles.chipActive]} onPress={() => setPurpose(p)}>
            <Text style={[styles.chipText, purpose === p && styles.chipTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>المدينة *</Text>
      <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="مثال: الرياض" placeholderTextColor="#94A3B8" />

      <Text style={styles.label}>الحي</Text>
      <TextInput style={styles.input} value={district} onChangeText={setDistrict} placeholder="مثال: الياسمين" placeholderTextColor="#94A3B8" />

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>السعر * (ر.س)</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="مثال: 850000" keyboardType="numeric" placeholderTextColor="#94A3B8" />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.label}>المساحة (م²)</Text>
          <TextInput style={styles.input} value={area} onChangeText={setArea} placeholder="مثال: 350" keyboardType="numeric" placeholderTextColor="#94A3B8" />
        </View>
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>غرف النوم</Text>
          <TextInput style={styles.input} value={bedrooms} onChangeText={setBedrooms} placeholder="0" keyboardType="numeric" placeholderTextColor="#94A3B8" />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.label}>دورات المياه</Text>
          <TextInput style={styles.input} value={bathrooms} onChangeText={setBathrooms} placeholder="0" keyboardType="numeric" placeholderTextColor="#94A3B8" />
        </View>
      </View>

      <Text style={styles.label}>الوصف</Text>
      <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="اكتب وصفاً مختصراً للعقار..." placeholderTextColor="#94A3B8" multiline numberOfLines={4} />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Ionicons name="save-outline" size={20} color="#FFF" />
        <Text style={styles.saveText}>حفظ العقار</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 6, marginTop: 14, textAlign: 'right' },
  input: {
    backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0', textAlign: 'right',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#F1F5F9', borderWidth: 2, borderColor: '#F1F5F9',
  },
  chipActive: { backgroundColor: '#0F766E15', borderColor: '#0F766E' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  chipTextActive: { color: '#0F766E' },
  row: { flexDirection: 'row' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0F766E', paddingVertical: 16, borderRadius: 14, marginTop: 28, gap: 8,
  },
  saveText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
