import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/components/UI';
import { remindersAPI, propertiesAPI } from '../../src/api';
import type { Reminder, Property } from '../../src/types';

type ReminderType = 'معاينة' | 'دفعة' | 'موعد' | 'أخرى';
type TabType = 'today' | 'upcoming';

const REMINDER_TYPES: { key: ReminderType; label: string; icon: string; color: string }[] = [
  { key: 'معاينة', label: 'معاينة', icon: 'eye-outline', color: '#0F766E' },
  { key: 'دفعة', label: 'دفعة', icon: 'cash-outline', color: '#D4A72C' },
  { key: 'موعد', label: 'موعد', icon: 'calendar-outline', color: '#7C3AED' },
  { key: 'أخرى', label: 'أخرى', icon: 'ellipse-outline', color: '#64748B' },
];

function getReminderTypeInfo(type: ReminderType) {
  return REMINDER_TYPES.find((t) => t.key === type) || REMINDER_TYPES[3];
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const months = [
      'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
    ];
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return `${days[d.getDay()]}، ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

function isToday(dateStr: string): boolean {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  } catch {
    return false;
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
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [modalVisible, setModalVisible] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);

  // Add reminder form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newType, setNewType] = useState<ReminderType>('أخرى');
  const [newPropertyId, setNewPropertyId] = useState<string | undefined>(undefined);
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const [rems, props] = await Promise.all([
        remindersAPI.getAll(),
        propertiesAPI.search({}),
      ]);
      setReminders(rems);
      setProperties(props);
    } catch (e) {
      // silent fail
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const handleToggleComplete = async (reminder: Reminder) => {
    try {
      await remindersAPI.toggle(reminder.id);
      setReminders((prev) =>
        prev.map((r) =>
          r.id === reminder.id ? { ...r, completed: !r.completed } : r
        )
      );
    } catch (e) {
      Alert.alert('خطأ', 'لم نتمكن من تحديث التذكير');
    }
  };

  const handleDelete = (reminder: Reminder) => {
    Alert.alert('حذف التذكير', `هل أنت متأكد من حذف "${reminder.title}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => {
          setReminders((prev) => prev.filter((r) => r.id !== reminder.id));
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
      const added = await remindersAPI.add({
        title: newTitle.trim(),
        description: newDescription.trim(),
        date: newDate || new Date().toISOString().split('T')[0],
        time: newTime || '12:00',
        type: newType,
        propertyId: newPropertyId,
      });
      setReminders((prev) => [added, ...prev]);
      setModalVisible(false);
      resetForm();
    } catch (e) {
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

  const todayReminders = reminders.filter((r) => isToday(r.date) && !r.completed);
  const upcomingReminders = reminders.filter(
    (r) => !r.completed && !isToday(r.date)
  );
  const completedReminders = reminders.filter((r) => r.completed);

  const displayedReminders =
    activeTab === 'today'
      ? todayReminders
      : [...upcomingReminders, ...completedReminders];

  const getPropertyName = (propertyId?: string): string | null => {
    if (!propertyId) return null;
    const prop = properties.find((p) => p.id === propertyId);
    return prop ? prop.title : null;
  };

  const renderReminderCard = ({ item }: { item: Reminder }) => {
    const typeInfo = getReminderTypeInfo(item.type);
    const propertyName = getPropertyName(item.propertyId);
    const past = isPast(item.date, item.time);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onLongPress={() => handleDelete(item)}
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 16,
          padding: 16,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: item.completed ? Colors.border : Colors.border,
          flexDirection: 'row',
          alignItems: 'flex-start',
          opacity: item.completed ? 0.6 : 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 3,
          elevation: 1,
        }}
      >
        {/* Checkbox */}
        <TouchableOpacity
          onPress={() => handleToggleComplete(item)}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: item.completed ? Colors.success : Colors.border,
            backgroundColor: item.completed ? Colors.success : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
            marginTop: 2,
          }}
        >
          {item.completed && <Ionicons name="checkmark" size={18} color="#FFF" />}
        </TouchableOpacity>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: Colors.text,
              textDecorationLine: item.completed ? 'line-through' : 'none',
              marginBottom: 2,
            }}
          >
            {item.title}
          </Text>
          {item.description ? (
            <Text
              style={{
                fontSize: 13,
                color: Colors.textSecondary,
                marginBottom: 6,
                lineHeight: 19,
              }}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          ) : null}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Date & Time */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: past && !item.completed ? '#FEF2F2' : Colors.background,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 8,
                gap: 4,
              }}
            >
              <Ionicons
                name="calendar-outline"
                size={13}
                color={past && !item.completed ? Colors.error : Colors.textSecondary}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: past && !item.completed ? Colors.error : Colors.textSecondary,
                }}
              >
                {formatDate(item.date)}
              </Text>
            </View>
            {item.time ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Colors.background,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 8,
                  gap: 4,
                }}
              >
                <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.textSecondary }}>
                  {item.time}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Type Badge & Property */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: typeInfo.color + '12',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
                gap: 4,
              }}
            >
              <Ionicons name={typeInfo.icon as any} size={14} color={typeInfo.color} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: typeInfo.color }}>
                {typeInfo.label}
              </Text>
            </View>
            {propertyName && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Colors.background,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                  gap: 4,
                  flex: 1,
                }}
              >
                <Ionicons name="home-outline" size={13} color={Colors.primary} />
                <Text
                  style={{ fontSize: 12, color: Colors.primary, fontWeight: '500', flex: 1 }}
                  numberOfLines={1}
                >
                  {propertyName}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Delete hint */}
        <Ionicons name="ellipsis-vertical" size={16} color={Colors.textLight} style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 40 }}>
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: Colors.primary + '10',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <Ionicons name="notifications-off-outline" size={50} color={Colors.primary} />
      </View>
      <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.text, textAlign: 'center' }}>
        لا توجد تذكيرات
      </Text>
      <Text style={{ fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
        {activeTab === 'today'
          ? 'لا توجد تذكيرات لهذا اليوم. استمتع بيومك!'
          : 'أضف تذكيرات للمواعيد المهمة، المعاينات، والدفعات'}
      </Text>
      <TouchableOpacity
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
        style={{
          marginTop: 24,
          paddingHorizontal: 28,
          paddingVertical: 14,
          backgroundColor: Colors.primary,
          borderRadius: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        <Ionicons name="add" size={22} color="#FFF" />
        <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>إضافة تذكير</Text>
      </TouchableOpacity>
    </View>
  );

  const renderShimmer = () => (
    <View>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 16,
            padding: 16,
            marginBottom: 10,
            flexDirection: 'row',
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: '#E2E8F0',
              marginRight: 14,
            }}
          />
          <View style={{ flex: 1 }}>
            <View style={{ height: 18, backgroundColor: '#E2E8F0', borderRadius: 6, marginBottom: 8, width: '70%' }} />
            <View style={{ height: 14, backgroundColor: '#E2E8F0', borderRadius: 6, marginBottom: 8, width: '50%' }} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ height: 24, backgroundColor: '#E2E8F0', borderRadius: 8, width: 100 }} />
              <View style={{ height: 24, backgroundColor: '#E2E8F0', borderRadius: 8, width: 80 }} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8,
        }}
      >
        <View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.text }}>تذكيراتي</Text>
          <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>
            {reminders.filter((r) => !r.completed).length} تذكير نشط
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: Colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.25,
            shadowRadius: 5,
            elevation: 4,
          }}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Segmented Control */}
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 16,
          marginBottom: 16,
          backgroundColor: Colors.surface,
          borderRadius: 14,
          padding: 4,
          borderWidth: 1,
          borderColor: Colors.border,
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('today')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: activeTab === 'today' ? Colors.primary : 'transparent',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '700',
              color: activeTab === 'today' ? '#FFFFFF' : Colors.textSecondary,
            }}
          >
            اليوم ({todayReminders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('upcoming')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: activeTab === 'upcoming' ? Colors.primary : 'transparent',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '700',
              color: activeTab === 'upcoming' ? '#FFFFFF' : Colors.textSecondary,
            }}
          >
            القادمة ({upcomingReminders.length + completedReminders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reminder List */}
      <FlatList
        data={displayedReminders}
        keyExtractor={(item) => item.id}
        renderItem={renderReminderCard}
        ListEmptyComponent={!loading ? renderEmpty : null}
        ListHeaderComponent={loading ? renderShimmer : null}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      />

      {/* Add Reminder Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
          {/* Modal Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: Colors.border,
            }}
          >
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.text }}>إضافة تذكير</Text>
            <TouchableOpacity onPress={handleAddReminder}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.primary }}>حفظ</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            {/* Title */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 6 }}>
              العنوان *
            </Text>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="مثال: معاينة فيلا الياسمين"
              placeholderTextColor={Colors.textLight}
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                color: Colors.text,
                textAlign: 'right',
                borderWidth: 1,
                borderColor: Colors.border,
                marginBottom: 16,
              }}
            />

            {/* Description */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 6 }}>
              الوصف
            </Text>
            <TextInput
              value={newDescription}
              onChangeText={setNewDescription}
              placeholder="تفاصيل إضافية عن التذكير..."
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                color: Colors.text,
                textAlign: 'right',
                borderWidth: 1,
                borderColor: Colors.border,
                marginBottom: 16,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
            />

            {/* Date */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 6 }}>
              التاريخ
            </Text>
            <TextInput
              value={newDate}
              onChangeText={setNewDate}
              placeholder="YYYY-MM-DD (مثال: 2026-06-15)"
              placeholderTextColor={Colors.textLight}
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                color: Colors.text,
                textAlign: 'right',
                borderWidth: 1,
                borderColor: Colors.border,
                marginBottom: 16,
              }}
            />

            {/* Time */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 6 }}>
              الوقت
            </Text>
            <TextInput
              value={newTime}
              onChangeText={setNewTime}
              placeholder="HH:MM (مثال: 17:00)"
              placeholderTextColor={Colors.textLight}
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                color: Colors.text,
                textAlign: 'right',
                borderWidth: 1,
                borderColor: Colors.border,
                marginBottom: 16,
              }}
            />

            {/* Type Selector */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 10 }}>
              نوع التذكير
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {REMINDER_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => setNewType(t.key)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: newType === t.key ? t.color : Colors.surface,
                    borderWidth: 1,
                    borderColor: newType === t.key ? t.color : Colors.border,
                  }}
                >
                  <Ionicons
                    name={t.icon as any}
                    size={16}
                    color={newType === t.key ? '#FFFFFF' : t.color}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: newType === t.key ? '#FFFFFF' : Colors.text,
                    }}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Property Selector */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 10 }}>
              مرتبط بعقار (اختياري)
            </Text>
            {newPropertyId ? (
              <View
                style={{
                  backgroundColor: Colors.primary + '10',
                  borderRadius: 12,
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderWidth: 1,
                  borderColor: Colors.primary + '20',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Ionicons name="home" size={18} color={Colors.primary} />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.primary, flex: 1 }} numberOfLines={1}>
                    {getPropertyName(newPropertyId) || 'عقار محدد'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setNewPropertyId(undefined)}>
                  <Ionicons name="close-circle" size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setShowPropertyPicker(!showPropertyPicker)}
                style={{
                  backgroundColor: Colors.surface,
                  borderRadius: 12,
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: Colors.border,
                }}
              >
                <Ionicons name="add-circle-outline" size={20} color={Colors.textSecondary} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 14, color: Colors.textSecondary, flex: 1, textAlign: 'right' }}>
                  اختر عقاراً...
                </Text>
                <Ionicons name={showPropertyPicker ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textLight} />
              </TouchableOpacity>
            )}

            {showPropertyPicker && (
              <View
                style={{
                  marginTop: 8,
                  backgroundColor: Colors.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  maxHeight: 200,
                  overflow: 'hidden',
                }}
              >
                <FlatList
                  data={properties}
                  keyExtractor={(p) => p.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setNewPropertyId(item.id);
                        setShowPropertyPicker(false);
                      }}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: Colors.border,
                        backgroundColor:
                          newPropertyId === item.id ? Colors.primary + '08' : 'transparent',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: Colors.text,
                          textAlign: 'right',
                        }}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <Text style={{ fontSize: 12, color: Colors.textSecondary, textAlign: 'right', marginTop: 2 }}>
                        {item.location.city} • {item.price.toLocaleString('ar-SA')} ر.س
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
