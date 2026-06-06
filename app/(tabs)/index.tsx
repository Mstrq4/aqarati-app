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
import { Colors, PropertyCard, SearchBar, FloatingActionButton } from '../../src/components/UI';
import type { Property } from '../../src/types';

// ============ بيانات الإجراءات السريعة ============
const QUICK_ACTIONS = [
  { id: 'buy', icon: 'cash-outline', label: 'بيع', color: Colors.primary, filter: 'للبيع' as const },
  { id: 'rent', icon: 'key-outline', label: 'إيجار', color: Colors.secondary, filter: 'للإيجار' as const },
  { id: 'villa', icon: 'home-outline', label: 'فلل', color: '#7C3AED', filter: 'فيلا' as const },
  { id: 'apt', icon: 'business-outline', label: 'شقق', color: '#3B82F6', filter: 'شقة' as const },
];

export default function HomeScreen() {
  const { properties, contacts, reminders, userName } = useApp();
  const hasProperties = properties.length > 0;
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const activeReminders = useMemo(
    () => reminders.filter((r) => !r.completed).length,
    [reminders]
  );

  const stats = useMemo(
    () => [
      { icon: 'home-outline', label: 'عقار', value: properties.length, color: Colors.primary },
      { icon: 'people-outline', label: 'جهة اتصال', value: contacts.length, color: Colors.secondary },
      { icon: 'alarm-outline', label: 'تذكير نشط', value: activeReminders, color: '#7C3AED' },
    ],
    [properties.length, contacts.length, activeReminders]
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

  const handleQuickAction = (filter: string, item: string) => {
    router.push(`/search?initialFilter=${item}`);
  };

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
      <View style={styles.emptyIcon}>
        <Ionicons name="home-outline" size={64} color="#CBD5E1" />
      </View>
      <Text style={styles.emptyTitle}>لا توجد عقارات بعد</Text>
      <Text style={styles.emptySub}>
        أضف عقارك الأول لتبدأ في إدارة ممتلكاتك{'\n'}بكل سهولة واحترافية
      </Text>
      <TouchableOpacity
        style={styles.emptyAddBtn}
        onPress={() => router.push('/add')}
      >
        <Ionicons name="add-circle-outline" size={22} color="#FFF" />
        <Text style={styles.emptyAddText}>أضف عقارك الأول</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View>
      {/* شريط البحث */}
      <SearchBar placeholder="ابحث عن عقار..." onPress={handleSearchPress} />

      {/* الإجراءات السريعة */}
      <View style={styles.quickActionsRow}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickAction}
            onPress={() => handleQuickAction(action.id, action.filter)}
            activeOpacity={0.7}
          >
            <View style={[styles.quickActionCircle, { backgroundColor: action.color + '12' }]}>
              <Ionicons name={action.icon as any} size={24} color={action.color} />
            </View>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* عنوان القسم */}
      {hasProperties && (
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.sectionTitle}>عقاراتي</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{properties.length}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/search')}>
            <Text style={styles.viewAll}>عرض الكل</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* الهيدر */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>
            {userName ? `مرحباً ${userName}` : 'مرحباً بك'}
          </Text>
          <TouchableOpacity style={styles.locationSelector} activeOpacity={0.7}>
            <Ionicons name="location-outline" size={16} color={Colors.primary} />
            <Text style={styles.locationText}>المملكة العربية السعودية</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => router.push('/notifications')}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={24} color={Colors.text} />
          {activeReminders > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{activeReminders}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* قائمة العقارات */}
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
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        />
      ) : (
        <View style={{ flex: 1 }}>
          {renderHeader()}
          {renderEmpty()}
        </View>
      )}

      {/* زر الإضافة العائم */}
      <FloatingActionButton
        icon="add"
        onPress={() => router.push('/add')}
        color={Colors.primary}
        bottom={28}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // ============ الهيدر ============
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
    color: Colors.text,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
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
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
    paddingHorizontal: 4,
  },
  notifBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  // ============ الإجراءات السريعة ============
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
    color: Colors.text,
  },
  // ============ عنوان القسم ============
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
    color: Colors.text,
  },
  countBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  // ============ قائمة العقارات ============
  listContent: {
    paddingBottom: 100,
  },
  // ============ حالة فارغة ============
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
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: Colors.primary,
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
