import { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { Colors } from '../../src/components/UI';
import type { Property } from '../../src/types';

function PropertyImageCard({ property, onPress }: { property: Property; onPress: () => void }) {
  const hasImage = property.images && property.images.length > 0;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Image or Placeholder */}
      {hasImage ? (
        <Image source={{ uri: property.images[0] }} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={styles.cardPlaceholder}>
          <Ionicons
            name={
              property.type === 'فيلا' ? 'home' :
              property.type === 'شقة' ? 'business' :
              property.type === 'أرض' ? 'map' : 'briefcase'
            }
            size={44}
            color={Colors.primaryLight}
          />
        </View>
      )}

      {/* Status Badge */}
      <View style={[styles.statusBadge, {
        backgroundColor:
          property.status === 'للبيع' ? Colors.primary :
          property.status === 'للإيجار' ? Colors.secondary : '#F59E0B'
      }]}>
        <Text style={styles.statusBadgeText}>{property.status}</Text>
      </View>

      {/* Image count badge if multiple */}
      {hasImage && (property.images?.length || 0) > 1 && (
        <View style={styles.imageCountBadge}>
          <Ionicons name="images-outline" size={12} color="#FFF" />
          <Text style={styles.imageCountText}>{property.images.length}</Text>
        </View>
      )}

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardPrice}>
          {property.price.toLocaleString('ar-SA')} {property.status === 'للإيجار' ? 'ريال/سنة' : 'ريال'}
        </Text>
        <Text style={styles.cardTitle} numberOfLines={1}>{property.title}</Text>
        <Text style={styles.cardLocation} numberOfLines={1}>
          <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
          {' '}{property.location.district ? `${property.location.district}، ` : ''}{property.location.city}
        </Text>

        {/* Specs */}
        <View style={styles.cardSpecs}>
          {property.area > 0 && (
            <View style={styles.spec}>
              <Ionicons name="resize-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.specText}>{property.area} م²</Text>
            </View>
          )}
          {property.bedrooms > 0 && (
            <View style={styles.spec}>
              <Ionicons name="bed-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.specText}>{property.bedrooms}</Text>
            </View>
          )}
          {property.bathrooms > 0 && (
            <View style={styles.spec}>
              <Ionicons name="water-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.specText}>{property.bathrooms}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { properties, contacts, reminders } = useApp();
  const hasProperties = properties.length > 0;

  const stats = useMemo(() => [
    { label: 'عقار', value: properties.length, icon: 'home-outline', color: Colors.primary },
    { label: 'جهة اتصال', value: contacts.length, icon: 'people-outline', color: Colors.secondary },
    { label: 'تذكير نشط', value: reminders.filter((r) => !r.completed).length, icon: 'alarm-outline', color: '#7C3AED' },
  ], [properties.length, contacts.length, reminders]);

  const renderPropertyCard = ({ item }: { item: Property }) => (
    <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
      <PropertyImageCard property={item} onPress={() => router.push(`/property/${item.id}`)} />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="home-outline" size={64} color="#CBD5E1" />
      </View>
      <Text style={styles.emptyTitle}>لا توجد عقارات بعد</Text>
      <Text style={styles.emptySub}>
        أضف عقارك الأول لتبدأ في إدارة ممتلكاتك بكل سهولة
      </Text>
      <TouchableOpacity
        style={styles.emptyAddBtn}
        onPress={() => router.push('/add')}
      >
        <Ionicons name="add-circle-outline" size={22} color="#FFF" />
        <Text style={styles.emptyAddText}>أضف عقارك الأول</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>عقاراتي</Text>
          <Text style={styles.headerSub}>
            {hasProperties
              ? `${properties.length} ${properties.length === 1 ? 'عقار' : properties.length <= 10 ? 'عقارات' : 'عقاراً'}`
              : 'تطبيقك الشخصي لإدارة عقاراتك'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.headerAddBtn}
          onPress={() => router.push('/add')}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      {hasProperties && (
        <View style={styles.statsRow}>
          {stats.map((stat, index) => (
            <View key={stat.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Onboarding Card (no properties) */}
      {!hasProperties && (
        <View style={styles.onboardingCard}>
          <View style={styles.onboardingIcon}>
            <Ionicons name="home" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.onboardingTitle}>مرحباً بك في عقاراتي!</Text>
          <Text style={styles.onboardingDesc}>
            تطبيقك الشخصي لإدارة ممتلكاتك العقارية.{'\n'}
            أضف عقاراتك، صورها، جهات اتصالك، وتذكيراتك.{'\n'}
            كل شيء في متناول يدك.
          </Text>
          <TouchableOpacity
            style={styles.onboardingBtn}
            onPress={() => router.push('/add')}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FFF" />
            <Text style={styles.onboardingBtnText}>أضف عقارك الأول</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Property List */}
      {hasProperties && (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          renderItem={renderPropertyCard}
          ListHeaderComponent={
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>عقاراتي</Text>
            </View>
          }
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerAddBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  // Onboarding
  onboardingCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.primary + '15',
  },
  onboardingIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  onboardingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  onboardingDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  onboardingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  onboardingBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  // Section
  sectionHeaderRow: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyAddText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  listContent: {
    paddingBottom: 40,
  },
  // Property Card with Image
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  cardImage: {
    height: 180,
    width: '100%',
    backgroundColor: '#F1F5F9',
  },
  cardPlaceholder: {
    height: 180,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  imageCountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  imageCountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardInfo: {
    padding: 14,
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  cardSpecs: {
    flexDirection: 'row',
    gap: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
