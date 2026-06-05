import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';

const TYPE_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  'شقة': 'office-building', 'فيلا': 'home-modern', 'أرض': 'terrain', 'محل': 'storefront',
};

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { properties, deleteProperty } = useApp();
  const property = properties.find(p => p.id === id);

  if (!property) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={60} color="#CBD5E1" />
        <Text style={styles.errorText}>العقار غير موجود</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert('حذف العقار', 'هل أنت متأكد من حذف هذا العقار؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => { deleteProperty(property.id); router.back(); } },
    ]);
  };

  const colors = ['#0F766E', '#D97706', '#7C3AED', '#DC2626', '#2563EB', '#059669'];
  const bgColor = colors[parseInt(property.id.slice(-1), 16) % colors.length];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.image, { backgroundColor: bgColor + '20' }]}>
        <MaterialCommunityIcons name={TYPE_ICONS[property.type] || 'home'} size={80} color={bgColor} />
        <View style={[styles.statusBadge, property.status === 'نشط' ? styles.activeBadge : styles.draftBadge]}>
          <Text style={styles.statusText}>{property.status}</Text>
        </View>
      </View>

      <Text style={styles.price}>{property.price.toLocaleString()} ر.س</Text>
      <View style={styles.badges}>
        <View style={styles.badge}><Text style={styles.badgeText}>{property.type}</Text></View>
        <View style={styles.badge}><Text style={styles.badgeText}>{property.purpose}</Text></View>
      </View>

      <View style={styles.card}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={18} color="#0F766E" />
          <Text style={styles.detailText}>{property.city}{property.district ? ` - ${property.district}` : ''}</Text>
        </View>

        <View style={styles.grid}>
          {property.area > 0 && <DetailBox icon="resize-outline" label="المساحة" value={`${property.area} م²`} />}
          {property.bedrooms > 0 && <DetailBox icon="bed-outline" label="غرف النوم" value={property.bedrooms.toString()} />}
          {property.bathrooms > 0 && <DetailBox icon="water-outline" label="الحمامات" value={property.bathrooms.toString()} />}
        </View>

        {property.description ? (
          <View style={styles.descSection}>
            <Text style={styles.sectionTitle}>الوصف</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="call-outline" size={20} color="#0F766E" />
          <Text style={styles.actionText}>اتصال</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.shareBtn]}>
          <Ionicons name="share-outline" size={20} color="#0F766E" />
          <Text style={styles.actionText}>مشاركة</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#DC2626" />
          <Text style={[styles.actionText, { color: '#DC2626' }]}>حذف</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function DetailBox({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.detailBox}>
      <Ionicons name={icon} size={20} color="#0F766E" />
      <Text style={styles.detailValue}>{value}</Text>
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingBottom: 30 },
  image: { height: 220, alignItems: 'center', justifyContent: 'center', margin: 16, borderRadius: 20 },
  statusBadge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  activeBadge: { backgroundColor: '#DCFCE7' },
  draftBadge: { backgroundColor: '#FEF3C7' },
  statusText: { fontSize: 13, fontWeight: '700' },
  price: { fontSize: 28, fontWeight: '800', color: '#0F766E', textAlign: 'center', marginBottom: 8 },
  badges: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  badge: { backgroundColor: '#0F766E15', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  badgeText: { color: '#0F766E', fontWeight: '700', fontSize: 13 },
  card: { backgroundColor: '#FFF', marginHorizontal: 16, borderRadius: 20, padding: 20 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  detailText: { fontSize: 16, color: '#1E293B', fontWeight: '600' },
  grid: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginBottom: 16 },
  detailBox: {
    flex: 1, minWidth: 100, backgroundColor: '#F8FAFC', borderRadius: 14,
    padding: 12, alignItems: 'center', gap: 4,
  },
  detailValue: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  detailLabel: { fontSize: 11, color: '#94A3B8' },
  descSection: { borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  description: { fontSize: 14, color: '#64748B', lineHeight: 22 },
  actions: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', paddingVertical: 14, borderRadius: 14, gap: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  shareBtn: { backgroundColor: '#0F766E15', borderColor: '#0F766E30' },
  deleteBtn: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  actionText: { fontSize: 14, fontWeight: '700', color: '#0F766E' },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
  errorText: { fontSize: 18, color: '#94A3B8', marginTop: 12 },
});
