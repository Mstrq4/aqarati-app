import { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import {
  FloatingActionButton,
  BottomSheet,
  SectionCard,
  Input,
} from '../../src/components/UI';
import type { Reminder } from '../../src/types';

type ReminderType = 'معاينة' | 'دفعة' | 'موعد' | 'أخرى';
type TabType = 'upcoming' | 'completed';

const REMINDER_TYPES: { key: ReminderType; label: string; icon: string; color: string }[] = [
  { key: 'معاينة', label: 'معاينة', icon: 'eye-outline', color: '#0F766E' },
  { key: 'دفعة', label: 'دفعة', icon: 'cash-outline', color: '#D4A72C' },
  { key: 'موعد', label: 'موعد', icon: 'calendar-outline', color: '#7C3AED' },
  { key: 'أخرى', label: 'أخرى', icon: 'ellipse-outline', color: '#64748B' },
];

function getReminderTypeInfo(type: string) {
  return REMINDER_TYPES.find((t) => t.key === type) || REMINDER_TYPES[3];
}

function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const months = [
      'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

function isPast(dateStr: string, timeStr: string): boolean {
  if (!dateStr) return false;
  try {
    const d = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T' + (timeStr || '23:59') + ':00');
    return d.getTime() < Date.now();
  } catch {
    return false;
  }
}

export default function RemindersScreen() {
  const { reminders, addReminder, toggleReminder, deleteReminder, properties, t, colors } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [sheetVisible, setSheetVisible] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newType, setNewType] = useState<ReminderType>('أخرى');
  const [newPropertyId, setNewPropertyId] = useState<string | undefined>(undefined);

  const upcomingReminders = useMemo(
    () => reminders.filter((r) => !r.completed),
    [reminders],
  );
  const completedReminders = useMemo(
    () => reminders.filter((r) => r.completed),
    [reminders],
  );

  const displayedReminders =
    activeTab === 'upcoming' ? upcomingReminders : completedReminders;

  const getPropertyName = (propertyId?: string): string | null => {
    if (!propertyId) return null;
    const prop = properties.find((p) => p.id === propertyId);
    return prop ? prop.title : null;
  };

  const handleToggleComplete = async (reminder: Reminder) => {
    try {
      await toggleReminder(reminder.id);
    } catch {
      Alert.alert(t('error') || 'خطأ', t('tryAgain'));
    }
  };

  const handleDelete = (reminder: Reminder) => {
    Alert.alert(t('delete'), `${t('delete')} "${reminder.title}"؟`, [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReminder(reminder.id);
          } catch {
            Alert.alert(t('error') || 'خطأ', t('tryAgain'));
          }
        },
      },
    ]);
  };

  const handleAddReminder = async () => {
    if (!newTitle.trim()) {
      Alert.alert(t('error') || 'خطأ', t('titleRequired'));
      return;
    }
    try {
      await addReminder({
        title: newTitle.trim(),
        description: newDescription.trim(),
        date: newDate || new Date().toISOString().split('T')[0],
        time: newTime || '12:00',
        type: newType,
        propertyId: newPropertyId,
        completed: false,
      });
      setSheetVisible(false);
      resetForm();
    } catch {
      Alert.alert(t('error') || 'خطأ', t('tryAgain'));
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewDate('');
    setNewTime('');
    setNewType('أخرى');
    setNewPropertyId(undefined);
  };

  const renderReminderCard = ({ item }: { item: Reminder }) => {
    const typeInfo = getReminderTypeInfo(item.type);
    const propertyName = getPropertyName(item.propertyId);
    const past = isPast(item.date, item.time);

    return (
      <SectionCard style={{ marginBottom: 10 }}>
        <TouchableOpacity
          activeOpacity={0.7}
          onLongPress={() => handleDelete(item)}
          style={styles.reminderCardInner}
        >
          <TouchableOpacity
            onPress={() => handleToggleComplete(item)}
            style={[
              styles.checkbox,
              {
                borderColor: item.completed ? colors.success : colors.border,
                backgroundColor: item.completed ? colors.success : 'transparent',
              },
            ]}
          >
            {item.completed && <Ionicons name="checkmark" size={16} color="#FFF" />}
          </TouchableOpacity>

          <View style={styles.reminderContent}>
            <Text
              style={[
                styles.reminderTitle,
                { color: colors.text },
                item.completed && styles.reminderTitleCompleted,
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>

            {item.description ? (
              <Text style={[styles.reminderDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}

            <View style={styles.reminderMeta}>
              <View
                style={[
                  styles.metaPill,
                  { backgroundColor: colors.inputBg },
                  past && !item.completed && [styles.metaPillOverdue, { backgroundColor: colors.error + '12' }],
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={13}
                  color={past && !item.completed ? colors.error : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.metaText,
                    { color: colors.textSecondary },
                    past && !item.completed && { color: colors.error },
                  ]}
                >
                  {formatDateShort(item.date)}
                </Text>
              </View>

              {item.time ? (
                <View style={[styles.metaPill, { backgroundColor: colors.inputBg }]}>
                  <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.time}</Text>
                </View>
              ) : null}

              {past && !item.completed && (
                <View style={[styles.overdueBadge, { backgroundColor: colors.error + '15' }]}>
                  <Text style={[styles.overdueBadgeText, { color: colors.error }]}>{t('overdue')}</Text>
                </View>
              )}
            </View>

            <View style={styles.reminderFooter}>
              <View style={[styles.typeBadge, { backgroundColor: typeInfo.color + '12' }]}>
                <Ionicons name={typeInfo.icon as any} size={14} color={typeInfo.color} />
                <Text style={[styles.typeBadgeText, { color: typeInfo.color }]}>
                  {typeInfo.label}
                </Text>
              </View>

              {propertyName && (
                <View style={styles.propertyLink}>
                  <Ionicons name="home-outline" size={13} color={colors.primary} />
                  <Text style={[styles.propertyLinkText, { color: colors.primary }]} numberOfLines={1}>
                    {propertyName}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Ionicons name="ellipsis-vertical" size={16} color={colors.textTertiary} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </SectionCard>
    );
  };

  const renderEmpty = () => (
    <SectionCard>
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.inputBg }]}>
          <Ionicons name="notifications-off-outline" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('noReminders')}</Text>
        <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
          {activeTab === 'upcoming'
            ? t('reminderDescription')
            : t('completed')}
        </Text>
      </View>
    </SectionCard>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('myReminders')}</Text>
        <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
          {upcomingReminders.length} {t('upcoming')}
        </Text>
      </View>

      <View style={[styles.segmentedControl, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('upcoming')}
          style={[
            styles.segment,
            activeTab === 'upcoming' && [styles.segmentActive, { backgroundColor: colors.primary }],
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              { color: colors.textSecondary },
              activeTab === 'upcoming' && styles.segmentTextActive,
            ]}
          >
            {t('upcoming')} ({upcomingReminders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('completed')}
          style={[
            styles.segment,
            activeTab === 'completed' && [styles.segmentActive, { backgroundColor: colors.primary }],
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              { color: colors.textSecondary },
              activeTab === 'completed' && styles.segmentTextActive,
            ]}
          >
            {t('completed')} ({completedReminders.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedReminders}
        keyExtractor={(item) => item.id}
        renderItem={renderReminderCard}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <FloatingActionButton
        icon="add"
        onPress={() => {
          resetForm();
          setSheetVisible(true);
        }}
      />

      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title={t('addReminder')}
        height={520}
      >
        <View style={styles.sheetForm}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('reminderTitle')} *</Text>
          <Input
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder={t('reminderTitle')}
          />

          <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('reminderDescription')}</Text>
          <Input
            value={newDescription}
            onChangeText={setNewDescription}
            placeholder={t('reminderDescription')}
            multiline
          />

          <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('reminderDate')}</Text>
          <Input
            value={newDate}
            onChangeText={setNewDate}
            placeholder="YYYY-MM-DD"
          />

          <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('reminderTime')}</Text>
          <Input
            value={newTime}
            onChangeText={setNewTime}
            placeholder="HH:MM"
          />

          <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('reminderType')}</Text>
          <View style={styles.typeSelector}>
            {REMINDER_TYPES.map((t2) => (
              <TouchableOpacity
                key={t2.key}
                onPress={() => setNewType(t2.key)}
                style={[
                  styles.typeOption,
                  {
                    backgroundColor: newType === t2.key ? t2.color : colors.surface,
                    borderColor: newType === t2.key ? t2.color : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={t2.icon as any}
                  size={16}
                  color={newType === t2.key ? '#FFFFFF' : t2.color}
                />
                <Text
                  style={[
                    styles.typeOptionText,
                    { color: newType === t2.key ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {t2.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.fieldLabel, { color: colors.text }]}>مرتبط بعقار (اختياري)</Text>
          <View style={styles.propertySelector}>
            {properties.slice(0, 5).map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() =>
                  setNewPropertyId(newPropertyId === p.id ? undefined : p.id)
                }
                style={[
                  styles.propertyOption,
                  { borderColor: colors.border },
                  newPropertyId === p.id && [styles.propertyOptionActive, { backgroundColor: colors.primary }],
                ]}
              >
                <Ionicons
                  name="home-outline"
                  size={16}
                  color={newPropertyId === p.id ? '#FFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.propertyOptionText,
                    { color: colors.textSecondary },
                    newPropertyId === p.id && styles.propertyOptionTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {p.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleAddReminder}>
            <Ionicons name="checkmark" size={20} color="#FFF" />
            <Text style={styles.saveBtnText}>{t('save')}</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 26, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 2 },
  segmentedControl: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, borderRadius: 14, padding: 4, borderWidth: 1 },
  segment: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  segmentActive: {},
  segmentText: { fontSize: 14, fontWeight: '700' },
  segmentTextActive: { color: '#FFFFFF' },
  listContent: { paddingBottom: 100 },
  reminderCardInner: { flexDirection: 'row', alignItems: 'flex-start' },
  checkbox: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 },
  reminderContent: { flex: 1 },
  reminderTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  reminderTitleCompleted: { textDecorationLine: 'line-through', opacity: 0.6 },
  reminderDesc: { fontSize: 13, lineHeight: 20, marginBottom: 8 },
  reminderMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 8 },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  metaPillOverdue: {},
  metaText: { fontSize: 12, fontWeight: '500' },
  overdueBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  overdueBadgeText: { fontSize: 11, fontWeight: '700' },
  reminderFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  typeBadgeText: { fontSize: 11, fontWeight: '600' },
  propertyLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  propertyLinkText: { fontSize: 12, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  sheetForm: {},
  fieldLabel: { fontSize: 14, fontWeight: '700', marginBottom: 6, marginTop: 12, textAlign: 'right' },
  typeSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeOption: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5 },
  typeOptionText: { fontSize: 13, fontWeight: '600' },
  propertySelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  propertyOption: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  propertyOptionActive: {},
  propertyOptionText: { fontSize: 12, fontWeight: '500' },
  propertyOptionTextActive: { color: '#FFF' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, marginTop: 20 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
