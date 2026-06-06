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
  Avatar,
  StatsRow,
  SectionCard,
} from '../../src/components/UI';

export default function AccountScreen() {
  const { userName, setUserName, properties, contacts, reminders, t, colors } = useApp();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  const activeReminders = reminders.filter((r) => !r.completed).length;
  const displayName = userName || t('appName');

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
      label: t('myProperties'),
      color: colors.primary,
    },
    {
      icon: 'people-outline' as const,
      value: contacts.length,
      label: t('contacts'),
      color: '#7C3AED',
    },
    {
      icon: 'alarm-outline' as const,
      value: activeReminders,
      label: t('reminders'),
      color: '#F59E0B',
    },
  ];

  const MENU_ITEMS = [
    {
      icon: 'home-outline' as const,
      label: t('myProperties'),
      color: colors.primary,
      onPress: () => router.push('/favorites'),
    },
    {
      icon: 'people-outline' as const,
      label: t('contacts'),
      color: '#7C3AED',
      onPress: () => router.push('/contacts'),
    },
    {
      icon: 'settings-outline' as const,
      label: t('settings'),
      color: '#64748B',
      onPress: () => router.push('/settings'),
    },
    {
      icon: 'information-circle-outline' as const,
      label: t('about'),
      color: colors.textSecondary,
      onPress: () => {
        Alert.alert(t('appName'), t('version') + ' 1.0.0\n' + t('appDescription'));
      },
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.profileSection, { backgroundColor: colors.surface }]}>
        <Avatar name={displayName} size={88} />
        <View style={styles.profileInfo}>
          {editingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                style={[styles.nameInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                placeholder={t('userName')}
                placeholderTextColor={colors.placeholder}
                autoFocus
                textAlign="center"
              />
              <View style={styles.nameEditActions}>
                <TouchableOpacity onPress={handleSaveName} style={[styles.nameActionBtn, { backgroundColor: colors.background }]}>
                  <Ionicons name="checkmark" size={20} color={colors.success} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setNameInput(userName);
                    setEditingName(false);
                  }}
                  style={[styles.nameActionBtn, { backgroundColor: colors.background }]}
                >
                  <Ionicons name="close" size={20} color={colors.error} />
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
              <Text style={[styles.displayName, { color: colors.text }]}>{displayName}</Text>
              <Ionicons name="pencil" size={16} color={colors.textTertiary} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          )}
          <View style={[styles.roleBadge, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
            <Text style={[styles.roleBadgeText, { color: colors.primary }]}>مستخدم</Text>
          </View>
        </View>
      </View>

      <StatsRow items={statsItems} />

      <SectionCard>
        {MENU_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            onPress={item.onPress}
            style={[
              styles.menuItem,
              index < MENU_ITEMS.length - 1 && [styles.menuItemBorder, { borderBottomColor: colors.border }],
            ]}
            activeOpacity={0.6}
          >
            <View style={[styles.menuIconSlot, { backgroundColor: item.color + '12' }]}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <Text style={[styles.menuItemLabel, { color: colors.text }]}>{item.label}</Text>
            <Ionicons name="chevron-back" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </SectionCard>

      <Text style={[styles.version, { color: colors.textTertiary }]}>{t('appName')} v1.0.0 🇸🇦</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingBottom: 40, paddingTop: 16 },
  profileSection: {
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
  profileInfo: { alignItems: 'center', marginTop: 14 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  displayName: { fontSize: 22, fontWeight: '800' },
  nameEditRow: { alignItems: 'center', marginBottom: 8 },
  nameInput: {
    fontSize: 20, fontWeight: '700', borderRadius: 10, paddingHorizontal: 16,
    paddingVertical: 6, minWidth: 200, textAlign: 'center', borderWidth: 1,
  },
  nameEditActions: { flexDirection: 'row', gap: 16, marginTop: 8 },
  nameActionBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  roleBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  roleBadgeText: { fontSize: 13, fontWeight: '700' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  menuItemBorder: { borderBottomWidth: 1 },
  menuIconSlot: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuItemLabel: { flex: 1, fontSize: 16, fontWeight: '600' },
  version: { textAlign: 'center', fontSize: 12, marginTop: 20 },
});
