import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../src/components/UI';
import { useApp } from '../src/context/AppContext';

interface FeatureItem {
  icon: string;
  iconFamily: 'Ionicons' | 'MaterialIcons';
  text: string;
}

export default function SubscriptionScreen() {
  const { t, colors } = useApp();

  const FEATURES: FeatureItem[] = [
    { icon: 'home-outline', iconFamily: 'Ionicons', text: t('myProperties') },
    { icon: 'people-outline', iconFamily: 'Ionicons', text: t('contacts') },
    { icon: 'alarm-outline', iconFamily: 'Ionicons', text: t('reminders') },
    { icon: 'images-outline', iconFamily: 'Ionicons', text: t('images') },
    { icon: 'cloud-offline-outline', iconFamily: 'Ionicons', text: t('offlineMode') },
    { icon: 'shield-checkmark-outline', iconFamily: 'Ionicons', text: t('dataOnDevice') },
    { icon: 'infinite-outline', iconFamily: 'Ionicons', text: t('unlimited') + ' - ' + t('free') },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Card */}
      <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.primary + '30' }]}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '12' }]}>
          <MaterialIcons name="real-estate-agent" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.appName, { color: colors.text }]}>{t('appName')}</Text>
        <Text style={[styles.editionLabel, { color: colors.textSecondary }]}>{t('free') + ' ' + t('version')}</Text>
        <View style={[styles.freeBadge, { backgroundColor: colors.success + '15', borderColor: colors.success + '30' }]}>
          <Text style={[styles.freeBadgeText, { color: colors.success }]}>{t('free')}</Text>
        </View>
      </View>

      {/* Features */}
      <View style={styles.featuresSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('features')}</Text>
        <View style={[styles.featuresCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {FEATURES.map((feature, index) => (
            <View
              key={feature.text}
              style={[
                styles.featureRow,
                index < FEATURES.length - 1 && [styles.featureRowBorder, { borderBottomColor: colors.border }],
              ]}
            >
              <View style={[styles.featureIcon, { backgroundColor: colors.primary + '10' }]}>
                {feature.iconFamily === 'Ionicons' ? (
                  <Ionicons name={feature.icon as any} size={22} color={colors.primary} />
                ) : (
                  <MaterialIcons name={feature.icon as any} size={22} color={colors.primary} />
                )}
              </View>
              <Text style={[styles.featureText, { color: colors.text }]}>{feature.text}</Text>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            </View>
          ))}
        </View>
      </View>

      {/* Free message */}
      <View style={[styles.messageCard, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '15' }]}>
        <Ionicons name="heart" size={24} color={colors.error} />
        <Text style={[styles.messageTitle, { color: colors.text }]}>{t('appName') + ' - ' + t('free')}</Text>
        <Text style={[styles.messageText, { color: colors.textSecondary }]}>
          {t('appDescription')}
        </Text>
      </View>

      {/* Version */}
      <Text style={[styles.version, { color: colors.textTertiary }]}>
        {t('appName')} v1.0.0 🇸🇦
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary + '30',
    marginBottom: 24,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  editionLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  freeBadge: {
    backgroundColor: Colors.success + '15',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  freeBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.success,
  },
  featuresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    marginRight: 4,
  },
  featuresCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  messageCard: {
    backgroundColor: Colors.primary + '08',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '15',
    marginBottom: 24,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  version: {
    textAlign: 'center',
    color: Colors.textLight,
    fontSize: 12,
  },
});
