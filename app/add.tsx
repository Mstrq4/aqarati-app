import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../src/context/AppContext';
import { Colors, BottomSheet, SectionCard } from '../src/components/UI';
import type { PropertyType, PropertyStatus, PropertyCategory } from '../src/types';

const PROPERTY_TYPES: PropertyType[] = ['شقة', 'فيلا', 'أرض', 'مكتب', 'محل', 'مستودع', 'عمارة'];
const PROPERTY_STATUSES: PropertyStatus[] = ['للبيع', 'للإيجار', 'بيع أو إيجار'];
const PROPERTY_CATEGORIES: PropertyCategory[] = ['سكني', 'تجاري', 'صناعي', 'زراعي'];

const FEATURES = [
  'مسبح', 'حديقة', 'مجلس', 'مصعد', 'تكييف مركزي', 'مطبخ مجهز',
  'مدخل سيارة', 'غرفة خادمة', 'غرفة سائق', 'ملحق خارجي', 'سطح',
  'موقف خاص', 'أمن 24 ساعة', 'صالة رياضية', 'قبو', 'اطلالة',
  'زاوية', 'واجهة بحرية', 'تشطيب فاخر', 'جاهز للسكن',
];

interface SelectedImage {
  uri: string;
  local?: string;
}

export default function AddPropertyScreen() {
  const { addProperty, saveImage } = useApp();
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('شقة');
  const [status, setStatus] = useState<PropertyStatus>('للبيع');
  const [category, setCategory] = useState<PropertyCategory>('سكني');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [floor, setFloor] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [street, setStreet] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [imageSheetVisible, setImageSheetVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  const requestImagePermissions = async () => {
    const camera = await ImagePicker.requestCameraPermissionsAsync();
    const library = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (camera.status !== 'granted' || library.status !== 'granted') {
      Alert.alert('صلاحيات مرفوضة', 'يرجى منح صلاحيات الوصول للكاميرا والصور من إعدادات الجهاز');
      return false;
    }
    return true;
  };

  const pickImageFromCamera = async () => {
    setImageSheetVisible(false);
    const granted = await requestImagePermissions();
    if (!granted) return;
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });
      if (!result.canceled && result.assets?.length > 0) {
        addImages(result.assets.map((a) => ({ uri: a.uri })));
      }
    } catch (e) {
      Alert.alert('خطأ', 'فشل التقاط الصورة');
    }
  };

  const pickImagesFromGallery = async () => {
    setImageSheetVisible(false);
    const granted = await requestImagePermissions();
    if (!granted) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 10 - selectedImages.length,
        aspect: [4, 3],
      });
      if (!result.canceled && result.assets?.length > 0) {
        addImages(result.assets.map((a) => ({ uri: a.uri })));
      }
    } catch (e) {
      Alert.alert('خطأ', 'فشل اختيار الصور');
    }
  };

  const addImages = (images: SelectedImage[]) => {
    const remaining = 10 - selectedImages.length;
    const toAdd = images.slice(0, remaining);
    setSelectedImages((prev) => [...prev, ...toAdd]);
    if (images.length > remaining) {
      Alert.alert('تنبيه', `الحد الأقصى 10 صور، تمت إضافة ${remaining} صور`);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const formatPrice = (val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    if (!num) return '';
    return parseInt(num).toLocaleString('en-US');
  };

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('حقل مطلوب', 'يرجى إدخال عنوان العقار'); return; }
    const priceNum = parseFloat(price.replace(/[^0-9]/g, ''));
    if (isNaN(priceNum) || priceNum <= 0) { Alert.alert('حقل مطلوب', 'يرجى إدخال سعر صحيح'); return; }

    setSaving(true);
    try {
      const propId = 'prop_' + Date.now();
      const savedImagePaths: string[] = [];
      for (const img of selectedImages) {
        try {
          const localPath = await saveImage(img.uri, propId);
          savedImagePaths.push(localPath);
        } catch (e) { /* skip failed */ }
      }

      await addProperty({
        title: title.trim(),
        description: description.trim(),
        type: propertyType,
        status,
        category,
        price: priceNum,
        area: parseFloat(area) || 0,
        bedrooms: parseInt(bedrooms) || 0,
        bathrooms: parseInt(bathrooms) || 0,
        floor: parseInt(floor) || 0,
        age: parseInt(age) || 0,
        location: { city: city.trim(), district: district.trim(), street: street.trim(), coordinates: { lat: 0, lng: 0 } },
        features: selectedFeatures,
        images: savedImagePaths,
        owner: { name: ownerName.trim() || 'أنا', phone: ownerPhone.trim(), type: 'مالك' },
      });
      router.back();
    } catch (e) {
      Alert.alert('خطأ', 'فشل حفظ العقار');
    } finally {
      setSaving(false);
    }
  };

  // ============ مكونات مساعدة ============
  const FieldLabel = ({ text }: { text: string }) => (
    <Text style={addStyles.fieldLabel}>{text}</Text>
  );

  const PillRow = ({ items, selected, onSelect, colorKey }: { items: string[]; selected: string; onSelect: (v: any) => void; colorKey?: string }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {items.map((item) => {
        const active = selected === item;
        return (
          <TouchableOpacity
            key={item}
            onPress={() => onSelect(item)}
            style={[addStyles.pill, active && { backgroundColor: (colorKey ? Colors.primary : Colors.primary) + '15', borderColor: Colors.primary }]}
          >
            <Text style={[addStyles.pillText, active && { color: Colors.primary }]}>{item}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const InputRow = ({ label, value, onChange, placeholder, keyboardType, icon }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; keyboardType?: any; icon?: string }) => (
    <View style={addStyles.inputHalf}>
      <FieldLabel text={label} />
      <View style={addStyles.inputBox}>
        {icon && <Ionicons name={icon as any} size={18} color={Colors.textSecondary} style={{ marginRight: 8 }} />}
        <TextInput
          style={addStyles.textInput}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          keyboardType={keyboardType}
          textAlign="right"
        />
      </View>
    </View>
  );

  return (
    <View style={addStyles.container}>
      {/* الهيدر */}
      <View style={addStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={addStyles.headerClose}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={addStyles.headerTitle}>إضافة عقار جديد</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={addStyles.scroll}
        contentContainerStyle={addStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ===== القسم ١: الصور ===== */}
        <View style={addStyles.sectionHeader}>
          <Ionicons name="camera-outline" size={22} color={Colors.primary} />
          <Text style={addStyles.sectionTitle}>الصور</Text>
          <Text style={addStyles.sectionCount}>{selectedImages.length}/10</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
          {selectedImages.map((img, index) => (
            <View key={index} style={addStyles.imageThumb}>
              <Image source={{ uri: img.uri }} style={addStyles.thumbImage} />
              <TouchableOpacity style={addStyles.removeImageBtn} onPress={() => removeImage(index)}>
                <Ionicons name="close-circle" size={22} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          {selectedImages.length < 10 && (
            <TouchableOpacity style={addStyles.addImageBtn} onPress={() => setImageSheetVisible(true)}>
              <Ionicons name="camera-outline" size={32} color={Colors.primary} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.primary, marginTop: 4 }}>إضافة صور</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* ===== القسم ٢: معلومات أساسية ===== */}
        <View style={addStyles.sectionHeader}>
          <Ionicons name="information-circle-outline" size={22} color={Colors.primary} />
          <Text style={addStyles.sectionTitle}>معلومات أساسية</Text>
        </View>
        <FieldLabel text="العنوان *" />
        <View style={[addStyles.inputBox, addStyles.inputFull]}>
          <Ionicons name="home-outline" size={20} color={Colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput style={addStyles.textInput} value={title} onChangeText={setTitle} placeholder="مثال: فيلا فاخرة بحي الياسمين" placeholderTextColor={Colors.textTertiary} textAlign="right" />
        </View>

        <FieldLabel text="الوصف" />
        <View style={[addStyles.inputBox, addStyles.inputFull, { minHeight: 100, alignItems: 'flex-start' }]}>
          <TextInput style={[addStyles.textInput, { minHeight: 80, textAlignVertical: 'top' }]} value={description} onChangeText={setDescription} placeholder="اكتب وصفاً تفصيلياً للعقار..." placeholderTextColor={Colors.textTertiary} multiline numberOfLines={4} textAlign="right" />
        </View>

        <FieldLabel text="نوع العقار" />
        <PillRow items={PROPERTY_TYPES} selected={propertyType} onSelect={setPropertyType} />

        <FieldLabel text="الحالة" />
        <PillRow items={PROPERTY_STATUSES} selected={status} onSelect={setStatus} />

        <FieldLabel text="التصنيف" />
        <PillRow items={PROPERTY_CATEGORIES} selected={category} onSelect={setCategory} />

        {/* ===== القسم ٣: التفاصيل ===== */}
        <View style={addStyles.sectionHeader}>
          <Ionicons name="stats-chart-outline" size={22} color={Colors.primary} />
          <Text style={addStyles.sectionTitle}>التفاصيل</Text>
        </View>

        <View style={addStyles.rowGrid}>
          <InputRow label="السعر * (ر.س)" value={formatPrice(price)} onChangeText={(t) => setPrice(t.replace(/[^0-9]/g, ''))} placeholder="850,000" keyboardType="number-pad" icon="cash-outline" />
          <InputRow label="المساحة (م²)" value={area} onChangeText={setArea} placeholder="350" keyboardType="number-pad" icon="resize-outline" />
        </View>
        <View style={addStyles.rowGrid}>
          <InputRow label="غرف النوم" value={bedrooms} onChangeText={setBedrooms} placeholder="0" keyboardType="number-pad" icon="bed-outline" />
          <InputRow label="دورات المياه" value={bathrooms} onChangeText={setBathrooms} placeholder="0" keyboardType="number-pad" icon="water-outline" />
        </View>
        <View style={addStyles.rowGrid}>
          <InputRow label="الطابق" value={floor} onChangeText={setFloor} placeholder="0" keyboardType="number-pad" icon="layers-outline" />
          <InputRow label="العمر (سنة)" value={age} onChangeText={setAge} placeholder="0" keyboardType="number-pad" icon="time-outline" />
        </View>

        {/* ===== القسم ٤: الموقع ===== */}
        <View style={addStyles.sectionHeader}>
          <Ionicons name="location-outline" size={22} color={Colors.primary} />
          <Text style={addStyles.sectionTitle}>الموقع</Text>
        </View>
        <FieldLabel text="المدينة" />
        <View style={[addStyles.inputBox, addStyles.inputFull]}>
          <Ionicons name="location-outline" size={20} color={Colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput style={addStyles.textInput} value={city} onChangeText={setCity} placeholder="مثال: الرياض" placeholderTextColor={Colors.textTertiary} textAlign="right" />
        </View>
        <FieldLabel text="الحي" />
        <View style={[addStyles.inputBox, addStyles.inputFull]}>
          <TextInput style={addStyles.textInput} value={district} onChangeText={setDistrict} placeholder="مثال: الياسمين" placeholderTextColor={Colors.textTertiary} textAlign="right" />
        </View>
        <FieldLabel text="الشارع" />
        <View style={[addStyles.inputBox, addStyles.inputFull]}>
          <TextInput style={addStyles.textInput} value={street} onChangeText={setStreet} placeholder="مثال: شارع الأمير تركي" placeholderTextColor={Colors.textTertiary} textAlign="right" />
        </View>

        {/* ===== القسم ٥: المميزات ===== */}
        <View style={addStyles.sectionHeader}>
          <Ionicons name="star-outline" size={22} color={Colors.primary} />
          <Text style={addStyles.sectionTitle}>المميزات</Text>
          <Text style={addStyles.sectionCount}>{selectedFeatures.length}</Text>
        </View>
        <View style={addStyles.featuresGrid}>
          {FEATURES.map((feature) => {
            const isSelected = selectedFeatures.includes(feature);
            return (
              <TouchableOpacity
                key={feature}
                onPress={() => toggleFeature(feature)}
                style={[addStyles.featureChip, isSelected && addStyles.featureChipActive]}
              >
                {isSelected && <Ionicons name="checkmark" size={14} color="#FFF" style={{ marginRight: 4 }} />}
                <Text style={[addStyles.featureChipText, isSelected && addStyles.featureChipTextActive]}>{feature}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ===== القسم ٦: المالك ===== */}
        <View style={addStyles.sectionHeader}>
          <Ionicons name="person-outline" size={22} color={Colors.primary} />
          <Text style={addStyles.sectionTitle}>معلومات المالك</Text>
        </View>
        <View style={addStyles.rowGrid}>
          <InputRow label="الاسم" value={ownerName} onChangeText={setOwnerName} placeholder="اسم المالك" icon="person-outline" />
          <InputRow label="رقم الجوال" value={ownerPhone} onChangeText={setOwnerPhone} placeholder="05xxxxxxxx" keyboardType="phone-pad" icon="call-outline" />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ===== الشريط السفلي للحفظ ===== */}
      <View style={addStyles.bottomBar}>
        <TouchableOpacity
          style={[addStyles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <Text style={addStyles.saveBtnText}>جاري النشر...</Text>
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={20} color="#FFF" />
              <Text style={addStyles.saveBtnText}>نشر العقار</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ===== بوتوم شيت اختيار الصور ===== */}
      <BottomSheet visible={imageSheetVisible} onClose={() => setImageSheetVisible(false)} title="إضافة صورة" height={260}>
        <TouchableOpacity style={addStyles.sheetOption} onPress={pickImageFromCamera}>
          <View style={[addStyles.sheetIconBox, { backgroundColor: Colors.primary + '15' }]}>
            <Ionicons name="camera" size={24} color={Colors.primary} />
          </View>
          <Text style={addStyles.sheetOptionText}>التقاط صورة</Text>
        </TouchableOpacity>
        <TouchableOpacity style={addStyles.sheetOption} onPress={pickImagesFromGallery}>
          <View style={[addStyles.sheetIconBox, { backgroundColor: Colors.secondary + '15' }]}>
            <Ionicons name="images" size={24} color={Colors.secondary} />
          </View>
          <Text style={addStyles.sheetOptionText}>اختيار من المعرض</Text>
        </TouchableOpacity>
        <TouchableOpacity style={addStyles.sheetCancel} onPress={() => setImageSheetVisible(false)}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textSecondary }}>إلغاء</Text>
        </TouchableOpacity>
      </BottomSheet>
    </View>
  );
}

const addStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  // ============ الهيدر ============
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  // ============ المحتوى ============
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 120 },
  // ============ رؤوس الأقسام ============
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.text, flex: 1 },
  sectionCount: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  // ============ الحقول ============
  fieldLabel: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 6, marginTop: 12, textAlign: 'right' },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, minHeight: 50 },
  inputFull: { width: '100%' },
  textInput: { flex: 1, fontSize: 15, color: Colors.text, paddingVertical: 12 },
  // ============ صف شبكي (عمودين) ============
  rowGrid: { flexDirection: 'row', gap: 12 },
  inputHalf: { flex: 1 },
  // ============ الحبوب ============
  pill: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12, backgroundColor: '#F1F5F9', borderWidth: 2, borderColor: '#F1F5F9' },
  pillText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  // ============ الصور ============
  imageThumb: { width: 110, height: 110, borderRadius: 14, overflow: 'hidden', position: 'relative' },
  thumbImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImageBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: '#FFF', borderRadius: 11, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  addImageBtn: { width: 110, height: 110, borderRadius: 14, borderWidth: 2, borderColor: Colors.primary + '40', borderStyle: 'dashed', backgroundColor: Colors.primary + '06', alignItems: 'center', justifyContent: 'center' },
  // ============ المميزات ============
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  featureChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: Colors.border },
  featureChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  featureChipText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  featureChipTextActive: { color: '#FFF', fontWeight: '600' },
  // ============ الشريط السفلي ============
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 16, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 8 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 14, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  saveBtnText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  // ============ بوتوم شيت ============
  sheetOption: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 4 },
  sheetIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sheetOptionText: { fontSize: 16, fontWeight: '600', color: Colors.text },
  sheetCancel: { marginTop: 8, paddingVertical: 14, alignItems: 'center', backgroundColor: Colors.background, borderRadius: 14 },
});
