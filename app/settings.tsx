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
import { Ionicons, Feather } from '@expo/vector-icons';
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
  const { userName, setUserName, properties, contacts, reminders, t, colors } = useApp();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  const activeReminders = reminders.filter((r) => !r.completed).length;

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      await setUserName(trimmed);
      setEditingName(false);
      Alert.alert(t('done'), t('save'));
    }
  };

  const handleCancelName = () => {
    setNameInput(userName);
    setEditingName(false);
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      t('deleteAllData'),
      t('deleteAllDataConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('deleteAllData'),
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(STORAGE_KEYS);
              Alert.alert(t('done'), t('deleteAllData'));
            } catch {
              Alert.alert(t('error') || 'خطأ', t('tryAgain'));
            }
          },
        },
      ],
    );
  };

  const handleAboutApp = () => {
    Alert.alert(
      t('about'),
      t('appDescription'),
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.background }]}>
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('settings')}</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* ===== Profile ===== */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('profile')}</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {editingName ? (
            <View style={[styles.editContainer, { borderBottomColor: colors.border }]}>
              <View style={styles.editInputRow}>
                <Ionicons name="person-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <TextInput
                  value={nameInput}
                  onChangeText={setNameInput}
                  style={[styles.editInput, { color: colors.text, backgroundColor: colors.background }]}
                  placeholder={t('userName')}
                  placeholderTextColor={colors.textTertiary}
                  autoFocus
                />
                <TouchableOpacity onPress={handleSaveName} style={styles.editAction}>
                  <Ionicons name="checkmark" size={20} color={colors.success} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancelName} style={styles.editAction}>
                  <Ionicons name="close" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                setNameInput(userName);
                setEditingName(true);
              }}
              activeOpacity={0.6}
            >
              <View style={[styles.menuIconSlot, { backgroundColor: colors.primary + '10' }]}>
                <Ionicons name="person-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.menuLabelSlot}>
                <Text style={[styles.menuLabelSmall, { color: colors.text }]}>{t('userName')}</Text>
                <Text style={[styles.menuValue, { color: colors.textSecondary }]}>{userName || '—'}</Text>
              </View>
              <Ionicons name="chevron-back" size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ===== Stats ===== */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('details')}</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.statRow}>
            {[
              {
                icon: 'home-outline',
                value: properties.length,
                label: t('myProperties'),
                color: colors.primary,
              },
              {
                icon: 'people-outline',
                value: contacts.length,
                label: t('contacts'),
                color: '#7C3AED',
              },
              {
                icon: 'notifications-outline',
                value: activeReminders,
                label: t('reminders'),
                color: '#F59E0B',
              },
            ].map((stat, i) => (
              <View
                key={stat.label}
                style={[
                  styles.statItem,
                  i < 2 && { borderRightWidth: 1, borderRightColor: colors.border },
                ]}
              >
                <View style={[styles.statIcon, { backgroundColor: stat.color + '12' }]}>
                  <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ===== App ===== */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('appName')}</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={handleAboutApp} activeOpacity={0.6}>
            <View style={[styles.menuIconSlot, { backgroundColor: colors.primary + '10' }]}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.menuLabelSlot}>
              <Text style={[styles.menuLabelSmall, { color: colors.text }]}>{t('about')}</Text>
            </View>
            <Ionicons name="chevron-back" size={16} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <View style={[styles.menuIconSlot, { backgroundColor: colors.primary + '10' }]}>
              <Ionicons name="phone-portrait-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.menuLabelSlot}>
              <Text style={[styles.menuLabelSmall, { color: colors.text }]}>{t('version')}</Text>
              <Text style={[styles.menuValue, { color: colors.textSecondary }]}>{t('appName')} v1.0.0</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ===== Delete Data ===== */}
      <TouchableOpacity
        style={[styles.deleteButton, { backgroundColor: colors.surface, borderColor: colors.error + '30' }]}
        onPress={handleDeleteAllData}
        activeOpacity={0.7}
      >
        <Feather name="trash-2" size={20} color={colors.error} />
        <Text style={[styles.deleteText, { color: colors.error }]}>{t('deleteAllData')}</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: colors.textTertiary }]}>{t('appName')} v1.0.0 🇸🇦</Text>
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
