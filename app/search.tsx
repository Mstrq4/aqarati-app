import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApp } from '../src/context/AppContext';
import {
  SearchBar,
  PropertyCard,
  SectionCard,
} from '../src/components/UI';

type SortKey = 'date' | 'price' | 'area';

export default function SearchScreen() {
  const { properties, t, colors } = useApp();
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const propertyTypes = useMemo(() => {
    const types = new Set<string>();
    properties.forEach((p) => types.add(p.type));
    return Array.from(types);
  }, [properties]);

  const filtered = useMemo(() => {
    let result = [...properties];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.city.toLowerCase().includes(q) ||
          p.location.district.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    if (filterType) result = result.filter((p) => p.type === filterType);
    if (filterStatus) result = result.filter((p) => p.status === filterStatus);

    if (sortBy === 'price') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'area') {
      result.sort((a, b) => b.area - a.area);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [properties, query, sortBy, filterType, filterStatus]);

  const renderEmpty = () => (
    <SectionCard>
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={60} color={colors.border} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('noResults')}</Text>
        <Text style={[styles.emptySubText, { color: colors.textTertiary }]}>{t('tryAgain')}</Text>
      </View>
    </SectionCard>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchTop}>
        <SearchBar
          placeholder={t('searchPlaceholder')}
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      </View>

      {propertyTypes.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>{t('type')}:</Text>
          {propertyTypes.map((t2) => (
            <TouchableOpacity
              key={t2}
              style={[styles.filterChip, { backgroundColor: colors.surface, borderColor: colors.border }, filterType === t2 && [styles.filterChipActive, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]]}
              onPress={() => setFilterType(filterType === t2 ? null : t2)}
            >
              <Text style={[styles.filterChipText, { color: colors.textSecondary }, filterType === t2 && { color: colors.primary }]}>
                {t2}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>{t('propertyStatus.forSale')}:</Text>
        {(['للبيع', 'للإيجار'] as const).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.filterChip, { backgroundColor: colors.surface, borderColor: colors.border }, filterStatus === s && [styles.filterChipActive, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]]}
            onPress={() => setFilterStatus(filterStatus === s ? null : s)}
          >
            <Text style={[styles.filterChipText, { color: colors.textSecondary }, filterStatus === s && { color: colors.primary }]}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>{t('sort') || 'ترتيب'}:</Text>
        {(
          [['date', 'الأحدث'], ['price', 'الأعلى سعراً'], ['area', 'الأكبر مساحة']] as [SortKey, string][]
        ).map(([k, v]) => (
          <TouchableOpacity
            key={k}
            style={[styles.filterChip, { backgroundColor: colors.surface, borderColor: colors.border }, sortBy === k && [styles.filterChipActive, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]]}
            onPress={() => setSortBy(k)}
          >
            <Text style={[styles.filterChipText, { color: colors.textSecondary }, sortBy === k && { color: colors.primary }]}>
              {v}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
        {filtered.length} عقار
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => router.push(`/property/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchTop: { marginTop: 16, marginBottom: 8 },
  filters: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 6, marginBottom: 8 },
  filterLabel: { fontSize: 13, fontWeight: '700', marginRight: 4 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  filterChipActive: {},
  filterChipText: { fontSize: 12, fontWeight: '600' },
  resultCount: { fontSize: 13, textAlign: 'right', paddingHorizontal: 16, marginBottom: 6 },
  list: { paddingBottom: 20 },
  emptyContainer: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptySubText: { fontSize: 13, marginTop: 4 },
});
