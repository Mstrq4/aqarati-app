import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../src/components/UI';

interface FeatureItem {
  icon: string;
  iconFamily: 'Ionicons' | 'MaterialIcons';
  text: string;
}

const FEATURES: FeatureItem[] = [
  { icon: 'home-outline', iconFamily: 'Ionicons', text: 'إدارة العقارات' },
  { icon: 'people-outline', iconFamily: 'Ionicons', text: 'جهات الاتصال' },
  { icon: 'alarm-outline', iconFamily: 'Ionicons', text: 'التذكيرات' },
  { icon: 'images-outline', iconFamily: 'Ionicons', text: 'الصور' },
  { icon: 'cloud-offline-outline', iconFamily: 'Ionicons', text: 'بدون إنترنت' },
  { icon: 'shield-checkmark-outline', iconFamily: 'Ionicons', text: 'بياناتك على جهازك فقط' },
  { icon: 'infinite-outline', iconFamily: 'Ionicons', text: 'غير محدود - مجاني للأبد' },
];

export default function SubscriptionScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="real-estate-agent" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.appName}>عقاراتي</Text>
        <Text style={styles.editionLabel}>النسخة المجانية</Text>
        <View style={styles.freeBadge}>
          <Text style={styles.freeBadgeText}>مجاني</Text>
        </View>
      </View>

      {/* Features */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>الميزات المتاحة</Text>
        <View style={styles.featuresCard}>
          {FEATURES.map((feature, index) => (
            <View
              key={feature.text}
              style={[
                styles.featureRow,
                index < FEATURES.length - 1 && styles.featureRowBorder,
              ]}
            >
              <View style={styles.featureIcon}>
                {feature.iconFamily === 'Ionicons' ? (
                  <Ionicons name={feature.icon as any} size={22} color={Colors.primary} />
                ) : (
                  <MaterialIcons name={feature.icon as any} size={22} color={Colors.primary} />
                )}
              </View>
              <Text style={styles.featureText}>{feature.text}</Text>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            </View>
          ))}
        </View>
      </View>

      {/* Free message */}
      <View style={styles.messageCard}>
        <Ionicons name="heart" size={24} color={Colors.error} />
        <Text style={styles.messageTitle}>التطبيق مجاني بالكامل</Text>
        <Text style={styles.messageText}>
          عقاراتي تطبيق شخصي مجاني لإدارة عقاراتك.{'\n'}
          جميع بياناتك مخزنة محلياً على جهازك.{'\n'}
          لا نحتاج إلى إنترنت ولا إلى اشتراك.
        </Text>
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
