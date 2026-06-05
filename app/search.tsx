import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApp } from '../src/context/AppContext';
import { Colors } from '../src/components/UI';

const TYPE_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  شقة: 'office-building',
  فيلا: 'home-modern',
  أرض: 'terrain',
  محل: 'storefront',
  مكتب: 'office-building',
  مستودع: 'warehouse',
  عمارة: 'office-building',
};

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

  const renderItem = ({ item }: { item: (typeof properties)[0] }) => {
    const hasImage = item.images && item.images.length > 0;
    const statusColor =
      item.status === 'للبيع' ? Colors.primary : item.status === 'للإيجار' ? Colors.secondary : Colors.warning;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/property/${item.id}`)}
        activeOpacity={0.9}
      >
        {/* Image or placeholder */}
        <View style={styles.cardImageContainer}>
          {hasImage ? (
            <Image source={{ uri: item.images[0] }} style={styles.cardImage} />
          ) : (
            <View style={styles.cardImagePlaceholder}>
              <MaterialCommunityIcons
                name={TYPE_ICONS[item.type] || 'home'}
                size={36}
                color={Colors.primaryLight}
              />
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusBadgeText}>{item.status}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardPrice}>
            {item.price.toLocaleString('ar-SA')} {item.status === 'للإيجار' ? 'ر.س/سنة' : 'ر.س'}
          </Text>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardLocation} numberOfLines={1}>
            <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />{' '}
            {item.location.district}، {item.location.city}
          </Text>
          <View style={styles.cardSpecs}>
            <View style={styles.cardSpec}>
              <Ionicons name="resize-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.cardSpecText}>{item.area} م²</Text>
            </View>
            {item.bedrooms > 0 && (
              <View style={styles.cardSpec}>
                <Ionicons name="bed-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.cardSpecText}>{item.bedrooms}</Text>
              </View>
            )}
            <Text style={styles.cardType}>{item.type}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="ابحث في عقاراتك..."
          placeholderTextColor={Colors.textLight}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Type Filters */}
      {propertyTypes.length > 1 && (
        <View style={styles.filters}>
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
        </View>
      )}

      {/* Status Filters */}
      <View style={styles.filters}>
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
      </View>

      {/* Sort Row */}
      <View style={styles.sortRow}>
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
      </View>

      {/* Count */}
      <Text style={styles.resultCount}>
        {filtered.length} عقار
      </Text>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={60} color={Colors.border} />
            <Text style={styles.emptyText}>لا توجد نتائج</Text>
            <Text style={styles.emptySubText}>جرّب تغيير كلمات البحث أو الفلاتر</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 15,
    color: Colors.text,
    textAlign: 'right',
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
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
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 8,
  },
  resultCount: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'right',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImageContainer: {
    height: 140,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cardInfo: {
    padding: 14,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  cardSpecs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cardSpec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cardSpecText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cardType: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  empty: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 4,
  },
});
