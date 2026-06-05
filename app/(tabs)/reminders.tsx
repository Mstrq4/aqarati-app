import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function RemindersScreen() {
  return (
    <View style={styles.container}>
      <Feather name="bell" size={80} color="#CBD5E1" />
      <Text style={styles.title}>لا توجد تذكيرات</Text>
      <Text style={styles.sub}>عند إضافة تذكيرات للعقارات، ستظهر هنا</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', padding: 40 },
  title: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginTop: 16 },
  sub: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8 },
});
