import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  I18nManager,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Colors, Spacing } from '../src/constants/theme';
import { getPropertyById, Property } from '../src/data/properties';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

function formatPrice(price: number): string {
  return price.toLocaleString('ar-SA') + ' ر.س';
}

function getTypeEmoji(type: Property['type']): string {
  switch (type) {
    case 'فيلا':
      return '🏡';
    case 'شقة':
      return '🏢';
    case 'أرض':
      return '🌍';
    case 'محل':
      return '🏪';
    default:
      return '🏠';
  }
}

function getPurposeLabel(purpose: Property['purpose']): string {
  switch (purpose) {
    case 'بيع':
      return 'للبيع';
    case 'إيجار':
      return 'للإيجار';
    case 'استثمار':
      return 'للاستثمار';
    default:
      return '';
  }
}

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const property = id ? getPropertyById(id) : undefined;

  if (!property) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: '❌ غير موجود' }} />
        <Text style={styles.errorEmoji}>🏚️</Text>
        <Text style={styles.errorText}>العقار غير موجود</Text>
        <Text style={styles.errorSubtext}>الرجاء التحقق من الرابط والمحاولة مرة أخرى</Text>
      </View>
    );
  }

  const handleContact = () => {
    Alert.alert(
      '📞 تواصل مع المعلن',
      'سيتم الاتصال بالمعلن قريباً. هذه الميزة قيد التطوير.',
      [{ text: 'حسناً' }],
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${getTypeEmoji(property.type)} ${property.title}\n${property.city} - ${property.district}\nالسعر: ${formatPrice(property.price)}\nالمساحة: ${property.area} م²\n\nعقاراتي - تطبيق العقارات الأول`,
      });
    } catch {
      // ignore share errors
    }
  };

  const statusColor =
    property.status === 'نشط' ? Colors.success : Colors.textMuted;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ title: property.title }} />

      {/* Image Placeholder */}
      <View style={[styles.imagePlaceholder, { backgroundColor: property.image }]}>
        <Text style={styles.imageEmoji}>{getTypeEmoji(property.type)}</Text>
        <View style={styles.statusOverlay}>
          <Text style={[styles.statusBadge, { color: statusColor }]}>
            {property.status === 'نشط' ? '🟢 نشط' : '📝 مسودة'}
          </Text>
        </View>
      </View>

      {/* Price & Purpose */}
      <View style={styles.priceSection}>
        <Text style={styles.priceLabel}>{formatPrice(property.price)}</Text>
        <Text style={styles.purposeLabel}>{getPurposeLabel(property.purpose)}</Text>
      </View>

      {/* Title & Location */}
      <View style={styles.section}>
        <Text style={styles.title}>{property.title}</Text>
        <View style={styles.locationRow}>
          <Text style={styles.locationText}>📍 {property.city} - {property.district}</Text>
          <Text style={styles.typeBadge}>
            {getTypeEmoji(property.type)} {property.type}
          </Text>
        </View>
      </View>

      {/* Details Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 تفاصيل العقار</Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailEmoji}>📐</Text>
            <Text style={styles.detailValue}>{property.area}</Text>
            <Text style={styles.detailLabel}>م² المساحة</Text>
          </View>
          {property.bedrooms > 0 && (
            <View style={styles.detailItem}>
              <Text style={styles.detailEmoji}>🛏️</Text>
              <Text style={styles.detailValue}>{property.bedrooms}</Text>
              <Text style={styles.detailLabel}>غرفة نوم</Text>
            </View>
          )}
          {property.bathrooms > 0 && (
            <View style={styles.detailItem}>
              <Text style={styles.detailEmoji}>🚿</Text>
              <Text style={styles.detailValue}>{property.bathrooms}</Text>
              <Text style={styles.detailLabel}>دورة مياه</Text>
            </View>
          )}
          {property.age !== undefined && property.age > 0 && (
            <View style={styles.detailItem}>
              <Text style={styles.detailEmoji}>📅</Text>
              <Text style={styles.detailValue}>{property.age}</Text>
              <Text style={styles.detailLabel}>سنة العمر</Text>
            </View>
          )}
          {property.direction && (
            <View style={styles.detailItem}>
              <Text style={styles.detailEmoji}>🧭</Text>
              <Text style={styles.detailValue}>{property.direction}</Text>
              <Text style={styles.detailLabel}>الواجهة</Text>
            </View>
          )}
        </View>
      </View>

      {/* Description */}
      {property.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 الوصف</Text>
          <Text style={styles.descriptionText}>{property.description}</Text>
        </View>
      )}

      {/* License Number */}
      {property.licenseNumber && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📄 معلومات إضافية</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>رقم الرخصة:</Text>
            <Text style={styles.infoValue}>{property.licenseNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>تاريخ الإضافة:</Text>
            <Text style={styles.infoValue}>{property.createdAt}</Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.contactButton}
          activeOpacity={0.85}
          onPress={handleContact}
        >
          <Text style={styles.contactButtonText}>📞 تواصل مع المعلن</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shareButton}
          activeOpacity={0.85}
          onPress={handleShare}
        >
          <Text style={styles.shareButtonText}>📤 مشاركة</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  errorEmoji: {
    fontSize: 72,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  imagePlaceholder: {
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageEmoji: {
    fontSize: 72,
  },
  statusOverlay: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
  },
  statusBadge: {
    fontSize: 15,
    fontWeight: '700',
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  priceSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  priceLabel: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  purposeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.secondary,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  section: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'right',
    marginBottom: Spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 15,
    color: Colors.textMuted,
  },
  typeBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primaryDark,
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'right',
    marginBottom: Spacing.md,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  detailItem: {
    width: '30%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
  },
  detailEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  actionsSection: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  contactButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  shareButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
});
