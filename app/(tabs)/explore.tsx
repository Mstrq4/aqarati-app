import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApp } from '../../src/context/AppContext';

export default function ExploreScreen() {
  const { properties } = useApp();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.section} onPress={() => {}}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconCircle, { backgroundColor: '#0F766E15' }]}>
            <Ionicons name="book-outline" size={24} color="#0F766E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>دفتري</Text>
            <Text style={styles.sectionSub}>{properties.length} عقار</Text>
          </View>
          <Ionicons name="chevron-back" size={20} color="#94A3B8" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.section, styles.sectionLocked]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconCircle, { backgroundColor: '#F1F5F9' }]}>
            <MaterialIcons name="business" size={24} color="#94A3B8" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: '#94A3B8' }]}>مكتبي</Text>
            <Text style={styles.sectionSub}>قريباً</Text>
          </View>
          <Ionicons name="lock-closed-outline" size={18} color="#CBD5E1" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.section, styles.sectionLocked]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconCircle, { backgroundColor: '#F1F5F9' }]}>
            <Ionicons name="globe-outline" size={24} color="#94A3B8" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: '#94A3B8' }]}>السوق</Text>
            <Text style={styles.sectionSub}>قريباً - المرحلة الثالثة</Text>
          </View>
          <Ionicons name="lock-closed-outline" size={18} color="#CBD5E1" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  section: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  sectionLocked: { opacity: 0.7 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconCircle: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
  sectionSub: { fontSize: 13, color: '#64748B', marginTop: 2 },
});
