import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../src/context/AppContext';
import { Colors } from '../src/components/UI';
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
      Alert.alert('خطأ', 'فشل التقاط الصورة، حاول مرة أخرى');
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
      Alert.alert('خطأ', 'فشل اختيار الصور، حاول مرة أخرى');
    }
  };

  const addImages = (images: SelectedImage[]) => {
    const remaining = 10 - selectedImages.length;
    const toAdd = images.slice(0, remaining);
    setSelectedImages((prev) => [...prev, ...toAdd]);
    if (images.length > remaining) {
      Alert.alert('تنبيه', `يمكنك إضافة ${10} صور كحد أقصى، تم إضافة أول ${remaining} صور`);
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
    // Validation
    if (!title.trim()) {
      Alert.alert('حقل مطلوب', 'يرجى إدخال عنوان العقار');
      return;
    }
    const priceNum = parseFloat(price.replace(/[^0-9]/g, ''));
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('حقل مطلوب', 'يرجى إدخال سعر صحيح أكبر من صفر');
      return;
    }

    setSaving(true);
    try {
      // Create property first to get an ID
      const propId = 'prop_' + Date.now();

      // Save images
      const savedImagePaths: string[] = [];
      for (const img of selectedImages) {
        try {
          const localPath = await saveImage(img.uri, propId);
          savedImagePaths.push(localPath);
        } catch (e) {
          // Skip failed images
        }
      }

      // Add property
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
        location: {
          city: city.trim(),
          district: district.trim(),
          street: street.trim(),
          coordinates: { lat: 0, lng: 0 },
        },
        features: selectedFeatures,
        images: savedImagePaths,
        owner: {
          name: ownerName.trim() || 'أنا',
          phone: ownerPhone.trim(),
          type: 'مالك',
        },
      });

      router.back();
    } catch (e) {
      Alert.alert('خطأ', 'فشل حفظ العقار، حاول مرة أخرى');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ===== Images Section ===== */}
        <Text style={styles.sectionTitle}>صور العقار</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imagesScroll}
        >
          {selectedImages.map((img, index) => (
            <View key={index} style={styles.imageThumb}>
              <Image source={{ uri: img.uri }} style={styles.thumbImage} />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-circle" size={22} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          {selectedImages.length < 10 && (
            <TouchableOpacity
              style={styles.addImageBtn}
              onPress={() => setImageSheetVisible(true)}
            >
              <Ionicons name="camera-outline" size={32} color={Colors.primary} />
              <Text style={styles.addImageText}>إضافة صور</Text>
              <Text style={styles.addImageCount}>
                {selectedImages.length}/10
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Image Picker Action Sheet Modal */}
        <Modal
          visible={imageSheetVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setImageSheetVisible(false)}
        >
          <TouchableOpacity
            style={styles.sheetOverlay}
            activeOpacity={1}
            onPress={() => setImageSheetVisible(false)}
          >
            <View style={styles.sheetContainer}>
              <Text style={styles.sheetTitle}>إضافة صورة</Text>
              <TouchableOpacity style={styles.sheetOption} onPress={pickImageFromCamera}>
                <View style={[styles.sheetIconBox, { backgroundColor: Colors.primary + '15' }]}>
                  <Ionicons name="camera" size={24} color={Colors.primary} />
                </View>
                <Text style={styles.sheetOptionText}>التقاط صورة</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetOption} onPress={pickImagesFromGallery}>
                <View style={[styles.sheetIconBox, { backgroundColor: Colors.secondary + '15' }]}>
                  <Ionicons name="images" size={24} color={Colors.secondary} />
                </View>
                <Text style={styles.sheetOptionText}>اختيار من المعرض</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sheetCancel}
                onPress={() => setImageSheetVisible(false)}
              >
                <Text style={styles.sheetCancelText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* ===== Title ===== */}
        <Text style={styles.fieldLabel}>العنوان *</Text>
        <View style={styles.inputBox}>
          <Ionicons name="home-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="مثال: فيلا فاخرة بحي الياسمين"
            placeholderTextColor="#94A3B8"
            textAlign="right"
          />
        </View>

        {/* ===== Description ===== */}
        <Text style={styles.fieldLabel}>الوصف</Text>
        <View style={[styles.inputBox, styles.textareaBox]}>
          <TextInput
            style={[styles.textInput, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            placeholder="اكتب وصفاً تفصيلياً للعقار..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            textAlign="right"
            textAlignVertical="top"
          />
        </View>

        {/* ===== Property Type ===== */}
        <Text style={styles.fieldLabel}>نوع العقار</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
          {PROPERTY_TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setPropertyType(t)}
              style={[styles.pill, propertyType === t && styles.pillActive]}
            >
              <Text style={[styles.pillText, propertyType === t && styles.pillTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ===== Status ===== */}
        <Text style={styles.fieldLabel}>حالة العقار</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
          {PROPERTY_STATUSES.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setStatus(s)}
              style={[styles.pill, status === s && styles.pillActive]}
            >
              <Text style={[styles.pillText, status === s && styles.pillTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ===== Category ===== */}
        <Text style={styles.fieldLabel}>التصنيف</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
          {PROPERTY_CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setCategory(c)}
              style={[styles.pill, category === c && styles.pillActive]}
            >
              <Text style={[styles.pillText, category === c && styles.pillTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ===== Price & Area Row ===== */}
        <View style={styles.rowGrid}>
          <View style={styles.rowHalf}>
            <Text style={styles.fieldLabel}>السعر * (ر.س)</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInput}
                value={formatPrice(price)}
                onChangeText={(t) => setPrice(t.replace(/[^0-9]/g, ''))}
                placeholder="مثال: 850,000"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                textAlign="right"
              />
            </View>
          </View>
          <View style={styles.rowHalf}>
            <Text style={styles.fieldLabel}>المساحة (م²)</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInput}
                value={area}
                onChangeText={setArea}
                placeholder="مثال: 350"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                textAlign="right"
              />
            </View>
          </View>
        </View>

        {/* ===== Bedrooms, Bathrooms, Floor, Age Grid ===== */}
        <View style={styles.rowGrid}>
          <View style={styles.rowHalf}>
            <Text style={styles.fieldLabel}>غرف النوم</Text>
            <View style={styles.inputBox}>
              <Ionicons name="bed-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={bedrooms}
                onChangeText={setBedrooms}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                textAlign="right"
              />
            </View>
          </View>
          <View style={styles.rowHalf}>
            <Text style={styles.fieldLabel}>دورات المياه</Text>
            <View style={styles.inputBox}>
              <Ionicons name="water-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={bathrooms}
                onChangeText={setBathrooms}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                textAlign="right"
              />
            </View>
          </View>
        </View>

        <View style={styles.rowGrid}>
          <View style={styles.rowHalf}>
            <Text style={styles.fieldLabel}>الطابق</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInput}
                value={floor}
                onChangeText={setFloor}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                textAlign="right"
              />
            </View>
          </View>
          <View style={styles.rowHalf}>
            <Text style={styles.fieldLabel}>العمر (سنة)</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInput}
                value={age}
                onChangeText={setAge}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                textAlign="right"
              />
            </View>
          </View>
        </View>

        {/* ===== Location ===== */}
        <Text style={styles.sectionTitle}>الموقع</Text>
        <Text style={styles.fieldLabel}>المدينة</Text>
        <View style={styles.inputBox}>
          <Ionicons name="location-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={city}
            onChangeText={setCity}
            placeholder="مثال: الرياض"
            placeholderTextColor="#94A3B8"
            textAlign="right"
          />
        </View>
        <Text style={styles.fieldLabel}>الحي</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.textInput}
            value={district}
            onChangeText={setDistrict}
            placeholder="مثال: الياسمين"
            placeholderTextColor="#94A3B8"
            textAlign="right"
          />
        </View>
        <Text style={styles.fieldLabel}>الشارع</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.textInput}
            value={street}
            onChangeText={setStreet}
            placeholder="مثال: شارع الأمير تركي"
            placeholderTextColor="#94A3B8"
            textAlign="right"
          />
        </View>

        {/* ===== Features ===== */}
        <Text style={styles.sectionTitle}>المميزات</Text>
        <View style={styles.featuresGrid}>
          {FEATURES.map((feature) => {
            const isSelected = selectedFeatures.includes(feature);
            return (
              <TouchableOpacity
                key={feature}
                onPress={() => toggleFeature(feature)}
                style={[styles.featureChip, isSelected && styles.featureChipActive]}
              >
                {isSelected && <Ionicons name="checkmark" size={14} color="#FFF" style={{ marginLeft: 4 }} />}
                <Text style={[styles.featureChipText, isSelected && styles.featureChipTextActive]}>
                  {feature}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ===== Owner Info ===== */}
        <Text style={styles.sectionTitle}>معلومات المالك</Text>
        <View style={styles.rowGrid}>
          <View style={styles.rowHalf}>
            <Text style={styles.fieldLabel}>الاسم</Text>
            <View style={styles.inputBox}>
              <Ionicons name="person-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={ownerName}
                onChangeText={setOwnerName}
                placeholder="اسم المالك"
                placeholderTextColor="#94A3B8"
                textAlign="right"
              />
            </View>
          </View>
          <View style={styles.rowHalf}>
            <Text style={styles.fieldLabel}>رقم الجوال</Text>
            <View style={styles.inputBox}>
              <Ionicons name="call-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={ownerPhone}
                onChangeText={setOwnerPhone}
                placeholder="05xxxxxxxx"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                textAlign="right"
              />
            </View>
          </View>
        </View>

        {/* Spacer before button */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Save Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <Text style={styles.saveBtnText}>جاري الحفظ...</Text>
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#FFF" />
              <Text style={styles.saveBtnText}>حفظ العقار</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  // Images
  imagesScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  imageThumb: {
    width: 120,
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFF',
    borderRadius: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  addImageBtn: {
    width: 120,
    height: 120,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.primary + '40',
    borderStyle: 'dashed',
    backgroundColor: Colors.primary + '08',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addImageText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  addImageCount: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  // Action Sheet Modal
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  sheetIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  sheetCancel: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 14,
  },
  sheetCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  // Fields
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    marginTop: 12,
    textAlign: 'right',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 12,
  },
  textareaBox: {
    minHeight: 100,
    alignItems: 'flex-start',
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  // Pills
  pillsScroll: {
    gap: 8,
    paddingRight: 4,
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  pillActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  pillTextActive: {
    color: Colors.primary,
  },
  // Row grid
  rowGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  rowHalf: {
    flex: 1,
  },
  // Features
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  featureChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  featureChipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 28,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
  },
});
