import { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import type { Property } from '../../src/context/AppContext';

const TYPE_ICONS: Record<string, { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }> = {
  'شقة': { icon: 'office-building', label: 'شقة' },
  'فيلا': { icon: 'home-modern', label: 'فيلا' },
  'أرض': { icon: 'terrain', label: 'أرض' },
  'محل': { icon: 'storefront', label: 'محل' },
};

export default function HomeScreen() {
  const { properties } = useApp();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return properties;
    const q = search.toLowerCase();
    return properties.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.district.toLowerCase().includes(q)
    );
  }, [properties, search]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const renderCard = ({ item }: { item: Property }) => {
    const typeInfo = TYPE_ICONS[item.type] || TYPE_ICONS['شقة'];
    const colors = ['#0F766E', '#D97706', '#7C3AED', '#DC2626', '#2563EB', '#059669'];
    const bgColor = colors[parseInt(item.id.slice(-1), 16) % colors.length];

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push(`/property/${item.id}`)}
      >
        <View style={[styles.cardImg, { backgroundColor: bgColor + '20' }]}>
          <MaterialCommunityIcons name={typeInfo.icon} size={40} color={bgColor} />
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <View style={[styles.badge, item.status === 'نشط' ? styles.badgeActive : styles.badgeDraft]}>
              <Text style={styles.badgeText}>{item.status === 'نشط' ? '🟢 نشط' : '📝 مسودة'}</Text>
            </View>
          </View>
          <Text style={styles.cardType}>
            <MaterialCommunityIcons name={typeInfo.icon} size={14} color="#64748B" /> {typeInfo.label} • {item.purpose}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardPrice}>{item.price.toLocaleString()} ر.س</Text>
            <Text style={styles.cardCity}>
              <Ionicons name="location-outline" size={12} color="#94A3B8" /> {item.city} {item.district ? `• ${item.district}` : ''}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.empty}>
      <MaterialCommunityIcons name="home-outline" size={80} color="#CBD5E1" />
      <Text style={styles.emptyTitle}>لا توجد عقارات</Text>
      <Text style={styles.emptySub}>أضف أول عقار الآن وابدأ بتنظيم عروضك</Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/add')}>
        <Ionicons name="add" size={22} color="#FFF" />
        <Text style={styles.emptyBtnText}>أضف عقار</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث في عقاراتك..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderCard}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0F766E']} />}
      />

      {properties.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/add')}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    margin: 16, marginBottom: 8, paddingHorizontal: 14, borderRadius: 14,
    borderWidth: 1, borderColor: '#E2E8F0', height: 48,
  },
  searchInput: { flex: 1, marginHorizontal: 10, fontSize: 15, color: '#1E293B', textAlign: 'right' },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  emptyContainer: { flex: 1 },
  card: {
    flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16,
    padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardImg: { width: 72, height: 72, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardBody: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeActive: { backgroundColor: '#DCFCE7' },
  badgeDraft: { backgroundColor: '#FEF3C7' },
  badgeText: { fontSize: 10, fontWeight: '600' },
  cardType: { fontSize: 13, color: '#64748B', marginBottom: 6 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { fontSize: 16, fontWeight: '700', color: '#0F766E' },
  cardCity: { fontSize: 12, color: '#94A3B8' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginTop: 16 },
  emptySub: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8, marginBottom: 24 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F766E',
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, gap: 8,
  },
  emptyBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 56, height: 56,
    borderRadius: 28, backgroundColor: '#0F766E', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#0F766E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
});
