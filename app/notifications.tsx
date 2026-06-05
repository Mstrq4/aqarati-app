import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../src/components/UI';
import { useApp } from '../src/context/AppContext';

type FilterMode = 'اليوم' | 'قادمة' | 'الكل';

const REMINDER_TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  معاينة: { icon: 'eye-outline', color: '#0F766E' },
  دفعة: { icon: 'cash-outline', color: '#7C3AED' },
  موعد: { icon: 'calendar-outline', color: '#F59E0B' },
  أخرى: { icon: 'notifications-outline', color: '#64748B' },
};

function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatArabicDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-SA', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { reminders, toggleReminder } = useApp();

  const [filter, setFilter] = useState<FilterMode>('قادمة');

  const todayStr = getTodayStr();

  const filteredReminders = useMemo(() => {
    let list = [...reminders];

    if (filter === 'اليوم') {
      list = list.filter((r) => r.date === todayStr);
    } else if (filter === 'قادمة') {
      list = list.filter((r) => !r.completed && r.date >= todayStr);
    }

    // Sort by date, then time
    list.sort((a, b) => {
      const da = a.date + a.time;
      const db = b.date + b.time;
      return da.localeCompare(db);
    });

    return list;
  }, [reminders, filter, todayStr]);

  const handleToggle = useCallback(
    async (id: string) => {
      await toggleReminder(id);
    },
    [toggleReminder],
  );

  const FILTER_OPTIONS: FilterMode[] = ['اليوم', 'قادمة', 'الكل'];

  const renderItem = ({ item }: { item: (typeof reminders)[0] }) => {
    const typeInfo = REMINDER_TYPE_ICONS[item.type] || REMINDER_TYPE_ICONS['أخرى'];
    const isPast = item.date < todayStr;
    const isToday = item.date === todayStr;

    return (
      <TouchableOpacity
        style={[styles.notifItem, item.completed && styles.notifItemDone]}
        onPress={() => handleToggle(item.id)}
        activeOpacity={0.7}
      >
        {/* Icon */}
        <View
          style={[
            styles.notifIcon,
            { backgroundColor: typeInfo.color + '15' },
            item.completed && { opacity: 0.5 },
          ]}
        >
          <Ionicons
            name={item.completed ? 'checkmark-circle' : (typeInfo.icon as any)}
            size={22}
            color={item.completed ? Colors.success : typeInfo.color}
          />
        </View>

        {/* Content */}
        <View style={styles.notifContent}>
          <View style={styles.notifTitleRow}>
            <Text
              style={[
                styles.notifTitle,
                item.completed && styles.notifTitleDone,
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
          </View>
          {item.description ? (
            <Text style={styles.notifMessage} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          <View style={styles.notifMeta}>
            <View style={styles.notifDateRow}>
              <Ionicons name="calendar-outline" size={13} color={Colors.textLight} />
              <Text style={styles.notifTime}>{formatArabicDate(item.date)}</Text>
            </View>
            {item.time ? (
              <View style={styles.notifDateRow}>
                <Ionicons name="time-outline" size={13} color={Colors.textLight} />
                <Text style={styles.notifTime}>{item.time}</Text>
              </View>
            ) : null}
            {isToday && !item.completed ? (
              <View style={styles.todayBadge}>
                <Text style={styles.todayBadgeText}>اليوم</Text>
              </View>
            ) : null}
            {isPast && !item.completed ? (
              <View style={styles.pastBadge}>
                <Text style={styles.pastBadgeText}>متأخر</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Checkbox */}
        <TouchableOpacity
          onPress={() => handleToggle(item.id)}
          style={[
            styles.checkCircle,
            item.completed && { backgroundColor: Colors.success, borderColor: Colors.success },
          ]}
        >
          {item.completed && (
            <Ionicons name="checkmark" size={16} color="#FFF" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-forward" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>التذكيرات القادمة</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.filterChip, filter === opt && styles.filterChipActive]}
            onPress={() => setFilter(opt)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.filterChipText, filter === opt && styles.filterChipTextActive]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {filteredReminders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="notifications-off-outline" size={64} color={Colors.textLight} />
          </View>
          <Text style={styles.emptyTitle}>لا توجد تذكيرات قادمة</Text>
          <Text style={styles.emptySubtitle}>
            أضف تذكيرات للمواعيد والدفعات والمعاينات
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredReminders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingVertical: 4,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  notifItemDone: {
    backgroundColor: '#F8FAFC',
    opacity: 0.8,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifContent: {
    flex: 1,
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  notifTitleDone: {
    textDecorationLine: 'line-through',
    color: Colors.textLight,
  },
  notifMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 6,
    textAlign: 'right',
  },
  notifMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  notifDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notifTime: {
    fontSize: 12,
    color: Colors.textLight,
  },
  todayBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  pastBadge: {
    backgroundColor: Colors.error + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pastBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.error,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
