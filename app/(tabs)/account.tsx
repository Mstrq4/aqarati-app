import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { Colors } from '../../src/components/UI';

export default function AccountScreen() {
  const { userName, setUserName, properties, contacts, reminders } = useApp();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  const activeReminders = reminders.filter((r) => !r.completed).length;

  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return parts[0][0] + parts[1][0];
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = userName || 'مستخدم عقاراتي';

  const handleSaveName = useCallback(async () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      await setUserName(trimmed);
      setEditingName(false);
    }
  }, [nameInput, setUserName]);

  const STATS = [
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
      label: 'التذكيرات النشطة',
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
  ];

  const formatNumber = (n: number): string => {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
        </View>

        {/* Name */}
        {editingName ? (
          <View style={styles.nameEditRow}>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              style={styles.nameInput}
              placeholder="أدخل اسمك"
              placeholderTextColor={Colors.textLight}
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
            <Ionicons name="pencil" size={16} color={Colors.textLight} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        )}

        {/* Phone placeholder */}
        <Text style={styles.displayPhone}>+966 5X XXX XXXX</Text>

        {/* Badge */}
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>مستخدم</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {STATS.map((stat, index) => (
          <View
            key={stat.label}
            style={[
              styles.statItem,
              index < STATS.length - 1 && styles.statItemBorder,
            ]}
          >
            <View style={[styles.statIcon, { backgroundColor: stat.color + '12' }]}>
              <Ionicons name={stat.icon} size={20} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{formatNumber(stat.value)}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <View style={styles.menuCard}>
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
              <Ionicons name="chevron-back" size={18} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

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
  },
  profileHeader: {
    backgroundColor: Colors.surface,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 4,
    borderColor: Colors.primaryLight + '40',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  displayName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  nameEditRow: {
    alignItems: 'center',
    marginBottom: 4,
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
  displayPhone: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 10,
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
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemBorder: {
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  menuSection: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
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
    color: Colors.textLight,
    fontSize: 12,
    marginTop: 20,
  },
});
