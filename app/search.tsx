import { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApp } from '../src/context/AppContext';
import type { Property } from '../src/context/AppContext';

const TYPE_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  'شقة': 'office-building', 'فيلا': 'home-modern', 'أرض': 'terrain', 'محل': 'storefront',
};

type SortKey = 'date' | 'price' | 'area';

export default function SearchScreen() {
  const { properties } = useApp();
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterPurpose, setFilterPurpose] = useState<string | null>(null);
  const [filterCity, setFilterCity] = useState('');

  const filtered = useMemo(() => {
    let result = [...properties];
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q) || p.city.toLowerCase().includes(q));
    }
    if (filterType) result = result.filter(p => p.type === filterType);
    if (filterPurpose) result = result.filter(p => p.purpose === filterPurpose);
    if (filterCity.trim()) result = result.filter(p => p.city.includes(filterCity.trim()));

    if (sortBy === 'price') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'area') result.sort((a, b) => b.area - a.area);
    else result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [properties, query, sortBy, filterType, filterPurpose, filterCity]);

  const renderItem = ({ item }: { item: Property }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/property/${item.id}`)}>
      <MaterialCommunityIcons name={TYPE_ICONS[item.type] || 'home'} size={28} color="#0F766E" />
      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardSub}>{item.type} • {item.city}</Text>
      </View>
      <Text style={styles.cardPrice}>{item.price.toLocaleString()} ر.س</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#94A3B8" />
        <TextInput style={styles.searchInput} value={query} onChangeText={setQuery} placeholder="ابحث..." placeholderTextColor="#94A3B8" />
      </View>

      <View style={styles.filters}>
        <Text style={styles.filterLabel}>النوع:</Text>
        {['شقة', 'فيلا', 'أرض', 'محل'].map(t => (
          <TouchableOpacity key={t} style={[styles.filterChip, filterType === t && styles.filterChipActive]} onPress={() => setFilterType(filterType === t ? null : t)}>
            <Text style={[styles.filterChipText, filterType === t && styles.filterChipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sortRow}>
        <Text style={styles.filterLabel}>ترتيب:</Text>
        {([['date', 'الأحدث'], ['price', 'الأعلى سعراً'], ['area', 'الأكبر مساحة']] as [SortKey, string][]).map(([k, v]) => (
          <TouchableOpacity key={k} style={[styles.filterChip, sortBy === k && styles.filterChipActive]} onPress={() => setSortBy(k)}>
            <Text style={[styles.filterChipText, sortBy === k && styles.filterChipTextActive]}>{v}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={60} color="#CBD5E1" />
            <Text style={styles.emptyText}>لا توجد نتائج</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', margin: 16, marginBottom: 8, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', height: 44 },
  searchInput: { flex: 1, marginHorizontal: 10, fontSize: 15, color: '#1E293B', textAlign: 'right' },
  filters: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 6, flexWrap: 'wrap', marginBottom: 4 },
  filterLabel: { fontSize: 13, fontWeight: '700', color: '#64748B', marginLeft: 4 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F1F5F9' },
  filterChipActive: { backgroundColor: '#0F766E15' },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  filterChipTextActive: { color: '#0F766E' },
  sortRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 6, marginBottom: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: 14, marginBottom: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  cardSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  cardPrice: { fontSize: 14, fontWeight: '700', color: '#0F766E' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, color: '#94A3B8', marginTop: 12 },
});
