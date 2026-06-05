import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

const MENU = [
  { icon: 'person-outline', IconLib: MaterialIcons, label: 'الحساب', color: '#0F766E' },
  { icon: 'notifications-outline', IconLib: Ionicons, label: 'الإشعارات', color: '#D97706' },
  { icon: 'business-outline', IconLib: Ionicons, label: 'المكتب', color: '#7C3AED' },
  { icon: 'card-outline', IconLib: Ionicons, label: 'الباقة', color: '#DC2626' },
  { icon: 'shield-checkmark-outline', IconLib: Ionicons, label: 'الخصوصية والأمان', color: '#059669' },
  { icon: 'help-circle-outline', IconLib: Ionicons, label: 'المساعدة', color: '#2563EB' },
];

export default function AccountScreen() {
  const handlePress = (label: string) => {
    Alert.alert(label, 'هذه الميزة قيد التطوير');
  };

  return (
    <View style={styles.container}>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <MaterialIcons name="person" size={40} color="#FFFFFF" />
        </View>
        <Text style={styles.profileName}>مستخدم عقاراتي</Text>
        <Text style={styles.profileEmail}>مجاني • ٢٥ عقار</Text>
      </View>

      <View style={styles.menu}>
        {MENU.map((item, i) => (
          <TouchableOpacity key={i} style={styles.menuItem} onPress={() => handlePress(item.label)}>
            <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
              <item.IconLib name={item.icon} size={20} color={item.color} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-back" size={18} color="#CBD5E1" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logout} onPress={() => Alert.alert('تسجيل الخروج', 'هل أنت متأكد؟')}>
        <Feather name="log-out" size={18} color="#DC2626" />
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
      </TouchableOpacity>

      <Text style={styles.version}>عقاراتي v1.0.0 🇸🇦</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  profile: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#FFFFFF', marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0F766E', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  profileName: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  profileEmail: { fontSize: 13, color: '#64748B', marginTop: 4 },
  menu: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: '#F8FAFC' },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1E293B' },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, gap: 8 },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#DC2626' },
  version: { textAlign: 'center', color: '#CBD5E1', fontSize: 12, marginTop: 24 },
});
