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
  SearchBar,
  PropertyCard,
  SectionCard,
} from '../../src/components/UI';
import type { PropertyType, PropertyStatus } from '../../src/types';

export default function ExploreScreen() {
  const { properties, t, colors } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<PropertyType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<PropertyStatus | 'all'>('all');

  const FILTER_TYPES: { key: PropertyType | 'all'; label: string }[] = [
    { key: 'all', label: t('all') },
    { key: 'فيلا', label: t('propertyTypes.villa') },
    { key: 'شقة', label: t('propertyTypes.apartment') },
    { key: 'أرض', label: t('propertyTypes.land') },
    { key: 'مكتب', label: t('propertyTypes.office') },
  ];

  const FILTER_STATUSES: { key: PropertyStatus | 'all'; label: string }[] = [
    { key: 'all', label: t('all') },
    { key: 'للبيع', label: t('propertyStatus.forSale') },
    { key: 'للإيجار', label: t('propertyStatus.forRent') },
  ];

  const cities = useMemo(() => {
    const citySet = new Set<string>();
    properties.forEach((p) => {
      if (p.location.city) citySet.add(p.location.city);
    });
    return Array.from(citySet);
  }, [properties]);

  const [filterCity, setFilterCity] = useState<string | 'all'>('all');

  const filteredProperties = useMemo(() => {
    let result = [...properties];

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

    if (filterType !== 'all') {
      result = result.filter((p) => p.type === filterType);
    }

    if (filterStatus !== 'all') {
      result = result.filter((p) => p.status === filterStatus);
    }

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
        <View style={[styles.emptyIcon, { backgroundColor: colors.inputBg }]}>
          <Ionicons name="search-outline" size={48} color="#CBD5E1" />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          {properties.length === 0 ? t('noResults') : t('noMatchingProperties')}
        </Text>
        <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
          {properties.length === 0
            ? t('addFirstProperty')
            : t('filterByType')}
        </Text>
        {hasActiveFilters && (
          <TouchableOpacity style={[styles.clearBtn, { backgroundColor: colors.textSecondary }]} onPress={clearAllFilters}>
            <Ionicons name="refresh" size={18} color="#FFF" />
            <Text style={styles.clearBtnText}>{t('clearFilters')}</Text>
          </TouchableOpacity>
        )}
        {properties.length === 0 && (
          <TouchableOpacity
            style={[styles.clearBtn, { marginTop: 8, backgroundColor: colors.primary }]}
            onPress={() => router.push('/add')}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FFF" />
            <Text style={styles.clearBtnText}>{t('addProperty')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SectionCard>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SearchBar
        placeholder={t('searchPlaceholder')}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {FILTER_TYPES.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilterType(f.key)}
            style={[styles.filterPill, { backgroundColor: colors.surface, borderColor: colors.border }, filterType === f.key && [styles.filterPillActive, { backgroundColor: colors.primary, borderColor: colors.primary }]]}
          >
            <Text style={[styles.filterPillText, { color: colors.textSecondary }, filterType === f.key && styles.filterPillTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {FILTER_STATUSES.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilterStatus(f.key)}
            style={[styles.filterPill, { backgroundColor: colors.surface, borderColor: colors.border }, filterStatus === f.key && [styles.filterPillActive, { backgroundColor: colors.primary, borderColor: colors.primary }]]}
          >
            <Text style={[styles.filterPillText, { color: colors.textSecondary }, filterStatus === f.key && styles.filterPillTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {cities.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            onPress={() => setFilterCity('all')}
            style={[styles.filterPill, { backgroundColor: colors.surface, borderColor: colors.border }, filterCity === 'all' && [styles.filterPillActive, { backgroundColor: colors.primary, borderColor: colors.primary }]]}
          >
            <Text style={[styles.filterPillText, { color: colors.textSecondary }, filterCity === 'all' && styles.filterPillTextActive]}>
              {t('all')}
            </Text>
          </TouchableOpacity>
          {cities.map((city) => (
            <TouchableOpacity
              key={city}
              onPress={() => setFilterCity(city)}
              style={[styles.filterPill, { backgroundColor: colors.surface, borderColor: colors.border }, filterCity === city && [styles.filterPillActive, { backgroundColor: colors.primary, borderColor: colors.primary }]]}
            >
              <Text style={[styles.filterPillText, { color: colors.textSecondary }, filterCity === city && styles.filterPillTextActive]}>
                {city}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>{filteredProperties.length} عقار</Text>
        {hasActiveFilters && (
          <TouchableOpacity onPress={clearAllFilters}>
            <Text style={[styles.clearText, { color: colors.error }]}>{t('clearFilters')}</Text>
          </TouchableOpacity>
        )}
      </View>

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
    borderWidth: 1,
  },
  filterPillActive: {},
  filterPillText: {
    fontSize: 13,
    fontWeight: '700',
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
    fontWeight: '500',
  },
  clearText: {
    fontSize: 13,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 22,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
