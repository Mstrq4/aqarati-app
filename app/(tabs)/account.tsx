import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import {
  Colors,
  Avatar,
  StatsRow,
  SectionCard,
} from '../../src/components/UI';

export default function AccountScreen() {
  const { userName, setUserName, properties, contacts, reminders } = useApp();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  const activeReminders = reminders.filter((r) => !r.completed).length;
  const displayName = userName || 'مستخدم عقاراتي';

  const handleSaveName = useCallback(async () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      await setUserName(trimmed);
      setEditingName(false);
    }
  }, [nameInput, setUserName]);

  const statsItems = [
    {
      icon: 'home-outline' as const,
      value: properties.length,
      label: 'عقاراتي',
      color: Colors.primary,
    },
    {
      icon: 'people-outline' as const,
      value: contacts.length,
      label: 'جهات الاتصال',
      color: '#7C3AED',
    },
    {
      icon: 'alarm-outline' as const,
      value: activeReminders,
      label: 'تذكيرات نشطة',
      color: '#F59E0B',
    },
  ];

  const MENU_ITEMS = [
    {
      icon: 'home-outline' as const,
      label: 'عقاراتي',
      color: Colors.primary,
      onPress: () => router.push('/favorites'),
    },
    {
      icon: 'people-outline' as const,
      label: 'جهات الاتصال',
      color: '#7C3AED',
      onPress: () => router.push('/contacts'),
    },
    {
      icon: 'settings-outline' as const,
      label: 'الإعدادات',
      color: '#64748B',
      onPress: () => router.push('/settings'),
    },
    {
      icon: 'information-circle-outline' as const,
      label: 'عن التطبيق',
      color: Colors.textSecondary,
      onPress: () => {
        Alert.alert('عقاراتي', 'الإصدار 1.0.0\nتطبيق إدارة العقارات الشخصي 🇸🇦');
      },
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Avatar name={displayName} size={88} />
        <View style={styles.profileInfo}>
          {editingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                style={styles.nameInput}
                placeholder="أدخل اسمك"
                placeholderTextColor={Colors.textTertiary}
                autoFocus
                textAlign="center"
              />
              <View style={styles.nameEditActions}>
                <TouchableOpacity onPress={handleSaveName} style={styles.nameActionBtn}>
                  <Ionicons name="checkmark" size={20} color={Colors.success} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setNameInput(userName);
                    setEditingName(false);
                  }}
                  style={styles.nameActionBtn}
                >
                  <Ionicons name="close" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setNameInput(userName);
                setEditingName(true);
              }}
              style={styles.nameRow}
            >
              <Text style={styles.displayName}>{displayName}</Text>
              <Ionicons name="pencil" size={16} color={Colors.textTertiary} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          )}
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>مستخدم</Text>
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <StatsRow items={statsItems} />

      {/* Menu Items */}
      <SectionCard>
        {MENU_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            onPress={item.onPress}
            style={[
              styles.menuItem,
              index < MENU_ITEMS.length - 1 && styles.menuItemBorder,
            ]}
            activeOpacity={0.6}
          >
            <View style={[styles.menuIconSlot, { backgroundColor: item.color + '12' }]}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <Text style={styles.menuItemLabel}>{item.label}</Text>
            <Ionicons name="chevron-back" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </SectionCard>

      {/* Version */}
      <Text style={styles.version}>عقاراتي v1.0.0 🇸🇦</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: 40,
    paddingTop: 16,
  },
  profileSection: {
    backgroundColor: Colors.surface,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  displayName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  nameEditRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
    minWidth: 200,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nameEditActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  nameActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIconSlot: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  version: {
    textAlign: 'center',
    color: Colors.textTertiary,
    fontSize: 12,
    marginTop: 20,
  },
});
