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
import { BottomSheet } from '../src/components/UI';
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
  const { addProperty, saveImage, t, colors } = useApp();
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
      Alert.alert(t('error') || 'خطأ', 'فشل التقاط الصورة');
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
      Alert.alert(t('error') || 'خطأ', 'فشل اختيار الصور');
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
    if (!title.trim()) { Alert.alert(t('required'), t('titleRequired')); return; }
    const priceNum = parseFloat(price.replace(/[^0-9]/g, ''));
    if (isNaN(priceNum) || priceNum <= 0) { Alert.alert(t('required'), t('priceRequired')); return; }

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
      Alert.alert(t('error') || 'خطأ', t('tryAgain'));
    } finally {
      setSaving(false);
    }
  };

  const FieldLabel = ({ text }: { text: string }) => (
    <Text style={[addStyles.fieldLabel, { color: colors.text }]}>{text}</Text>
  );

  const PillRow = ({ items, selected, onSelect }: { items: string[]; selected: string; onSelect: (v: any) => void }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {items.map((item) => {
        const active = selected === item;
        return (
          <TouchableOpacity
            key={item}
            onPress={() => onSelect(item)}
            style={[addStyles.pill, active && { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
          >
            <Text style={[addStyles.pillText, { color: colors.textSecondary }, active && { color: colors.primary }]}>{item}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const InputRow = ({ label, value, onChange, placeholder, keyboardType, icon }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; keyboardType?: any; icon?: string }) => (
    <View style={addStyles.inputHalf}>
      <FieldLabel text={label} />
      <View style={[addStyles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {icon && <Ionicons name={icon as any} size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />}
        <TextInput
          style={[addStyles.textInput, { color: colors.text }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          keyboardType={keyboardType}
          textAlign="right"
        />
      </View>
    </View>
  );

  return (
    <View style={[addStyles.container, { backgroundColor: colors.background }]}>
      <View style={[addStyles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[addStyles.headerClose, { backgroundColor: colors.background }]}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[addStyles.headerTitle, { color: colors.text }]}>{t('addNewProperty')}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={addStyles.scroll}
        contentContainerStyle={addStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[addStyles.sectionHeader, { borderBottomColor: colors.border }]}>
          <Ionicons name="camera-outline" size={22} color={colors.primary} />
          <Text style={[addStyles.sectionTitle, { color: colors.text }]}>{t('images')}</Text>
          <Text style={[addStyles.sectionCount, { color: colors.textSecondary }]}>{selectedImages.length}/10</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
          {selectedImages.map((img, index) => (
            <View key={index} style={addStyles.imageThumb}>
              <Image source={{ uri: img.uri }} style={addStyles.thumbImage} />
              <TouchableOpacity style={addStyles.removeImageBtn} onPress={() => removeImage(index)}>
                <Ionicons name="close-circle" size={22} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          {selectedImages.length < 10 && (
            <TouchableOpacity style={[addStyles.addImageBtn, { borderColor: colors.primary + '40', backgroundColor: colors.primary + '06' }]} onPress={() => setImageSheetVisible(true)}>
              <Ionicons name="camera-outline" size={32} color={colors.primary} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primary, marginTop: 4 }}>{t('addImages')}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <View style={[addStyles.sectionHeader, { borderBottomColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
          <Text style={[addStyles.sectionTitle, { color: colors.text }]}>{t('basicInfo')}</Text>
        </View>
        <FieldLabel text={t('propertyTitle') + ' *'} />
        <View style={[addStyles.inputBox, addStyles.inputFull, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="home-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput style={[addStyles.textInput, { color: colors.text }]} value={title} onChangeText={setTitle} placeholder={t('propertyTitle')} placeholderTextColor={colors.placeholder} textAlign="right" />
        </View>

        <FieldLabel text={t('description')} />
        <View style={[addStyles.inputBox, addStyles.inputFull, { minHeight: 100, alignItems: 'flex-start', backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput style={[addStyles.textInput, { minHeight: 80, textAlignVertical: 'top', color: colors.text }]} value={description} onChangeText={setDescription} placeholder={t('propertyDesc')} placeholderTextColor={colors.placeholder} multiline numberOfLines={4} textAlign="right" />
        </View>

        <FieldLabel text={t('type')} />
        <PillRow items={PROPERTY_TYPES} selected={propertyType} onSelect={setPropertyType} />
        <FieldLabel text={t('propertyStatus.forSale')} />
        <PillRow items={PROPERTY_STATUSES} selected={status} onSelect={setStatus} />
        <FieldLabel text={t('categories.residential')} />
        <PillRow items={PROPERTY_CATEGORIES} selected={category} onSelect={setCategory} />

        <View style={[addStyles.sectionHeader, { borderBottomColor: colors.border }]}>
          <Ionicons name="stats-chart-outline" size={22} color={colors.primary} />
          <Text style={[addStyles.sectionTitle, { color: colors.text }]}>{t('details')}</Text>
        </View>

        <View style={addStyles.rowGrid}>
          <InputRow label={t('price') + ' * (ر.س)'} value={formatPrice(price)} onChange={(t2) => setPrice(t2.replace(/[^0-9]/g, ''))} placeholder="850,000" keyboardType="number-pad" icon="cash-outline" />
          <InputRow label={t('area') + ' (م²)'} value={area} onChange={setArea} placeholder="350" keyboardType="number-pad" icon="resize-outline" />
        </View>
        <View style={addStyles.rowGrid}>
          <InputRow label={t('bedrooms')} value={bedrooms} onChange={setBedrooms} placeholder="0" keyboardType="number-pad" icon="bed-outline" />
          <InputRow label={t('bathrooms')} value={bathrooms} onChange={setBathrooms} placeholder="0" keyboardType="number-pad" icon="water-outline" />
        </View>
        <View style={addStyles.rowGrid}>
          <InputRow label={t('floor')} value={floor} onChange={setFloor} placeholder="0" keyboardType="number-pad" icon="layers-outline" />
          <InputRow label={t('age') + ' (سنة)'} value={age} onChange={setAge} placeholder="0" keyboardType="number-pad" icon="time-outline" />
        </View>

        <View style={[addStyles.sectionHeader, { borderBottomColor: colors.border }]}>
          <Ionicons name="location-outline" size={22} color={colors.primary} />
          <Text style={[addStyles.sectionTitle, { color: colors.text }]}>{t('location')}</Text>
        </View>
        <FieldLabel text={t('city')} />
        <View style={[addStyles.inputBox, addStyles.inputFull, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="location-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput style={[addStyles.textInput, { color: colors.text }]} value={city} onChangeText={setCity} placeholder={t('city')} placeholderTextColor={colors.placeholder} textAlign="right" />
        </View>
        <FieldLabel text={t('district')} />
        <View style={[addStyles.inputBox, addStyles.inputFull, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput style={[addStyles.textInput, { color: colors.text }]} value={district} onChangeText={setDistrict} placeholder={t('district')} placeholderTextColor={colors.placeholder} textAlign="right" />
        </View>
        <FieldLabel text={t('street')} />
        <View style={[addStyles.inputBox, addStyles.inputFull, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput style={[addStyles.textInput, { color: colors.text }]} value={street} onChangeText={setStreet} placeholder={t('street')} placeholderTextColor={colors.placeholder} textAlign="right" />
        </View>

        <View style={[addStyles.sectionHeader, { borderBottomColor: colors.border }]}>
          <Ionicons name="star-outline" size={22} color={colors.primary} />
          <Text style={[addStyles.sectionTitle, { color: colors.text }]}>{t('features')}</Text>
          <Text style={[addStyles.sectionCount, { color: colors.textSecondary }]}>{selectedFeatures.length}</Text>
        </View>
        <View style={addStyles.featuresGrid}>
          {FEATURES.map((feature) => {
            const isSelected = selectedFeatures.includes(feature);
            return (
              <TouchableOpacity
                key={feature}
                onPress={() => toggleFeature(feature)}
                style={[addStyles.featureChip, { borderColor: colors.border }, isSelected && [addStyles.featureChipActive, { backgroundColor: colors.primary, borderColor: colors.primary }]]}
              >
                {isSelected && <Ionicons name="checkmark" size={14} color="#FFF" style={{ marginRight: 4 }} />}
                <Text style={[addStyles.featureChipText, { color: colors.textSecondary }, isSelected && addStyles.featureChipTextActive]}>{feature}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[addStyles.sectionHeader, { borderBottomColor: colors.border }]}>
          <Ionicons name="person-outline" size={22} color={colors.primary} />
          <Text style={[addStyles.sectionTitle, { color: colors.text }]}>{t('owner')}</Text>
        </View>
        <View style={addStyles.rowGrid}>
          <InputRow label={t('ownerName')} value={ownerName} onChange={setOwnerName} placeholder={t('ownerName')} icon="person-outline" />
          <InputRow label={t('ownerPhone')} value={ownerPhone} onChange={setOwnerPhone} placeholder="05xxxxxxxx" keyboardType="phone-pad" icon="call-outline" />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={[addStyles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[addStyles.saveBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <Text style={addStyles.saveBtnText}>{t('loading')}</Text>
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={20} color="#FFF" />
              <Text style={addStyles.saveBtnText}>{t('publishProperty')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <BottomSheet visible={imageSheetVisible} onClose={() => setImageSheetVisible(false)} title={t('addImages')} height={260}>
        <TouchableOpacity style={addStyles.sheetOption} onPress={pickImageFromCamera}>
          <View style={[addStyles.sheetIconBox, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="camera" size={24} color={colors.primary} />
          </View>
          <Text style={[addStyles.sheetOptionText, { color: colors.text }]}>{t('takePhoto')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={addStyles.sheetOption} onPress={pickImagesFromGallery}>
          <View style={[addStyles.sheetIconBox, { backgroundColor: colors.secondary + '15' }]}>
            <Ionicons name="images" size={24} color={colors.secondary} />
          </View>
          <Text style={[addStyles.sheetOptionText, { color: colors.text }]}>{t('chooseFromGallery')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[addStyles.sheetCancel, { backgroundColor: colors.background }]} onPress={() => setImageSheetVisible(false)}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textSecondary }}>{t('cancel')}</Text>
        </TouchableOpacity>
      </BottomSheet>
    </View>
  );
}

const addStyles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 56 : 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerClose: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 120 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 14, paddingBottom: 10, borderBottomWidth: 1 },
  sectionTitle: { fontSize: 17, fontWeight: '800', flex: 1 },
  sectionCount: { fontSize: 13, fontWeight: '700' },
  fieldLabel: { fontSize: 14, fontWeight: '700', marginBottom: 6, marginTop: 12, textAlign: 'right' },
  inputBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, minHeight: 50 },
  inputFull: { width: '100%' },
  textInput: { flex: 1, fontSize: 15, paddingVertical: 12 },
  rowGrid: { flexDirection: 'row', gap: 12 },
  inputHalf: { flex: 1 },
  pill: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12, backgroundColor: '#F1F5F9', borderWidth: 2, borderColor: '#F1F5F9' },
  pillText: { fontSize: 14, fontWeight: '600' },
  imageThumb: { width: 110, height: 110, borderRadius: 14, overflow: 'hidden', position: 'relative' },
  thumbImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImageBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: '#FFF', borderRadius: 11, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  addImageBtn: { width: 110, height: 110, borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  featureChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#F1F5F9', borderWidth: 1 },
  featureChipActive: {},
  featureChipText: { fontSize: 13, fontWeight: '500' },
  featureChipTextActive: { color: '#FFF', fontWeight: '600' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 16, borderTopWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 8 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  saveBtnText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  sheetOption: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 4 },
  sheetIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sheetOptionText: { fontSize: 16, fontWeight: '600' },
  sheetCancel: { marginTop: 8, paddingVertical: 14, alignItems: 'center', borderRadius: 14 },
});
