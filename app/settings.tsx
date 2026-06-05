import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  I18nManager,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing } from '../src/constants/theme';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

interface MenuItem {
  emoji: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

export default function SettingsScreen() {
  const menuItems: MenuItem[] = [
    {
      emoji: '👤',
      label: 'الحساب',
      onPress: () =>
        Alert.alert('👤 الحساب', 'إدارة الحساب قيد التطوير حالياً'),
    },
    {
      emoji: '🔔',
      label: 'الإشعارات',
      onPress: () =>
        Alert.alert('🔔 الإشعارات', 'إعدادات الإشعارات قيد التطوير حالياً'),
    },
    {
      emoji: '🏢',
      label: 'المكاتب',
      onPress: () =>
        Alert.alert('🏢 المكاتب', 'قائمة المكاتب العقارية قيد التطوير حالياً'),
    },
    {
      emoji: '❓',
      label: 'المساعدة',
      onPress: () =>
        Alert.alert(
          '❓ المساعدة',
          'للحصول على المساعدة، يرجى التواصل عبر البريد الإلكتروني:\nhelp@aqarati.app',
        ),
    },
    {
      emoji: '🚪',
      label: 'تسجيل الخروج',
      onPress: () =>
        Alert.alert(
          'تسجيل الخروج',
          'هل أنت متأكد من رغبتك في تسجيل الخروج؟',
          [
            { text: 'إلغاء', style: 'cancel' },
            {
              text: 'تسجيل الخروج',
              style: 'destructive',
              onPress: () => {
                Alert.alert('تم تسجيل الخروج بنجاح ✅');
              },
            },
          ],
        ),
      danger: true,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Section */}
      <TouchableOpacity style={styles.profileSection} activeOpacity={0.8}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>مستخدم عقاراتي</Text>
          <Text style={styles.profileEmail}>user@aqarati.app</Text>
        </View>
        <Text style={styles.profileArrow}>›</Text>
      </TouchableOpacity>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appName}>🏠 عقاراتي</Text>
        <Text style={styles.appVersion}>الإصدار 1.0.0</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              index < menuItems.length - 1 && styles.menuItemBorder,
            ]}
            activeOpacity={0.6}
            onPress={item.onPress}
          >
            <Text style={styles.menuItemEmoji}>{item.emoji}</Text>
            <Text
              style={[
                styles.menuItemLabel,
                item.danger && styles.menuItemDanger,
              ]}
            >
              {item.label}
            </Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <Text style={styles.footer}>جميع الحقوق محفوظة © 2026 عقاراتي</Text>
      <Text style={styles.footerSub}>صنع بحب ❤️ في المملكة العربية السعودية</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 60,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  avatarEmoji: {
    fontSize: 30,
  },
  profileInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'right',
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'right',
  },
  profileArrow: {
    fontSize: 28,
    color: Colors.textMuted,
    marginLeft: Spacing.sm,
    marginRight: Spacing.xs,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginTop: Spacing.sm,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
  },
  appVersion: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
  menuSection: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemEmoji: {
    fontSize: 20,
    marginLeft: Spacing.md,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'right',
  },
  menuItemDanger: {
    color: Colors.error,
  },
  menuItemArrow: {
    fontSize: 24,
    color: Colors.textMuted,
    marginLeft: Spacing.xs,
  },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: Spacing.xl,
  },
  footerSub: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
});
