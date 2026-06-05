import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { Colors } from '../../src/components/UI';
import type { Property, PropertyType, PropertyStatus } from '../../src/types';

const FILTER_TYPES: { key: PropertyType | 'all'; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'شقة', label: 'شقق' },
  { key: 'فيلا', label: 'فلل' },
  { key: 'أرض', label: 'أراضي' },
  { key: 'مكتب', label: 'مكاتب' },
  { key: 'محل', label: 'محلات' },
  { key: 'مستودع', label: 'مستودعات' },
  { key: 'عمارة', label: 'عمارات' },
];

const FILTER_STATUSES: { key: PropertyStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'للبيع', label: 'للبيع' },
  { key: 'للإيجار', label: 'للإيجار' },
  { key: 'بيع أو إيجار', label: 'بيع أو إيجار' },
];

export default function ExploreScreen() {
  const { properties, searchProperties } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<PropertyType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<PropertyStatus | 'all'>('all');

  // Derive unique cities from properties
  const cities = useMemo(() => {
    const citySet = new Set<string>();
    properties.forEach((p) => {
      if (p.location.city) citySet.add(p.location.city);
    });
    return Array.from(citySet);
  }, [properties]);

  const [filterCity, setFilterCity] = useState<string | 'all'>('all');

  // Filter properties
  const filteredProperties = useMemo(() => {
    let result = [...properties];

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.city.toLowerCase().includes(q) ||
          p.location.district.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      result = result.filter((p) => p.type === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter((p) => p.status === filterStatus);
    }

    // City filter
    if (filterCity !== 'all') {
      result = result.filter((p) => p.location.city === filterCity);
    }

    return result;
  }, [properties, searchQuery, filterType, filterStatus, filterCity]);

  const hasActiveFilters = filterType !== 'all' || filterStatus !== 'all' || filterCity !== 'all' || searchQuery.trim() !== '';

  const clearAllFilters = () => {
    setFilterType('all');
    setFilterStatus('all');
    setFilterCity('all');
    setSearchQuery('');
  };

  const renderPropertyCard = ({ item }: { item: Property }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/property/${item.id}`)}
      activeOpacity={0.9}
    >
      {item.images && item.images.length > 0 ? (
        <Image source={{ uri: item.images[0] }} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={styles.cardPlaceholder}>
          <Ionicons
            name={
              item.type === 'فيلا' ? 'home' :
              item.type === 'شقة' ? 'business' :
              item.type === 'أرض' ? 'map' : 'briefcase'
            }
            size={40}
            color={Colors.primaryLight}
          />
        </View>
      )}
      <View style={[styles.statusBadge, {
        backgroundColor:
          item.status === 'للبيع' ? Colors.primary :
          item.status === 'للإيجار' ? Colors.secondary : '#F59E0B'
      }]}>
        <Text style={styles.statusBadgeText}>{item.status}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardPrice}>
          {item.price.toLocaleString('ar-SA')} {item.status === 'للإيجار' ? 'ريال/سنة' : 'ريال'}
        </Text>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardLocation} numberOfLines={1}>
          <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
          {' '}{item.location.district ? `${item.location.district}، ` : ''}{item.location.city}
        </Text>
        <View style={styles.cardSpecs}>
          {item.area > 0 && (
            <View style={styles.spec}>
              <Ionicons name="resize-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.specText}>{item.area} م²</Text>
            </View>
          )}
          {item.bedrooms > 0 && (
            <View style={styles.spec}>
              <Ionicons name="bed-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.specText}>{item.bedrooms}</Text>
            </View>
          )}
          {item.bathrooms > 0 && (
            <View style={styles.spec}>
              <Ionicons name="water-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.specText}>{item.bathrooms}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="search-outline" size={64} color="#CBD5E1" />
      </View>
      <Text style={styles.emptyTitle}>
        {properties.length === 0 ? 'لا توجد عقارات' : 'لا توجد عقارات تطابق بحثك'}
      </Text>
      <Text style={styles.emptySub}>
        {properties.length === 0
          ? 'أضف عقاراتك لتتمكن من تصفحها هنا'
          : 'حاول تغيير معايير البحث أو إعادة تعيين الفلاتر'}
      </Text>
      {hasActiveFilters && (
        <TouchableOpacity style={styles.clearBtn} onPress={clearAllFilters}>
          <Ionicons name="refresh" size={18} color="#FFF" />
          <Text style={styles.clearBtnText}>إعادة تعيين الفلاتر</Text>
        </TouchableOpacity>
      )}
      {properties.length === 0 && (
        <TouchableOpacity
          style={[styles.clearBtn, { marginTop: 8, backgroundColor: Colors.primary }]}
          onPress={() => router.push('/add')}
        >
          <Ionicons name="add-circle-outline" size={20} color="#FFF" />
          <Text style={styles.clearBtnText}>أضف عقاراً</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>استكشاف</Text>
        <Text style={styles.headerSub}>تصفح عقاراتك المحفوظة</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={Colors.primary} style={{ marginLeft: 8 }} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="ابحث باسم العقار أو الحي..."
          placeholderTextColor="#94A3B8"
          textAlign="right"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Type Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {FILTER_TYPES.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilterType(f.key)}
            style={[styles.filterPill, filterType === f.key && styles.filterPillActive]}
          >
            <Text style={[styles.filterPillText, filterType === f.key && styles.filterPillTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {FILTER_STATUSES.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilterStatus(f.key)}
            style={[styles.filterPill, filterStatus === f.key && styles.filterPillActive]}
          >
            <Text style={[styles.filterPillText, filterStatus === f.key && styles.filterPillTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* City Filter */}
      {cities.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            onPress={() => setFilterCity('all')}
            style={[styles.filterPill, filterCity === 'all' && styles.filterPillActive]}
          >
            <Text style={[styles.filterPillText, filterCity === 'all' && styles.filterPillTextActive]}>
              كل المدن
            </Text>
          </TouchableOpacity>
          {cities.map((city) => (
            <TouchableOpacity
              key={city}
              onPress={() => setFilterCity(city)}
              style={[styles.filterPill, filterCity === city && styles.filterPillActive]}
            >
              <Text style={[styles.filterPillText, filterCity === city && styles.filterPillTextActive]}>
                {city}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Results count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredProperties.length} عقار
        </Text>
        {hasActiveFilters && (
          <TouchableOpacity onPress={clearAllFilters}>
            <Text style={styles.clearText}>مسح الفلاتر</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => item.id}
        renderItem={renderPropertyCard}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          filteredProperties.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
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
  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 12,
  },
  // Filters
  filterScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  // Results header
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  clearText: {
    fontSize: 13,
    color: Colors.error,
    fontWeight: '600',
  },
  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  // Property Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
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
  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
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
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 14,
  },
  clearBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});
