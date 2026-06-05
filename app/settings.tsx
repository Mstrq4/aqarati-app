import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../src/components/UI';
import { useApp } from '../src/context/AppContext';

const STORAGE_KEYS = [
  'aqarati_properties',
  'aqarati_contacts',
  'aqarati_reminders',
  'aqarati_user_name',
  'aqarati_seen_onboarding',
];

export default function SettingsScreen() {
  const router = useRouter();
  const { userName, setUserName, properties, contacts, reminders } = useApp();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  const activeReminders = reminders.filter((r) => !r.completed).length;

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      await setUserName(trimmed);
      setEditingName(false);
      Alert.alert('تم الحفظ', 'تم تحديث الاسم بنجاح');
    }
  };

  const handleCancelName = () => {
    setNameInput(userName);
    setEditingName(false);
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'حذف جميع البيانات',
      'هل أنت متأكد من رغبتك في حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف الكل',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(STORAGE_KEYS);
              Alert.alert('تم الحذف', 'تم حذف جميع البيانات. أعد تشغيل التطبيق لتطبيق التغييرات.');
            } catch {
              Alert.alert('خطأ', 'حدث خطأ أثناء حذف البيانات');
            }
          },
        },
      ],
    );
  };

  const handleAboutApp = () => {
    Alert.alert(
      'عن التطبيق',
      'عقاراتي - تطبيق إدارة العقارات الشخصي\n\nنسخة مجانية كاملة بدون إنترنت\n\nيدعم إدارة العقارات وجهات الاتصال والتذكيرات والصور\n\nجميع البيانات مخزنة محلياً على جهازك',
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-forward" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الإعدادات</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* ===== الملف الشخصي ===== */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الملف الشخصي</Text>
        <View style={styles.sectionCard}>
          {editingName ? (
            <View style={styles.editContainer}>
              <View style={styles.editInputRow}>
                <Ionicons name="person-outline" size={20} color={Colors.primary} style={{ marginRight: 8 }} />
                <TextInput
                  value={nameInput}
                  onChangeText={setNameInput}
                  style={styles.editInput}
                  placeholder="أدخل اسمك"
                  placeholderTextColor={Colors.textLight}
                  autoFocus
                />
                <TouchableOpacity onPress={handleSaveName} style={styles.editAction}>
                  <Ionicons name="checkmark" size={20} color={Colors.success} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancelName} style={styles.editAction}>
                  <Ionicons name="close" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setNameInput(userName);
                setEditingName(true);
              }}
              activeOpacity={0.6}
            >
              <View style={styles.menuIconSlot}>
                <Ionicons name="person-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.menuLabelSlot}>
                <Text style={styles.menuLabelSmall}>الاسم</Text>
                <Text style={styles.menuValue}>{userName || '—'}</Text>
              </View>
              <Ionicons name="chevron-back" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ===== الإحصائيات ===== */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الإحصائيات</Text>
        <View style={styles.sectionCard}>
          <View style={styles.statRow}>
            {[
              {
                icon: 'home-outline',
                value: properties.length,
                label: 'عقار',
                color: Colors.primary,
              },
              {
                icon: 'people-outline',
                value: contacts.length,
                label: 'جهة اتصال',
                color: '#7C3AED',
              },
              {
                icon: 'notifications-outline',
                value: activeReminders,
                label: 'تذكير نشط',
                color: '#F59E0B',
              },
            ].map((stat, i) => (
              <View
                key={stat.label}
                style={[
                  styles.statItem,
                  i < 2 && { borderRightWidth: 1, borderRightColor: Colors.border },
                ]}
              >
                <View style={[styles.statIcon, { backgroundColor: stat.color + '12' }]}>
                  <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ===== التطبيق ===== */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>التطبيق</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.menuItem} onPress={handleAboutApp} activeOpacity={0.6}>
            <View style={styles.menuIconSlot}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuLabelSlot}>
              <Text style={styles.menuLabelSmall}>عن التطبيق</Text>
            </View>
            <Ionicons name="chevron-back" size={16} color={Colors.textLight} />
          </TouchableOpacity>

          <View style={[styles.menuItem, { borderBottomWidth: 0 }]}>
            <View style={styles.menuIconSlot}>
              <Ionicons name="phone-portrait-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuLabelSlot}>
              <Text style={styles.menuLabelSmall}>إصدار التطبيق</Text>
              <Text style={styles.menuValue}>عقاراتي v1.0.0</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ===== حذف البيانات ===== */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDeleteAllData}
        activeOpacity={0.7}
      >
        <Feather name="trash-2" size={20} color={Colors.error} />
        <Text style={styles.deleteText}>حذف جميع البيانات</Text>
      </TouchableOpacity>

      <Text style={styles.version}>عقاراتي v1.0.0 🇸🇦</Text>
    </ScrollView>
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
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
    marginRight: 4,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIconSlot: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabelSlot: {
    flex: 1,
  },
  menuLabelSmall: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  menuValue: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  editContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  editInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlign: 'right',
  },
  editAction: {
    padding: 8,
    marginLeft: 4,
  },
  statRow: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.error + '30',
    gap: 8,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.error,
  },
  version: {
    textAlign: 'center',
    color: Colors.textLight,
    fontSize: 12,
    marginTop: 20,
    marginBottom: 40,
  },
});
