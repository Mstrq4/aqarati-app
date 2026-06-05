import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../src/context/AppContext';

export default function SubscriptionScreen() {
  const { properties } = useApp();
  const used = properties.length;
  const limit = 25;
  const pct = Math.min((used / limit) * 100, 100);

  return (
    <View style={styles.container}>
      <View style={styles.currentCard}>
        <Text style={styles.planLabel}>باقتك الحالية</Text>
        <Text style={styles.planName}>مجاني</Text>
        <Text style={styles.planPrice}>٠ ر.س / شهرياً</Text>

        <View style={styles.usage}>
          <View style={styles.usageBar}>
            <View style={[styles.usageFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.usageText}>{used} / {limit} عقار</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>ترقية الباقة</Text>

      <TouchableOpacity style={styles.planCard}>
        <View style={styles.planHeader}>
          <View>
            <Text style={styles.cardPlanName}>برو</Text>
            <Text style={styles.cardPlanPrice}>٤٩ ر.س / شهرياً</Text>
          </View>
          <View style={styles.recommended}><Text style={styles.recommendedText}>موصى به</Text></View>
        </View>
        <View style={styles.features}>
          <FeatureItem text="٢٠٠ عقار" />
          <FeatureItem text="ميزات ذكاء اصطناعي" />
          <FeatureItem text="تصدير CSV/XLSX" />
          <FeatureItem text="دعم فني مباشر" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.planCard}>
        <View style={styles.planHeader}>
          <View>
            <Text style={styles.cardPlanName}>مكتب</Text>
            <Text style={styles.cardPlanPrice}>١٤٩ ر.س / شهرياً</Text>
          </View>
        </View>
        <View style={styles.features}>
          <FeatureItem text="عقارات غير محدودة" />
          <FeatureItem text="حتى ٥ أعضاء" />
          <FeatureItem text="صلاحيات وأدوار" />
          <FeatureItem text="كل ميزات برو" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureRow}>
      <Ionicons name="checkmark-circle" size={18} color="#0F766E" />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  currentCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 2, borderColor: '#0F766E' },
  planLabel: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  planName: { fontSize: 28, fontWeight: '800', color: '#0F766E', marginTop: 4 },
  planPrice: { fontSize: 15, color: '#64748B', marginTop: 4 },
  usage: { marginTop: 16 },
  usageBar: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  usageFill: { height: '100%', backgroundColor: '#0F766E', borderRadius: 4 },
  usageText: { fontSize: 12, color: '#64748B', textAlign: 'right', marginTop: 6 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  planCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  cardPlanName: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  cardPlanPrice: { fontSize: 14, color: '#64748B', marginTop: 2 },
  recommended: { backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  recommendedText: { fontSize: 11, fontWeight: '700', color: '#0F766E' },
  features: { gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 14, color: '#1E293B' },
});
