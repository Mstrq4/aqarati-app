import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { Colors } from '../../src/components/UI';
import type { Property } from '../../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = SCREEN_WIDTH - 32;

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
  const { getProperty, deleteProperty } = useApp();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      // Small delay to ensure context is ready
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
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            await deleteProperty(property.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (!property) return;
    router.push(`/add?id=${property.id}`);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <View style={styles.loadingSpinner}>
          <View style={styles.spinnerDot} />
        </View>
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.centered}>
        <View style={styles.notFoundIcon}>
          <Ionicons name="alert-circle-outline" size={60} color="#CBD5E1" />
        </View>
        <Text style={styles.notFoundTitle}>العقار غير موجود</Text>
        <Text style={styles.notFoundSub}>ربما تم حذف العقار أو أن الرابط غير صحيح</Text>
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

  const QUICK_INFO = [
    { icon: 'home-outline', label: 'النوع', value: property.type },
    { icon: 'resize-outline', label: 'المساحة', value: `${property.area} م²` },
    { icon: 'bed-outline', label: 'غرف النوم', value: property.bedrooms > 0 ? property.bedrooms.toString() : '-' },
    { icon: 'water-outline', label: 'الحمامات', value: property.bathrooms > 0 ? property.bathrooms.toString() : '-' },
    { icon: 'layers-outline', label: 'الطابق', value: property.floor > 0 ? property.floor.toString() : 'أرضي' },
    { icon: 'time-outline', label: 'العمر', value: property.age > 0 ? `${property.age} سنوات` : 'جديد' },
  ];

  const activeInfoItems = QUICK_INFO.filter((q) => q.value !== '-');

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== Image Gallery ===== */}
        <View style={styles.galleryContainer}>
          {hasImages ? (
            <View>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / IMAGE_SIZE);
                  setCurrentImageIndex(idx);
                }}
                decelerationRate="fast"
                snapToInterval={IMAGE_SIZE}
                snapToAlignment="center"
              >
                {images.map((imgUri, index) => (
                  <View key={index} style={[styles.galleryImageWrap, { width: IMAGE_SIZE }]}>
                    <Image
                      source={{ uri: imgUri }}
                      style={styles.galleryImage}
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </ScrollView>

              {/* Image Counter */}
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {currentImageIndex + 1}/{images.length}
                </Text>
              </View>

              {/* Dots */}
              {images.length > 1 && (
                <View style={styles.dotsRow}>
                  {images.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        currentImageIndex === index && styles.dotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.galleryPlaceholder}>
              <View style={styles.placeholderBg1} />
              <View style={styles.placeholderBg2} />
              <MaterialCommunityIcons name={typeIcon as any} size={90} color="#CBD5E1" />
              <Text style={styles.placeholderText}>لا توجد صور</Text>
              <TouchableOpacity style={styles.addPhotosBtn} onPress={handleEdit}>
                <Ionicons name="camera-outline" size={18} color={Colors.primary} />
                <Text style={styles.addPhotosText}>أضف صوراً</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Status Badge */}
          <View style={[styles.statusBadge, {
            backgroundColor:
              property.status === 'للبيع' ? Colors.primary
              : property.status === 'للإيجار' ? Colors.secondary
              : '#F59E0B'
          }]}>
            <Text style={styles.statusBadgeText}>{property.status}</Text>
          </View>

          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Ionicons name="grid-outline" size={12} color="#FFF" />
            <Text style={styles.categoryBadgeText}>{property.category}</Text>
          </View>
        </View>

        {/* ===== Title & Price ===== */}
        <View style={styles.sectionPadding}>
          <Text style={styles.propertyTitle}>{property.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceValue}>
              {property.price.toLocaleString('ar-SA')}
            </Text>
            <Text style={styles.priceUnit}>ر.س</Text>
            {property.status === 'للإيجار' && (
              <Text style={styles.priceYear}>/ سنة</Text>
            )}
          </View>
          {pricePerMeter > 0 && (
            <Text style={styles.pricePerMeter}>
              {pricePerMeter.toLocaleString('ar-SA')} ر.س / م²
            </Text>
          )}
        </View>

        {/* ===== Quick Info Grid ===== */}
        <View style={styles.sectionPadding}>
          <View style={styles.infoGrid}>
            {activeInfoItems.map((info, index) => (
              <View
                key={info.label}
                style={[
                  styles.infoCell,
                  (index + 1) % 3 !== 0 && styles.infoCellBorderRight,
                  index < activeInfoItems.length - 3 && styles.infoCellBorderBottom,
                ]}
              >
                <Ionicons name={info.icon as any} size={22} color={Colors.primary} />
                <Text style={styles.infoValue}>{info.value}</Text>
                <Text style={styles.infoLabel}>{info.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ===== Location ===== */}
        <View style={styles.sectionPadding}>
          <Text style={styles.sectionTitle}>📍 الموقع</Text>
          <View style={styles.card}>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.locationMain}>
                  {property.location.district ? `${property.location.district}، ` : ''}{property.location.city}
                </Text>
                {property.location.street ? (
                  <Text style={styles.locationStreet}>{property.location.street}</Text>
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
          </View>
        </View>

        {/* ===== Features ===== */}
        {property.features && property.features.length > 0 && (
          <View style={styles.sectionPadding}>
            <Text style={styles.sectionTitle}>✨ المميزات</Text>
            <View style={styles.featuresWrap}>
              {property.features.map((feature, index) => (
                <View key={index} style={styles.featureChip}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.featureChipText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ===== Description ===== */}
        {property.description ? (
          <View style={styles.sectionPadding}>
            <Text style={styles.sectionTitle}>📝 الوصف</Text>
            <View style={styles.card}>
              <Text style={styles.descriptionText}>{property.description}</Text>
            </View>
          </View>
        ) : null}

        {/* ===== Owner Info ===== */}
        <View style={styles.sectionPadding}>
          <Text style={styles.sectionTitle}>👤 المالك</Text>
          <View style={[styles.card, styles.ownerCard]}>
            <View style={styles.ownerAvatar}>
              <Ionicons name="person-outline" size={24} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ownerName}>{property.owner.name}</Text>
              {property.owner.phone ? (
                <Text style={styles.ownerPhone}>{property.owner.phone}</Text>
              ) : null}
            </View>
            {property.owner.phone ? (
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => {
                  const { Linking } = require('react-native');
                  Linking.openURL(`tel:${property.owner.phone}`);
                }}
              >
                <Ionicons name="call-outline" size={20} color="#FFF" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* ===== Date Info ===== */}
        <View style={styles.sectionPadding}>
          <View style={[styles.card, styles.dateCard]}>
            <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.dateText}>
              تاريخ الإضافة: {new Date(property.createdAt).toLocaleDateString('ar-SA')}
            </Text>
          </View>
        </View>

        {/* Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ===== Bottom Action Bar ===== */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomEditBtn} onPress={handleEdit}>
          <Ionicons name="create-outline" size={20} color={Colors.primary} />
          <Text style={styles.bottomEditText}>تعديل</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomDeleteBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
          <Text style={styles.bottomDeleteText}>حذف</Text>
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
    paddingBottom: 100,
  },
  // Loading / Not found
  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  spinnerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  notFoundIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  notFoundTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  notFoundSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  backBtn: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: Colors.primary,
    borderRadius: 14,
  },
  backBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Gallery
  galleryContainer: {
    height: 300,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  galleryImageWrap: {
    height: 300,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryPlaceholder: {
    height: 300,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  placeholderBg1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.primary + '08',
  },
  placeholderBg2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary + '05',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 12,
    marginBottom: 8,
  },
  addPhotosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.primary + '12',
  },
  addPhotosText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  imageCounterText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#FFF',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusBadgeText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  // Title & Price
  sectionPadding: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  propertyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 30,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 10,
    gap: 6,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.primary,
  },
  priceUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  priceYear: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pricePerMeter: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 10,
  },
  // Info Grid
  infoGrid: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  infoCell: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoCellBorderRight: {
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  infoCellBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 4,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  // Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  locationMain: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  locationStreet: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  mapBtn: {
    marginTop: 14,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  mapBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  // Features
  featuresWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  featureChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  // Description
  descriptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  // Owner
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  ownerPhone: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Date
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomEditBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  bottomEditText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  bottomDeleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.error + '10',
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  bottomDeleteText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.error,
  },
});
