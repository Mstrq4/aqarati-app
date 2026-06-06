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
  Colors,
  SearchBar,
  PropertyCard,
  SectionCard,
} from '../src/components/UI';

type SortKey = 'date' | 'price' | 'area';

export default function SearchScreen() {
  const { properties } = useApp();
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
        <Ionicons name="search-outline" size={60} color={Colors.border} />
        <Text style={styles.emptyText}>لا توجد نتائج</Text>
        <Text style={styles.emptySubText}>جرّب تغيير كلمات البحث أو الفلاتر</Text>
      </View>
    </SectionCard>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar with auto-focus */}
      <View style={styles.searchTop}>
        <SearchBar
          placeholder="ابحث في عقاراتك..."
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      </View>

      {/* Type Filters */}
      {propertyTypes.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          <Text style={styles.filterLabel}>النوع:</Text>
          {propertyTypes.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.filterChip, filterType === t && styles.filterChipActive]}
              onPress={() => setFilterType(filterType === t ? null : t)}
            >
              <Text style={[styles.filterChipText, filterType === t && styles.filterChipTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Status Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        <Text style={styles.filterLabel}>الحالة:</Text>
        {(['للبيع', 'للإيجار'] as const).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.filterChip, filterStatus === s && styles.filterChipActive]}
            onPress={() => setFilterStatus(filterStatus === s ? null : s)}
          >
            <Text style={[styles.filterChipText, filterStatus === s && styles.filterChipTextActive]}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        <Text style={styles.filterLabel}>ترتيب:</Text>
        {(
          [
            ['date', 'الأحدث'],
            ['price', 'الأعلى سعراً'],
            ['area', 'الأكبر مساحة'],
          ] as [SortKey, string][]
        ).map(([k, v]) => (
          <TouchableOpacity
            key={k}
            style={[styles.filterChip, sortBy === k && styles.filterChipActive]}
            onPress={() => setSortBy(k)}
          >
            <Text style={[styles.filterChipText, sortBy === k && styles.filterChipTextActive]}>
              {v}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Count */}
      <Text style={styles.resultCount}>
        {filtered.length} عقار
      </Text>

      {/* List */}
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
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchTop: {
    marginTop: 16,
    marginBottom: 8,
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginRight: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.primary,
  },
  resultCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'right',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  list: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 4,
  },
});
