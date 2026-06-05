import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../src/components/UI';
import { useApp } from '../src/context/AppContext';

const TARGET_ROLES = ['وسيط', 'مكتب'];

const ROLE_COLORS: Record<string, string> = {
  وسيط: '#7C3AED',
  مكتب: '#0F766E',
};

export default function OfficeScreen() {
  const router = useRouter();
  const { contacts } = useApp();

  const officeContacts = useMemo(
    () => contacts.filter((c) => TARGET_ROLES.includes(c.role)),
    [contacts],
  );

  const handleCall = (phone: string) => {
    if (!phone) {
      Alert.alert('خطأ', 'رقم الهاتف غير متوفر');
      return;
    }
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`).catch(() =>
      Alert.alert('خطأ', 'تعذر فتح تطبيق الاتصال'),
    );
  };

  const handleWhatsApp = (phone: string, name: string) => {
    if (!phone) {
      Alert.alert('خطأ', 'رقم الهاتف غير متوفر');
      return;
    }
    const cleanPhone = phone.replace(/[\s+]/g, '');
    const msg = encodeURIComponent(`السلام عليكم ${name}،`);
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${msg}`).catch(() =>
      Alert.alert('خطأ', 'تعذر فتح واتساب'),
    );
  };

  const renderItem = ({ item }: { item: (typeof contacts)[0] }) => {
    const roleColor = ROLE_COLORS[item.role] || Colors.primary;

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: roleColor + '15' }]}>
            <MaterialIcons name="person" size={28} color={roleColor} />
          </View>
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.cardName}>{item.name}</Text>
            <View style={[styles.roleBadge, { backgroundColor: roleColor + '15' }]}>
              <Text style={[styles.roleBadgeText, { color: roleColor }]}>{item.role}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.callBtn, { backgroundColor: Colors.success + '15' }]}
            onPress={() => handleCall(item.phone)}
          >
            <Ionicons name="call" size={20} color={Colors.success} />
          </TouchableOpacity>
        </View>

        {/* Details */}
        <View style={styles.cardDetails}>
          {item.phone ? (
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText} dir="ltr">{item.phone}</Text>
            </View>
          ) : null}
          {item.email ? (
            <View style={styles.detailRow}>
              <Ionicons name="mail-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText} dir="ltr">{item.email}</Text>
            </View>
          ) : null}
          {item.notes ? (
            <View style={styles.detailRow}>
              <Ionicons name="document-text-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{item.notes}</Text>
            </View>
          ) : null}
        </View>

        {/* Actions */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.success }]}
            onPress={() => handleCall(item.phone)}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={18} color="#FFF" />
            <Text style={styles.actionBtnText}>اتصال</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#25D366' }]}
            onPress={() => handleWhatsApp(item.phone, item.name)}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#FFF" />
            <Text style={styles.actionBtnText}>واتساب</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-forward" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>المكاتب والوسطاء</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Content */}
      {officeContacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <MaterialIcons name="business" size={64} color={Colors.textLight} />
          </View>
          <Text style={styles.emptyTitle}>لم تقم بإضافة وسطاء</Text>
          <Text style={styles.emptySubtitle}>
            أضف جهات اتصال من نوع وسيط أو مكتب لتظهر هنا
          </Text>
        </View>
      ) : (
        <FlatList
          data={officeContacts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
