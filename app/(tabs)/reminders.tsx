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
  Colors,
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
  const { reminders, addReminder, toggleReminder, deleteReminder, properties } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [sheetVisible, setSheetVisible] = useState(false);

  // Add form state
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
      Alert.alert('خطأ', 'لم نتمكن من تحديث التذكير');
    }
  };

  const handleDelete = (reminder: Reminder) => {
    Alert.alert('حذف التذكير', `هل أنت متأكد من حذف "${reminder.title}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReminder(reminder.id);
          } catch {
            Alert.alert('خطأ', 'لم نتمكن من حذف التذكير');
          }
        },
      },
    ]);
  };

  const handleAddReminder = async () => {
    if (!newTitle.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال عنوان التذكير');
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
      Alert.alert('خطأ', 'لم نتمكن من إضافة التذكير');
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
          {/* Checkbox */}
          <TouchableOpacity
            onPress={() => handleToggleComplete(item)}
            style={[
              styles.checkbox,
              {
                borderColor: item.completed ? Colors.success : Colors.border,
                backgroundColor: item.completed ? Colors.success : 'transparent',
              },
            ]}
          >
            {item.completed && <Ionicons name="checkmark" size={16} color="#FFF" />}
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.reminderContent}>
            <Text
              style={[
                styles.reminderTitle,
                item.completed && styles.reminderTitleCompleted,
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>

            {item.description ? (
              <Text style={styles.reminderDesc} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}

            <View style={styles.reminderMeta}>
              {/* Date & Time */}
              <View
                style={[
                  styles.metaPill,
                  past && !item.completed && styles.metaPillOverdue,
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={13}
                  color={past && !item.completed ? Colors.error : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.metaText,
                    past && !item.completed && styles.metaTextOverdue,
                  ]}
                >
                  {formatDateShort(item.date)}
                </Text>
              </View>

              {item.time ? (
                <View style={styles.metaPill}>
                  <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>{item.time}</Text>
                </View>
              ) : null}

              {/* Past-due badge */}
              {past && !item.completed && (
                <View style={styles.overdueBadge}>
                  <Text style={styles.overdueBadgeText}>متأخر</Text>
                </View>
              )}
            </View>

            {/* Type Badge & Property */}
            <View style={styles.reminderFooter}>
              <View style={[styles.typeBadge, { backgroundColor: typeInfo.color + '12' }]}>
                <Ionicons name={typeInfo.icon as any} size={14} color={typeInfo.color} />
                <Text style={[styles.typeBadgeText, { color: typeInfo.color }]}>
                  {typeInfo.label}
                </Text>
              </View>

              {propertyName && (
                <View style={styles.propertyLink}>
                  <Ionicons name="home-outline" size={13} color={Colors.primary} />
                  <Text style={styles.propertyLinkText} numberOfLines={1}>
                    {propertyName}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* More icon */}
          <Ionicons name="ellipsis-vertical" size={16} color={Colors.textTertiary} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </SectionCard>
    );
  };

  const renderEmpty = () => (
    <SectionCard>
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name="notifications-off-outline" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>لا توجد تذكيرات</Text>
        <Text style={styles.emptySub}>
          {activeTab === 'upcoming'
            ? 'أضف تذكيرات للمواعيد المهمة، المعاينات، والدفعات'
            : 'لا توجد تذكيرات مكتملة بعد'}
        </Text>
      </View>
    </SectionCard>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>تذكيراتي</Text>
        <Text style={styles.headerSub}>
          {upcomingReminders.length} تذكير نشط
        </Text>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          onPress={() => setActiveTab('upcoming')}
          style={[
            styles.segment,
            activeTab === 'upcoming' && styles.segmentActive,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'upcoming' && styles.segmentTextActive,
            ]}
          >
            القادمة ({upcomingReminders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('completed')}
          style={[
            styles.segment,
            activeTab === 'completed' && styles.segmentActive,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'completed' && styles.segmentTextActive,
            ]}
          >
            المكتملة ({completedReminders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reminder List */}
      <FlatList
        data={displayedReminders}
        keyExtractor={(item) => item.id}
        renderItem={renderReminderCard}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        icon="add"
        onPress={() => {
          resetForm();
          setSheetVisible(true);
        }}
      />

      {/* Bottom Sheet for Add Reminder */}
      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title="إضافة تذكير"
        height={520}
      >
        <View style={styles.sheetForm}>
          {/* Title */}
          <Text style={styles.fieldLabel}>العنوان *</Text>
          <Input
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="مثال: معاينة فيلا الياسمين"
          />

          {/* Description */}
          <Text style={styles.fieldLabel}>الوصف</Text>
          <Input
            value={newDescription}
            onChangeText={setNewDescription}
            placeholder="تفاصيل إضافية عن التذكير..."
            multiline
          />

          {/* Date */}
          <Text style={styles.fieldLabel}>التاريخ</Text>
          <Input
            value={newDate}
            onChangeText={setNewDate}
            placeholder="YYYY-MM-DD (مثال: 2026-06-15)"
          />

          {/* Time */}
          <Text style={styles.fieldLabel}>الوقت</Text>
          <Input
            value={newTime}
            onChangeText={setNewTime}
            placeholder="HH:MM (مثال: 17:00)"
          />

          {/* Type Selector */}
          <Text style={styles.fieldLabel}>نوع التذكير</Text>
          <View style={styles.typeSelector}>
            {REMINDER_TYPES.map((t) => (
              <TouchableOpacity
                key={t.key}
                onPress={() => setNewType(t.key)}
                style={[
                  styles.typeOption,
                  {
                    backgroundColor: newType === t.key ? t.color : Colors.surface,
                    borderColor: newType === t.key ? t.color : Colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={t.icon as any}
                  size={16}
                  color={newType === t.key ? '#FFFFFF' : t.color}
                />
                <Text
                  style={[
                    styles.typeOptionText,
                    { color: newType === t.key ? '#FFFFFF' : Colors.text },
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Property Selector */}
          <Text style={styles.fieldLabel}>مرتبط بعقار (اختياري)</Text>
          <View style={styles.propertySelector}>
            {properties.slice(0, 5).map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() =>
                  setNewPropertyId(newPropertyId === p.id ? undefined : p.id)
                }
                style={[
                  styles.propertyOption,
                  newPropertyId === p.id && styles.propertyOptionActive,
                ]}
              >
                <Ionicons
                  name="home-outline"
                  size={16}
                  color={newPropertyId === p.id ? '#FFF' : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.propertyOptionText,
                    newPropertyId === p.id && styles.propertyOptionTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {p.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleAddReminder}>
            <Ionicons name="checkmark" size={20} color="#FFF" />
            <Text style={styles.saveBtnText}>حفظ التذكير</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: Colors.primary,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 100,
  },
  // Reminder Card
  reminderCardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  reminderTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  reminderDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 19,
  },
  reminderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  metaPillOverdue: {
    backgroundColor: '#FEF2F2',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  metaTextOverdue: {
    color: Colors.error,
  },
  overdueBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  overdueBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  reminderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  propertyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    flex: 1,
  },
  propertyLinkText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    flex: 1,
  },
  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  // Bottom Sheet Form
  sheetForm: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
    marginTop: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  propertySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  propertyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  propertyOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  propertyOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    maxWidth: 120,
  },
  propertyOptionTextActive: {
    color: '#FFF',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
