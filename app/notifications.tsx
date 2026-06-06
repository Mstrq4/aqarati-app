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

type FilterMode = 'today' | 'upcoming' | 'all';

const REMINDER_TYPE_COLORS: Record<string, string> = {
  viewing: '#0F766E',
  payment: '#7C3AED',
  meeting: '#F59E0B',
  other: '#64748B',
};

const REMINDER_TYPE_ICONS: Record<string, string> = {
  viewing: 'eye-outline',
  payment: 'cash-outline',
  meeting: 'calendar-outline',
  other: 'notifications-outline',
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
  const { reminders, toggleReminder, t, colors } = useApp();

  const [filter, setFilter] = useState<FilterMode>('upcoming');

  const todayStr = getTodayStr();

  const FILTER_OPTIONS: { key: FilterMode; label: string }[] = [
    { key: 'today', label: t('today') },
    { key: 'upcoming', label: t('upcoming') },
    { key: 'all', label: t('all') },
  ];

  const filteredReminders = useMemo(() => {
    let list = [...reminders];

    if (filter === 'today') {
      list = list.filter((r) => r.date === todayStr);
    } else if (filter === 'upcoming') {
      list = list.filter((r) => !r.completed && r.date >= todayStr);
    }

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

  // Map Arabic reminder type to key
  const getTypeKey = (type: string): string => {
    const map: Record<string, string> = {
      'معاينة': 'viewing',
      'دفعة': 'payment',
      'موعد': 'meeting',
      'أخرى': 'other',
    };
    return map[type] || 'other';
  };

  const renderItem = ({ item }: { item: (typeof reminders)[0] }) => {
    const typeKey = getTypeKey(item.type);
    const typeColor = REMINDER_TYPE_COLORS[typeKey] || REMINDER_TYPE_COLORS.other;
    const typeIcon = REMINDER_TYPE_ICONS[typeKey] || REMINDER_TYPE_ICONS.other;
    const isPast = item.date < todayStr;
    const isToday = item.date === todayStr;

    return (
      <TouchableOpacity
        style={[
          styles.notifItem,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
          item.completed && { backgroundColor: colors.background, opacity: 0.8 },
        ]}
        onPress={() => handleToggle(item.id)}
        activeOpacity={0.7}
      >
        {/* Icon */}
        <View
          style={[
            styles.notifIcon,
            { backgroundColor: typeColor + '15' },
            item.completed && { opacity: 0.5 },
          ]}
        >
          <Ionicons
            name={item.completed ? 'checkmark-circle' : (typeIcon as any)}
            size={22}
            color={item.completed ? colors.success : typeColor}
          />
        </View>

        {/* Content */}
        <View style={styles.notifContent}>
          <View style={styles.notifTitleRow}>
            <Text
              style={[
                styles.notifTitle,
                { color: colors.text },
                item.completed && [styles.notifTitleDone, { color: colors.textTertiary }],
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
          </View>
          {item.description ? (
            <Text style={[styles.notifMessage, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          <View style={styles.notifMeta}>
            <View style={styles.notifDateRow}>
              <Ionicons name="calendar-outline" size={13} color={colors.textTertiary} />
              <Text style={[styles.notifTime, { color: colors.textTertiary }]}>{formatArabicDate(item.date)}</Text>
            </View>
            {item.time ? (
              <View style={styles.notifDateRow}>
                <Ionicons name="time-outline" size={13} color={colors.textTertiary} />
                <Text style={[styles.notifTime, { color: colors.textTertiary }]}>{item.time}</Text>
              </View>
            ) : null}
            {isToday && !item.completed ? (
              <View style={[styles.todayBadge, { backgroundColor: colors.primary + '15' }]}>
                <Text style={[styles.todayBadgeText, { color: colors.primary }]}>{t('today')}</Text>
              </View>
            ) : null}
            {isPast && !item.completed ? (
              <View style={[styles.pastBadge, { backgroundColor: colors.error + '15' }]}>
                <Text style={[styles.pastBadgeText, { color: colors.error }]}>{t('overdue')}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Checkbox */}
        <TouchableOpacity
          onPress={() => handleToggle(item.id)}
          style={[
            styles.checkCircle,
            { borderColor: colors.border },
            item.completed && { backgroundColor: colors.success, borderColor: colors.success },
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.background }]}>
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('myReminders')}</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Filter Chips */}
      <View style={[styles.filterRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {FILTER_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.filterChip,
              { backgroundColor: colors.background, borderColor: colors.border },
              filter === opt.key && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setFilter(opt.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                { color: colors.textSecondary },
                styles.filterChipText,
                filter === opt.key && { color: '#FFFFFF' },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {filteredReminders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.textTertiary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('noReminders')}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {t('addReminder')}
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
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
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
