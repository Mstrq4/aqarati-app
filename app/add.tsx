import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  I18nManager,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing } from '../src/constants/theme';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const PROPERTY_TYPES: Array<{ label: string; value: string }> = [
  { label: '🏢 شقة', value: 'شقة' },
  { label: '🏡 فيلا', value: 'فيلا' },
  { label: '🌍 أرض', value: 'أرض' },
  { label: '🏪 محل', value: 'محل' },
];

const PURPOSES: Array<{ label: string; value: string }> = [
  { label: '💰 بيع', value: 'بيع' },
  { label: '📋 إيجار', value: 'إيجار' },
  { label: '📈 استثمار', value: 'استثمار' },
];

export default function AddPropertyScreen() {
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState('شقة');
  const [purpose, setPurpose] = useState('بيع');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('تنبيه ⚠️', 'يرجى إدخال اسم العقار');
      return;
    }
    if (!city.trim()) {
      Alert.alert('تنبيه ⚠️', 'يرجى إدخال المدينة');
      return;
    }
    if (!price.trim()) {
      Alert.alert('تنبيه ⚠️', 'يرجى إدخال السعر');
      return;
    }
    if (!area.trim()) {
      Alert.alert('تنبيه ⚠️', 'يرجى إدخال المساحة');
      return;
    }

    Alert.alert(
      'تم بنجاح ✅',
      'تم حفظ العقار الجديد بنجاح',
      [
        {
          text: 'حسناً',
          onPress: () => router.back(),
        },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Title */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>اسم العقار *</Text>
        <TextInput
          style={styles.input}
          placeholder="مثال: فيلا فاخرة بحي النرجس"
          placeholderTextColor={Colors.textMuted}
          value={title}
          onChangeText={setTitle}
          textAlign="right"
          returnKeyType="next"
        />
      </View>

      {/* Property Type */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>نوع العقار</Text>
        <View style={styles.pickerRow}>
          {PROPERTY_TYPES.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.pickerOption,
                propertyType === item.value && styles.pickerOptionSelected,
              ]}
              onPress={() => setPropertyType(item.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pickerText,
                  propertyType === item.value && styles.pickerTextSelected,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Purpose */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>الغرض</Text>
        <View style={styles.pickerRow}>
          {PURPOSES.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.pickerOption,
                purpose === item.value && styles.pickerOptionSelected,
              ]}
              onPress={() => setPurpose(item.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pickerText,
                  purpose === item.value && styles.pickerTextSelected,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* City */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>المدينة *</Text>
        <TextInput
          style={styles.input}
          placeholder="مثال: الرياض"
          placeholderTextColor={Colors.textMuted}
          value={city}
          onChangeText={setCity}
          textAlign="right"
          returnKeyType="next"
        />
      </View>

      {/* District */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>الحي</Text>
        <TextInput
          style={styles.input}
          placeholder="مثال: حي الياسمين"
          placeholderTextColor={Colors.textMuted}
          value={district}
          onChangeText={setDistrict}
          textAlign="right"
          returnKeyType="next"
        />
      </View>

      {/* Price */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>السعر (ر.س) *</Text>
        <TextInput
          style={styles.input}
          placeholder="مثال: 2500000"
          placeholderTextColor={Colors.textMuted}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          textAlign="right"
          returnKeyType="next"
        />
      </View>

      {/* Area */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>المساحة (م²) *</Text>
        <TextInput
          style={styles.input}
          placeholder="مثال: 450"
          placeholderTextColor={Colors.textMuted}
          value={area}
          onChangeText={setArea}
          keyboardType="numeric"
          textAlign="right"
          returnKeyType="next"
        />
      </View>

      {/* Description */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>الوصف</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="اكتب وصفاً مختصراً للعقار..."
          placeholderTextColor={Colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlign="right"
          textAlignVertical="top"
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={styles.saveButton}
        activeOpacity={0.85}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>💾 حفظ العقار</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 60,
  },
  fieldGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'right',
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'right',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pickerText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  pickerTextSelected: {
    color: Colors.white,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
});
