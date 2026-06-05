import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  I18nManager,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Colors, Spacing } from '../src/constants/theme';
import { properties, Property } from '../src/data/properties';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

function formatPrice(price: number): string {
  return price.toLocaleString('ar-SA') + ' ر.س';
}

function getStatusStyle(status: Property['status']) {
  return status === 'نشط'
    ? { backgroundColor: Colors.success, color: Colors.white }
    : { backgroundColor: Colors.border, color: Colors.textMuted };
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

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredProperties = searchText.trim()
    ? properties.filter(
        (p) =>
          p.title.includes(searchText) ||
          p.city.includes(searchText) ||
          p.district.includes(searchText) ||
          p.type.includes(searchText),
      )
    : properties;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const renderPropertyCard = ({ item }: { item: Property }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <Link href={`/${item.id}`} asChild>
        <TouchableOpacity style={styles.card} activeOpacity={0.8}>
          <View style={[styles.imagePlaceholder, { backgroundColor: item.image }]}>
            <Text style={styles.imageEmoji}>{getTypeEmoji(item.type)}</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.propertyTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                <Text style={[styles.statusText, { color: statusStyle.color }]}>
                  {item.status}
                </Text>
              </View>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.typeLabel}>
                {getTypeEmoji(item.type)} {item.type} · {getPurposeLabel(item.purpose)}
              </Text>
              <Text style={styles.cityLabel}>📍 {item.city}</Text>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.priceText}>{formatPrice(item.price)}</Text>
              <Text style={styles.areaText}>{item.area} م²</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن عقار..."
            placeholderTextColor={Colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            textAlign="right"
          />
        </View>
      </View>

      <FlatList
        data={filteredProperties}
        renderItem={renderPropertyCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🏚️</Text>
            <Text style={styles.emptyText}>لا توجد عقارات مطابقة</Text>
            <Text style={styles.emptySubtext}>جرب البحث بكلمات أخرى</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => router.push('/add')}
      >
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchIcon: {
    fontSize: 18,
    marginLeft: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'right',
    paddingVertical: 0,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageEmoji: {
    fontSize: 48,
  },
  cardContent: {
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  propertyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginLeft: Spacing.sm,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  typeLabel: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  cityLabel: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  areaText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 28,
    color: Colors.white,
    lineHeight: 30,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
