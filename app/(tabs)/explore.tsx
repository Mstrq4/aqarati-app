import { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import {
  Colors,
  SearchBar,
  PropertyCard,
  SectionCard,
} from '../../src/components/UI';
import type { PropertyType, PropertyStatus } from '../../src/types';

const FILTER_TYPES: { key: PropertyType | 'all'; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'فيلا', label: 'فلل' },
  { key: 'شقة', label: 'شقق' },
  { key: 'أرض', label: 'أراضي' },
  { key: 'مكتب', label: 'مكاتب' },
];

const FILTER_STATUSES: { key: PropertyStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'للبيع', label: 'للبيع' },
  { key: 'للإيجار', label: 'للإيجار' },
];

export default function ExploreScreen() {
  const { properties } = useApp();
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

  const hasActiveFilters =
    filterType !== 'all' || filterStatus !== 'all' || filterCity !== 'all' || searchQuery.trim() !== '';

  const clearAllFilters = () => {
    setFilterType('all');
    setFilterStatus('all');
    setFilterCity('all');
    setSearchQuery('');
  };

  const renderEmpty = () => (
    <SectionCard>
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name="search-outline" size={48} color="#CBD5E1" />
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
    </SectionCard>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <SearchBar
        placeholder="ابحث باسم العقار أو الحي..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

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
        <Text style={styles.resultsCount}>{filteredProperties.length} عقار</Text>
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
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => router.push(`/property/${item.id}`)}
          />
        )}
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
    paddingTop: 16,
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  listContent: {
    paddingHorizontal: 0,
    paddingBottom: 40,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 22,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.textSecondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  clearBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
