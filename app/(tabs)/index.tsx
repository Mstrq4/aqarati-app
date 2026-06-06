import { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { PropertyCard, SearchBar, FloatingActionButton } from '../../src/components/UI';
import type { Property } from '../../src/types';

export default function HomeScreen() {
  const { properties, contacts, reminders, userName, t, colors } = useApp();
  const hasProperties = properties.length > 0;
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const activeReminders = useMemo(
    () => reminders.filter((r) => !r.completed).length,
    [reminders]
  );

  const QUICK_ACTIONS = [
    { id: 'buy', icon: 'cash-outline', label: t('buy'), color: colors.primary, filter: 'للبيع' as const },
    { id: 'rent', icon: 'key-outline', label: t('rent'), color: colors.secondary, filter: 'للإيجار' as const },
    { id: 'villa', icon: 'home-outline', label: t('villa'), color: '#7C3AED', filter: 'فيلا' as const },
    { id: 'apt', icon: 'business-outline', label: t('apartment'), color: '#3B82F6', filter: 'شقة' as const },
  ];

  const stats = useMemo(
    () => [
      { icon: 'home-outline', label: t('myProperties'), value: properties.length, color: colors.primary },
      { icon: 'people-outline', label: t('contacts'), value: contacts.length, color: colors.secondary },
      { icon: 'alarm-outline', label: t('reminders'), value: activeReminders, color: '#7C3AED' },
    ],
    [properties.length, contacts.length, activeReminders, t, colors]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 600));
    setRefreshing(false);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSearchPress = () => router.push('/search');

  const renderPropertyCard = ({ item }: { item: Property }) => (
    <PropertyCard
      property={item}
      onPress={() => router.push(`/property/${item.id}`)}
      onFavoritePress={() => toggleFavorite(item.id)}
      isFavorite={favorites.has(item.id)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.inputBg }]}>
        <Ionicons name="home-outline" size={64} color="#CBD5E1" />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('noResults')}</Text>
      <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
        {t('addFirstProperty')}
      </Text>
      <TouchableOpacity
        style={[styles.emptyAddBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
        onPress={() => router.push('/add')}
      >
        <Ionicons name="add-circle-outline" size={22} color="#FFF" />
        <Text style={styles.emptyAddText}>{t('addProperty')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View>
      <SearchBar placeholder={t('searchPlaceholder')} onPress={handleSearchPress} />

      <View style={styles.quickActionsRow}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickAction}
            onPress={() => router.push(`/search?initialFilter=${action.filter}`)}
            activeOpacity={0.7}
          >
            <View style={[styles.quickActionCircle, { backgroundColor: action.color + '12' }]}>
              <Ionicons name={action.icon as any} size={24} color={action.color} />
            </View>
            <Text style={[styles.quickActionLabel, { color: colors.text }]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {hasProperties && (
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('myProperties')}</Text>
            <View style={[styles.countBadge, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.countBadgeText, { color: colors.primary }]}>{properties.length}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/search')}>
            <Text style={[styles.viewAll, { color: colors.primary }]}>{t('viewAll')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: colors.text }]}>
            {userName ? `${t('welcome')} ${userName}` : t('welcome')}
          </Text>
          <TouchableOpacity style={styles.locationSelector} activeOpacity={0.7}>
            <Ionicons name="location-outline" size={16} color={colors.primary} />
            <Text style={[styles.locationText, { color: colors.primary }]}>المملكة العربية السعودية</Text>
            <Ionicons name="chevron-down" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.notifBtn, { backgroundColor: colors.surface }]}
          onPress={() => router.push('/notifications')}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          {activeReminders > 0 && (
            <View style={[styles.notifBadge, { backgroundColor: colors.error, borderColor: colors.surface }]}>
              <Text style={styles.notifBadgeText}>{activeReminders}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {hasProperties ? (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          renderItem={renderPropertyCard}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      ) : (
        <View style={{ flex: 1 }}>
          {renderHeader()}
          {renderEmpty()}
        </View>
      )}

      <FloatingActionButton
        icon="add"
        onPress={() => router.push('/add')}
        color={colors.primary}
        bottom={28}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    paddingHorizontal: 4,
  },
  notifBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  quickActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 16,
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    gap: 8,
  },
  quickActionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyAddText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
