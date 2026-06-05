import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function OfficeScreen() {
  return (
    <View style={styles.container}>
      <MaterialIcons name="business" size={80} color="#CBD5E1" />
      <Text style={styles.title}>لم تنشئ مكتباً بعد</Text>
      <Text style={styles.sub}>أنشئ مكتباً وادعُ فريقك للعمل معاً</Text>
      <TouchableOpacity style={styles.btn}>
        <MaterialIcons name="add-business" size={20} color="#FFF" />
        <Text style={styles.btnText}>إنشاء مكتب</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>الميزة قيد التطوير - المرحلة الثانية</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', padding: 40 },
  title: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginTop: 16 },
  sub: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8, marginBottom: 24 },
  btn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7C3AED', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, gap: 8 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  hint: { fontSize: 12, color: '#CBD5E1', marginTop: 16 },
});
