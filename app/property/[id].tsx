import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { Colors, SpecItem, FeatureChip, SectionCard, Avatar, DotIndicators, PropertyImageCard } from '../../src/components/UI';
import type { Property } from '../../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 340;

const PROPERTY_TYPE_ICONS: Record<string, string> = {
  'فيلا': 'home',
  'شقة': 'office-building',
  'أرض': 'terrain',
  'مكتب': 'briefcase',
  'محل': 'storefront',
  'مستودع': 'warehouse',
  'عمارة': 'office-building',
};

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProperty, deleteProperty, properties, updateProperty } = useApp();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      const timer = setTimeout(() => {
        const found = getProperty(id);
        setProperty(found || null);
        setLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [id]);

  const handleDelete = () => {
    if (!property) return;
    Alert.alert(
      'حذف العقار',
      `هل أنت متأكد من حذف "${property.title}"؟ لا يمكن التراجع عن هذا الإجراء.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'حذف', style: 'destructive', onPress: async () => { await deleteProperty(property.id); router.back(); } },
      ]
    );
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentImageIndex(idx);
  };

  // ============ حالة التحميل ============
  if (loading) {
    return (
      <View style={styles.centered}>
        <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary }} />
        </View>
        <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.textSecondary }}>جاري التحميل...</Text>
      </View>
    );
  }

  // ============ غير موجود ============
  if (!property) {
    return (
      <View style={styles.centered}>
        <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Ionicons name="alert-circle-outline" size={60} color="#CBD5E1" />
        </View>
        <Text style={{ fontSize: 22, fontWeight: '800', color: Colors.text, textAlign: 'center' }}>العقار غير موجود</Text>
        <Text style={{ fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22 }}>ربما تم حذف العقار أو أن الرابط غير صحيح</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#FFF" />
          <Text style={styles.backBtnText}>العودة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = property.images || [];
  const hasImages = images.length > 0;
  const pricePerMeter = property.area > 0 ? Math.round(property.price / property.area) : 0;
  const typeIcon = PROPERTY_TYPE_ICONS[property.type] || 'home';

  // عقارات مشابهة (من نفس النوع أو المدينة)
  const similar = properties.filter((p) => p.id !== property.id && (p.type === property.type || p.location.city === property.location.city)).slice(0, 6);

  const SPECS_GRID = [
    { icon: 'home-outline', label: 'النوع', value: property.type },
    { icon: 'resize-outline', label: 'المساحة', value: `${property.area} م²` },
    { icon: 'bed-outline', label: 'غرف النوم', value: property.bedrooms > 0 ? property.bedrooms.toString() : '-' },
    { icon: 'water-outline', label: 'الحمامات', value: property.bathrooms > 0 ? property.bathrooms.toString() : '-' },
    { icon: 'layers-outline', label: 'الطابق', value: property.floor > 0 ? property.floor.toString() : 'أرضي' },
    { icon: 'time-outline', label: 'العمر', value: property.age > 0 ? `${property.age} سنة` : 'جديد' },
  ];

  const descShouldTruncate = (property.description?.length || 0) > 150;
  const displayDesc = descExpanded
    ? property.description
    : (property.description?.slice(0, 150) || '') + (descShouldTruncate ? '...' : '');

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ===== كاروسيل الصور ===== */}
        <View style={styles.carouselContainer}>
          {hasImages ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                decelerationRate="fast"
                snapToInterval={SCREEN_WIDTH}
                snapToAlignment="center"
                disableIntervalMomentum
              >
                {images.map((imgUri, index) => (
                  <View key={index} style={[styles.carouselImageWrap, { width: SCREEN_WIDTH }]}>
                    <Image source={{ uri: imgUri }} style={styles.carouselImage} resizeMode="cover" />
                  </View>
                ))}
              </ScrollView>

              {/* نقاط المؤشر */}
              {images.length > 1 && (
                <View style={styles.dotsContainer}>
                  <DotIndicators total={images.length} active={currentImageIndex} color="#FFF" inactiveColor="rgba(255,255,255,0.4)" />
                </View>
              )}

              {/* عداد الصور */}
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>{currentImageIndex + 1}/{images.length}</Text>
              </View>
            </>
          ) : (
            <View style={styles.carouselPlaceholder}>
              <View style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: Colors.primary + '08' }} />
              <View style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.primary + '05' }} />
              <Ionicons name={typeIcon as any} size={80} color="#CBD5E1" />
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#94A3B8', marginTop: 12 }}>لا توجد صور</Text>
            </View>
          )}

          {/* زر الرجوع */}
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>

          {/* وسام الحالة */}
          <View style={[styles.statusBadgeOverlay, {
            backgroundColor: property.status === 'للبيع' ? Colors.primary : property.status === 'للإيجار' ? Colors.secondary : Colors.warning,
          }]}>
            <Text style={styles.statusBadgeText}>{property.status}</Text>
          </View>

          {/* وسام التصنيف */}
          <View style={[styles.categoryBadgeOverlay, { right: property.status ? 90 : 16 }]}>
            <Ionicons name="grid-outline" size={11} color="#FFF" />
            <Text style={styles.categoryBadgeText}>{property.category}</Text>
          </View>
        </View>

        {/* ===== المحتوى (حاوية بيضاء مدورة) ===== */}
        <View style={styles.contentContainer}>
          {/* السعر */}
          <View style={{ paddingHorizontal: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <Text style={styles.priceValue}>{property.price.toLocaleString('ar-SA')}</Text>
              <Text style={styles.priceUnit}>ر.س</Text>
              {property.status === 'للإيجار' && <Text style={styles.priceYear}>/ سنة</Text>}
            </View>
            {pricePerMeter > 0 && (
              <Text style={styles.pricePerMeter}>{pricePerMeter.toLocaleString('ar-SA')} ر.س / م²</Text>
            )}
            <Text style={styles.propertyTitle}>{property.title}</Text>
          </View>

          {/* شبكة المواصفات */}
          <SectionCard style={{ marginTop: 18, marginHorizontal: 4 }}>
            <View style={styles.specsGrid}>
              {SPECS_GRID.map((spec, i) => (
                <View
                  key={spec.label}
                  style={[
                    styles.specCell,
                    (i + 1) % 3 !== 0 && styles.specCellBorderRight,
                    i < SPECS_GRID.length - 3 && styles.specCellBorderBottom,
                  ]}
                >
                  <SpecItem icon={spec.icon} label={spec.label} value={spec.value} />
                </View>
              ))}
            </View>
          </SectionCard>

          {/* الموقع */}
          <View style={{ paddingHorizontal: 4, marginTop: 16 }}>
            <Text style={styles.sectionTitle}>📍 الموقع</Text>
            <SectionCard>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Ionicons name="location-outline" size={20} color={Colors.primary} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.text }}>
                    {property.location.district ? `${property.location.district}، ` : ''}{property.location.city}
                  </Text>
                  {property.location.street ? (
                    <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>{property.location.street}</Text>
                  ) : null}
                </View>
              </View>
              {property.location.coordinates?.lat !== 0 && (
                <TouchableOpacity
                  style={styles.mapBtn}
                  onPress={() => {
                    const { lat, lng } = property.location.coordinates;
                    const { Linking } = require('react-native');
                    Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`);
                  }}
                >
                  <Ionicons name="map-outline" size={18} color={Colors.primary} />
                  <Text style={styles.mapBtnText}>فتح في الخرائط</Text>
                </TouchableOpacity>
              )}
            </SectionCard>
          </View>

          {/* المميزات */}
          {property.features && property.features.length > 0 && (
            <View style={{ paddingHorizontal: 4, marginTop: 16 }}>
              <Text style={styles.sectionTitle}>✨ المميزات</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {property.features.map((feature, index) => (
                  <FeatureChip key={index} label={feature} showCheck />
                ))}
              </View>
            </View>
          )}

          {/* الوصف */}
          {property.description ? (
            <View style={{ paddingHorizontal: 4, marginTop: 16 }}>
              <Text style={styles.sectionTitle}>📝 الوصف</Text>
              <SectionCard>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, lineHeight: 24 }}>{displayDesc}</Text>
                {descShouldTruncate && (
                  <TouchableOpacity onPress={() => setDescExpanded(!descExpanded)} style={{ marginTop: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.primary }}>
                      {descExpanded ? 'عرض أقل' : 'عرض المزيد'}
                    </Text>
                  </TouchableOpacity>
                )}
              </SectionCard>
            </View>
          ) : null}

          {/* المالك */}
          <View style={{ paddingHorizontal: 4, marginTop: 16 }}>
            <Text style={styles.sectionTitle}>👤 المالك</Text>
            <SectionCard>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Avatar name={property.owner.name} size={52} />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.text }}>{property.owner.name}</Text>
                  {property.owner.phone ? (
                    <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>{property.owner.phone}</Text>
                  ) : null}
                </View>
                {property.owner.phone ? (
                  <TouchableOpacity
                    style={styles.callCircle}
                    onPress={() => {
                      const { Linking } = require('react-native');
                      Linking.openURL(`tel:${property.owner.phone}`);
                    }}
                  >
                    <Ionicons name="call-outline" size={22} color="#FFF" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </SectionCard>
          </View>

          {/* عقارات مشابهة */}
          {similar.length > 0 && (
            <View style={{ paddingHorizontal: 4, marginTop: 20 }}>
              <Text style={styles.sectionTitle}>🏠 عقارات مشابهة</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
                {similar.map((p) => (
                  <PropertyImageCard key={p.id} property={p} onPress={() => router.replace(`/property/${p.id}`)} />
                ))}
              </ScrollView>
            </View>
          )}

          {/* تاريخ الإضافة */}
          <SectionCard style={{ marginTop: 16, marginHorizontal: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
              <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
                تاريخ الإضافة: {new Date(property.createdAt).toLocaleDateString('ar-SA')}
              </Text>
            </View>
          </SectionCard>

          {/* مساحة فارغة للشريط السفلي */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* ===== الشريط السفلي الثابت ===== */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomIconBtn}
          onPress={() => setIsFavorite(!isFavorite)}
          activeOpacity={0.7}
        >
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color={isFavorite ? Colors.error : Colors.textSecondary} />
          <Text style={styles.bottomIconLabel}>حفظ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomIconBtn}
          onPress={() => {
            const { Share } = require('react-native');
            Share.share({ message: `${property.title}\nالسعر: ${property.price.toLocaleString('ar-SA')} ر.س\n${property.location.city} - ${property.location.district}` });
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="share-social-outline" size={22} color={Colors.textSecondary} />
          <Text style={styles.bottomIconLabel}>مشاركة</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomActionBtn, { backgroundColor: Colors.whatsapp }]}
          onPress={() => {
            const { Linking } = require('react-native');
            if (property.owner.phone) {
              const cleanPhone = property.owner.phone.replace(/[\s-]/g, '').replace(/^0/, '966');
              Linking.openURL(`whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(`مرحباً، أنا مهتم بالعقار: ${property.title}`)}`);
            }
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
          <Text style={styles.bottomActionText}>واتساب</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomActionBtn, { backgroundColor: Colors.primary }]}
          onPress={() => {
            const { Linking } = require('react-native');
            if (property.owner.phone) Linking.openURL(`tel:${property.owner.phone}`);
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="call-outline" size={20} color="#FFF" />
          <Text style={styles.bottomActionText}>اتصال</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 0 },
  // ============ حالات التحميل / غير موجود ============
  centered: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 40 },
  backBtn: { marginTop: 24, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 28, paddingVertical: 14, backgroundColor: Colors.primary, borderRadius: 14 },
  backBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  // ============ الكاروسيل ============
  carouselContainer: { height: IMAGE_HEIGHT, position: 'relative', backgroundColor: '#F1F5F9' },
  carouselImageWrap: { height: IMAGE_HEIGHT },
  carouselImage: { width: '100%', height: '100%' },
  carouselPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  dotsContainer: { position: 'absolute', bottom: 14, left: 0, right: 0 },
  imageCounter: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  imageCounterText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  closeBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 56 : 16, left: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4, elevation: 4 },
  statusBadgeOverlay: { position: 'absolute', top: Platform.OS === 'ios' ? 56 : 16, right: 16, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  statusBadgeText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  categoryBadgeOverlay: { position: 'absolute', top: Platform.OS === 'ios' ? 56 : 16, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  categoryBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  // ============ المحتوى (بطاقة بيضاء مدورة) ============
  contentContainer: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, paddingTop: 24, paddingHorizontal: 16, paddingBottom: 16 },
  priceValue: { fontSize: 32, fontWeight: '900', color: Colors.primary },
  priceUnit: { fontSize: 16, fontWeight: '600', color: Colors.primary },
  priceYear: { fontSize: 14, color: Colors.textSecondary },
  pricePerMeter: { fontSize: 13, color: Colors.warning, marginTop: 2, fontWeight: '600' },
  propertyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginTop: 8, lineHeight: 26 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.text, marginBottom: 10 },
  // ============ شبكة المواصفات ============
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  specCell: { width: '33.33%', alignItems: 'center', paddingVertical: 6 },
  specCellBorderRight: { borderRightWidth: 1, borderRightColor: Colors.border },
  specCellBorderBottom: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  // ============ الموقع ============
  mapBtn: { marginTop: 14, height: 44, borderRadius: 12, backgroundColor: Colors.primary + '10', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  mapBtnText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  // ============ المالك ============
  callCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.success, alignItems: 'center', justifyContent: 'center' },
  // ============ الشريط السفلي ============
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 10, paddingBottom: Platform.OS === 'ios' ? 32 : 16, flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: Colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 8 },
  bottomIconBtn: { width: 44, alignItems: 'center', justifyContent: 'center', gap: 2 },
  bottomIconLabel: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary },
  bottomActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 46, borderRadius: 12 },
  bottomActionText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});
