import { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Linking,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/context/AppContext';
import { Colors, Avatar, FloatingActionButton, BottomSheet, getAvatarColor, getInitials } from '../src/components/UI';
import type { Contact } from '../src/types';

const CONTACT_ROLES = ['مالك', 'مستأجر', 'وسيط', 'محامي', 'مهندس', 'مقاول', 'أخرى'] as const;

const ROLE_COLORS: Record<string, string> = {
  'مالك': '#0F766E',
  'مستأجر': '#7C3AED',
  'وسيط': '#D97706',
  'محامي': '#DC2626',
  'مهندس': '#2563EB',
  'مقاول': '#059669',
  'أخرى': '#64748B',
};

function isValidSaudiPhone(phone: string): boolean {
  return /^(05\d{8}|5\d{8})$/.test(phone.replace(/[\s-]/g, ''));
}

export default function ContactsScreen() {
  const { contacts, addContact, updateContact, deleteContact } = useApp();
  const [search, setSearch] = useState('');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('مالك');
  const [notes, setNotes] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // تصفية جهات الاتصال
  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email && c.email.toLowerCase().includes(q))
    );
  }, [contacts, search]);

  // فتح الشيت
  const openSheet = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setName(contact.name);
      setPhone(contact.phone);
      setEmail(contact.email || '');
      setRole(contact.role);
      setNotes(contact.notes || '');
    } else {
      setEditingContact(null);
      setName('');
      setPhone('');
      setEmail('');
      setRole('مالك');
      setNotes('');
    }
    setPhoneError('');
    setSheetVisible(true);
  };

  const closeSheet = () => {
    setSheetVisible(false);
    setEditingContact(null);
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('خطأ', 'يرجى إدخال الاسم'); return; }
    if (!phone.trim()) { setPhoneError('رقم الهاتف مطلوب'); return; }
    if (!isValidSaudiPhone(phone.trim())) { setPhoneError('يرجى إدخال رقم سعودي صحيح (05xxxxxxxx)'); return; }

    const contactData = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      role,
      notes: notes.trim() || undefined,
    };

    if (editingContact) {
      await updateContact(editingContact.id, contactData);
    } else {
      await addContact(contactData);
    }
    closeSheet();
  };

  const handleCall = (phone: string) => Linking.openURL(`tel:${phone}`);
  const handleWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[\s-]/g, '').replace(/^0/, '966');
    Linking.openURL(`whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(`مرحباً ${name}`)}`);
  };

  const handleDelete = (contact: Contact) => {
    Alert.alert('حذف جهة اتصال', `هل أنت متأكد من حذف "${contact.name}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => deleteContact(contact.id) },
    ]);
  };

  // ============ صف جهة اتصال ============
  const renderContact = ({ item }: { item: Contact }) => {
    const initials = getInitials(item.name);
    const roleColor = ROLE_COLORS[item.role] || ROLE_COLORS['أخرى'];

    return (
      <View style={csStyles.contactCard}>
        <TouchableOpacity
          style={csStyles.contactRow}
          onPress={() => openSheet(item)}
          onLongPress={() => handleDelete(item)}
          activeOpacity={0.7}
        >
          <Avatar name={item.name} size={48} />

          <View style={csStyles.contactInfo}>
            <View style={csStyles.nameRow}>
              <Text style={csStyles.contactName} numberOfLines={1}>{item.name}</Text>
              <View style={[csStyles.roleBadge, { backgroundColor: roleColor + '15' }]}>
                <Text style={[csStyles.roleText, { color: roleColor }]}>{item.role}</Text>
              </View>
            </View>
            <Text style={csStyles.contactPhone}>{item.phone}</Text>
            {item.email ? <Text style={csStyles.contactEmail} numberOfLines={1}>{item.email}</Text> : null}
          </View>

          <View style={csStyles.quickActions}>
            <TouchableOpacity
              onPress={() => handleCall(item.phone)}
              style={[csStyles.quickBtn, { backgroundColor: Colors.success + '12' }]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="call-outline" size={18} color={Colors.success} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleWhatsApp(item.phone, item.name)}
              style={[csStyles.quickBtn, { backgroundColor: Colors.whatsapp + '12' }]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="logo-whatsapp" size={18} color={Colors.whatsapp} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // ============ حالة فارغة ============
  const renderEmpty = () => (
    <View style={csStyles.emptyContainer}>
      <View style={csStyles.emptyIcon}>
        <Ionicons name="people-outline" size={64} color="#CBD5E1" />
      </View>
      <Text style={csStyles.emptyTitle}>لا توجد جهات اتصال</Text>
      <Text style={csStyles.emptySub}>أضف جهات اتصال لربطها بالعقارات وتنظيم أعمالك</Text>
      <TouchableOpacity style={csStyles.emptyAddBtn} onPress={() => openSheet()}>
        <Ionicons name="person-add-outline" size={20} color="#FFF" />
        <Text style={csStyles.emptyAddText}>أضف أول جهة اتصال</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={csStyles.container}>
      {/* الهيدر */}
      <View style={csStyles.header}>
        <View style={{ flex: 1 }}>
          <Text style={csStyles.headerTitle}>جهات الاتصال</Text>
          <Text style={csStyles.headerCount}>
            {contacts.length} {contacts.length === 1 ? 'جهة' : 'جهة'} اتصال
          </Text>
        </View>
      </View>

      {/* شريط البحث الثابت */}
      <View style={csStyles.searchContainer}>
        <View style={csStyles.searchBox}>
          <Ionicons name="search-outline" size={20} color={Colors.textSecondary} style={{ marginLeft: 10 }} />
          <TextInput
            style={csStyles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="ابحث عن جهة اتصال..."
            placeholderTextColor={Colors.textTertiary}
            textAlign="right"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')} style={{ padding: 6 }}>
              <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* قائمة جهات الاتصال */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContact}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          csStyles.listContent,
          filteredContacts.length === 0 && csStyles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {/* زر الإضافة العائم */}
      {contacts.length > 0 && (
        <FloatingActionButton
          icon="person-add"
          onPress={() => openSheet()}
          color={Colors.primary}
          bottom={28}
        />
      )}

      {/* ===== بوتوم شيت الإضافة ===== */}
      <BottomSheet
        visible={sheetVisible}
        onClose={closeSheet}
        title={editingContact ? 'تعديل جهة اتصال' : 'جهة اتصال جديدة'}
        height={520}
      >
        {/* الاسم */}
        <Text style={csStyles.sheetLabel}>الاسم *</Text>
        <View style={csStyles.sheetInput}>
          <Ionicons name="person-outline" size={20} color={Colors.textSecondary} style={{ marginRight: 10 }} />
          <TextInput
            style={csStyles.sheetTextInput}
            value={name}
            onChangeText={setName}
            placeholder="الاسم الكامل"
            placeholderTextColor={Colors.textTertiary}
            textAlign="right"
          />
        </View>

        {/* الهاتف */}
        <Text style={csStyles.sheetLabel}>رقم الهاتف *</Text>
        <View style={[csStyles.sheetInput, phoneError ? { borderColor: Colors.error } : null]}>
          <Ionicons name="call-outline" size={20} color={Colors.textSecondary} style={{ marginRight: 10 }} />
          <TextInput
            style={csStyles.sheetTextInput}
            value={phone}
            onChangeText={(t) => { setPhone(t); setPhoneError(''); }}
            placeholder="05xxxxxxxx"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="phone-pad"
            textAlign="right"
          />
        </View>
        {phoneError ? <Text style={csStyles.errorText}>{phoneError}</Text> : null}

        {/* البريد الإلكتروني */}
        <Text style={csStyles.sheetLabel}>البريد الإلكتروني (اختياري)</Text>
        <View style={csStyles.sheetInput}>
          <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} style={{ marginRight: 10 }} />
          <TextInput
            style={csStyles.sheetTextInput}
            value={email}
            onChangeText={setEmail}
            placeholder="example@domain.com"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="email-address"
            textAlign="right"
          />
        </View>

        {/* الدور */}
        <Text style={csStyles.sheetLabel}>الدور</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {CONTACT_ROLES.map((r) => {
            const active = role === r;
            const rColor = ROLE_COLORS[r];
            return (
              <TouchableOpacity
                key={r}
                onPress={() => setRole(r)}
                style={[csStyles.rolePill, active && { backgroundColor: rColor, borderColor: rColor }]}
              >
                <Text style={[csStyles.rolePillText, active && { color: '#FFF' }]}>{r}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ملاحظات */}
        <Text style={csStyles.sheetLabel}>ملاحظات (اختياري)</Text>
        <View style={[csStyles.sheetInput, { minHeight: 80, alignItems: 'flex-start' }]}>
          <TextInput
            style={[csStyles.sheetTextInput, { minHeight: 60, textAlignVertical: 'top' }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="أضف ملاحظاتك هنا..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            numberOfLines={3}
            textAlign="right"
          />
        </View>

        {/* أزرار الحفظ/الحذف */}
        <View style={{ marginTop: 20, gap: 10 }}>
          <TouchableOpacity style={csStyles.saveSheetBtn} onPress={handleSave} activeOpacity={0.8}>
            <Text style={csStyles.saveSheetBtnText}>{editingContact ? 'حفظ التعديلات' : 'حفظ جهة الاتصال'}</Text>
          </TouchableOpacity>

          {editingContact && (
            <TouchableOpacity
              style={csStyles.deleteSheetBtn}
              onPress={() => {
                closeSheet();
                setTimeout(() => handleDelete(editingContact!), 400);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
              <Text style={csStyles.deleteSheetBtnText}>حذف جهة الاتصال</Text>
            </TouchableOpacity>
          )}
        </View>
      </BottomSheet>
    </View>
  );
}

const csStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  // ============ الهيدر ============
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.text },
  headerCount: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  // ============ البحث ============
  searchContainer: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: Colors.background },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text, marginLeft: 8, textAlign: 'right', marginRight: 8, paddingVertical: 0 },
  // ============ القائمة ============
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  listContentEmpty: { flexGrow: 1, justifyContent: 'center' },
  contactCard: { marginBottom: 10 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactInfo: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  contactName: { fontSize: 16, fontWeight: '700', color: Colors.text, flexShrink: 1 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  roleText: { fontSize: 11, fontWeight: '700' },
  contactPhone: { fontSize: 14, color: Colors.textSecondary },
  contactEmail: { fontSize: 12, color: Colors.textTertiary, marginTop: 1 },
  quickActions: { flexDirection: 'row', gap: 8, marginLeft: 6 },
  quickBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  // ============ حالة فارغة ============
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 40 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  emptyAddBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  emptyAddText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  // ============ بوتوم شيت ============
  sheetLabel: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 6, marginTop: 14, textAlign: 'right' },
  sheetInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, minHeight: 48 },
  sheetTextInput: { flex: 1, fontSize: 15, color: Colors.text, paddingVertical: 10 },
  errorText: { color: Colors.error, fontSize: 12, marginTop: 4, textAlign: 'right', marginRight: 4 },
  rolePill: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12, backgroundColor: '#F1F5F9', borderWidth: 2, borderColor: '#F1F5F9' },
  rolePillText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  saveSheetBtn: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  saveSheetBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  deleteSheetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.error + '10' },
  deleteSheetBtnText: { fontSize: 16, fontWeight: '700', color: Colors.error },
});
