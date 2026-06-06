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

// Role keys (stored in data) vs display keys
const ROLE_KEYS = ['contactRoles.owner', 'contactRoles.tenant', 'contactRoles.agent', 'contactRoles.lawyer', 'contactRoles.engineer', 'contactRoles.contractor', 'contactRoles.other'] as const;

const ROLE_AR_MAP: Record<string, string> = {
  'مالك': 'contactRoles.owner',
  'مستأجر': 'contactRoles.tenant',
  'وسيط': 'contactRoles.agent',
  'محامي': 'contactRoles.lawyer',
  'مهندس': 'contactRoles.engineer',
  'مقاول': 'contactRoles.contractor',
  'أخرى': 'contactRoles.other',
};

const ROLE_COLORS: Record<string, string> = {
  'contactRoles.owner': '#0F766E',
  'contactRoles.tenant': '#7C3AED',
  'contactRoles.agent': '#D97706',
  'contactRoles.lawyer': '#DC2626',
  'contactRoles.engineer': '#2563EB',
  'contactRoles.contractor': '#059669',
  'contactRoles.other': '#64748B',
};

// For reverse lookup: key → Arabic
const ROLE_KEY_TO_AR: Record<string, string> = {
  'contactRoles.owner': 'مالك',
  'contactRoles.tenant': 'مستأجر',
  'contactRoles.agent': 'وسيط',
  'contactRoles.lawyer': 'محامي',
  'contactRoles.engineer': 'مهندس',
  'contactRoles.contractor': 'مقاول',
  'contactRoles.other': 'أخرى',
};

function isValidSaudiPhone(phone: string): boolean {
  return /^(05\d{8}|5\d{8})$/.test(phone.replace(/[\s-]/g, ''));
}

export default function ContactsScreen() {
  const { contacts, addContact, updateContact, deleteContact, t, colors } = useApp();
  const [search, setSearch] = useState('');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [roleKey, setRoleKey] = useState<string>('contactRoles.owner');
  const [notes, setNotes] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Filter contacts
  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email && c.email.toLowerCase().includes(q))
    );
  }, [contacts, search]);

  // Open sheet
  const openSheet = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setName(contact.name);
      setPhone(contact.phone);
      setEmail(contact.email || '');
      setRoleKey(ROLE_AR_MAP[contact.role] || 'contactRoles.other');
      setNotes(contact.notes || '');
    } else {
      setEditingContact(null);
      setName('');
      setPhone('');
      setEmail('');
      setRoleKey('contactRoles.owner');
      setNotes('');
    }
    setPhoneError('');
    setSheetVisible(true);
  };

  const closeSheet = () => {
    setSheetVisible(false);
    setEditingContact(null);
  };

  // Get display role from stored Arabic or key
  const displayRole = (contact: Contact): string => {
    const key = ROLE_AR_MAP[contact.role];
    if (key) return t(key as any);
    return contact.role;
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert(t('error') || 'خطأ', t('nameRequired')); return; }
    if (!phone.trim()) { setPhoneError(t('phoneRequired')); return; }
    if (!isValidSaudiPhone(phone.trim())) { setPhoneError(t('invalidPhone')); return; }

    const contactData = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      role: ROLE_KEY_TO_AR[roleKey] || roleKey,
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
    Linking.openURL(`whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(`${t('welcome')} ${name}`)}`);
  };

  const handleDelete = (contact: Contact) => {
    Alert.alert(
      t('delete') + ' ' + t('contacts'),
      `${t('deleteAllDataConfirm').split('؟')[0]} "${contact.name}"؟`,
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), style: 'destructive', onPress: () => deleteContact(contact.id) },
      ]
    );
  };

  // ============ Contact Row ============
  const renderContact = ({ item }: { item: Contact }) => {
    const initials = getInitials(item.name);
    const roleDisp = displayRole(item);
    const roleKeyItem = ROLE_AR_MAP[item.role] || 'contactRoles.other';
    const roleColor = ROLE_COLORS[roleKeyItem] || ROLE_COLORS['contactRoles.other'];

    return (
      <View style={[csStyles.contactCard]}>
        <TouchableOpacity
          style={[csStyles.contactRow, { backgroundColor: colors.surface }]}
          onPress={() => openSheet(item)}
          onLongPress={() => handleDelete(item)}
          activeOpacity={0.7}
        >
          <Avatar name={item.name} size={48} />

          <View style={csStyles.contactInfo}>
            <View style={csStyles.nameRow}>
              <Text style={[csStyles.contactName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
              <View style={[csStyles.roleBadge, { backgroundColor: roleColor + '15' }]}>
                <Text style={[csStyles.roleText, { color: roleColor }]}>{roleDisp}</Text>
              </View>
            </View>
            <Text style={[csStyles.contactPhone, { color: colors.textSecondary }]}>{item.phone}</Text>
            {item.email ? <Text style={[csStyles.contactEmail, { color: colors.textTertiary }]} numberOfLines={1}>{item.email}</Text> : null}
          </View>

          <View style={csStyles.quickActions}>
            <TouchableOpacity
              onPress={() => handleCall(item.phone)}
              style={[csStyles.quickBtn, { backgroundColor: colors.success + '12' }]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="call-outline" size={18} color={colors.success} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleWhatsApp(item.phone, item.name)}
              style={[csStyles.quickBtn, { backgroundColor: '#25D36612' }]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // ============ Empty State ============
  const renderEmpty = () => (
    <View style={csStyles.emptyContainer}>
      <View style={csStyles.emptyIcon}>
        <Ionicons name="people-outline" size={64} color={colors.textTertiary} />
      </View>
      <Text style={[csStyles.emptyTitle, { color: colors.text }]}>{t('noContacts')}</Text>
      <Text style={[csStyles.emptySub, { color: colors.textSecondary }]}>{t('dataOnDevice')}</Text>
      <TouchableOpacity style={csStyles.emptyAddBtn} onPress={() => openSheet()}>
        <Ionicons name="person-add-outline" size={20} color="#FFF" />
        <Text style={csStyles.emptyAddText}>{t('addContact')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[csStyles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={csStyles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[csStyles.headerTitle, { color: colors.text }]}>{t('contacts')}</Text>
          <Text style={[csStyles.headerCount, { color: colors.textSecondary }]}>
            {contacts.length} {t('contacts')}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[csStyles.searchContainer, { backgroundColor: colors.background }]}>
        <View style={[csStyles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={{ marginLeft: 10 }} />
          <TextInput
            style={[csStyles.searchInput, { color: colors.text }]}
            value={search}
            onChangeText={setSearch}
            placeholder={t('search')}
            placeholderTextColor={colors.textTertiary}
            textAlign="right"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')} style={{ padding: 6 }}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Contact List */}
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

      {/* FAB */}
      {contacts.length > 0 && (
        <FloatingActionButton
          icon="person-add"
          onPress={() => openSheet()}
          color={colors.primary}
          bottom={28}
        />
      )}

      {/* ===== Bottom Sheet ===== */}
      <BottomSheet
        visible={sheetVisible}
        onClose={closeSheet}
        title={editingContact ? t('edit') + ' ' + t('contacts') : t('addContact')}
        height={520}
      >
        {/* Name */}
        <Text style={[csStyles.sheetLabel, { color: colors.text }]}>{t('contactName')} *</Text>
        <View style={[csStyles.sheetInput, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
          <TextInput
            style={[csStyles.sheetTextInput, { color: colors.text }]}
            value={name}
            onChangeText={setName}
            placeholder={t('contactName')}
            placeholderTextColor={colors.textTertiary}
            textAlign="right"
          />
        </View>

        {/* Phone */}
        <Text style={[csStyles.sheetLabel, { color: colors.text }]}>{t('contactPhone')} *</Text>
        <View style={[csStyles.sheetInput, { backgroundColor: colors.background, borderColor: phoneError ? colors.error : colors.border }]}>
          <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
          <TextInput
            style={[csStyles.sheetTextInput, { color: colors.text }]}
            value={phone}
            onChangeText={(text) => { setPhone(text); setPhoneError(''); }}
            placeholder="05xxxxxxxx"
            placeholderTextColor={colors.textTertiary}
            keyboardType="phone-pad"
            textAlign="right"
          />
        </View>
        {phoneError ? <Text style={[csStyles.errorText, { color: colors.error }]}>{phoneError}</Text> : null}

        {/* Email */}
        <Text style={[csStyles.sheetLabel, { color: colors.text }]}>{t('contactEmail')} ({t('cancel')})</Text>
        <View style={[csStyles.sheetInput, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
          <TextInput
            style={[csStyles.sheetTextInput, { color: colors.text }]}
            value={email}
            onChangeText={setEmail}
            placeholder="example@domain.com"
            placeholderTextColor={colors.textTertiary}
            keyboardType="email-address"
            textAlign="right"
          />
        </View>

        {/* Role */}
        <Text style={[csStyles.sheetLabel, { color: colors.text }]}>{t('contactRole')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {ROLE_KEYS.map((rk) => {
            const active = roleKey === rk;
            const rColor = ROLE_COLORS[rk];
            return (
              <TouchableOpacity
                key={rk}
                onPress={() => setRoleKey(rk)}
                style={[
                  csStyles.rolePill,
                  { backgroundColor: '#F1F5F9', borderColor: '#F1F5F9' },
                  active && { backgroundColor: rColor, borderColor: rColor },
                ]}
              >
                <Text style={[csStyles.rolePillText, { color: colors.textSecondary }, active && { color: '#FFF' }]}>
                  {t(rk as any)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Notes */}
        <Text style={[csStyles.sheetLabel, { color: colors.text }]}>{t('contactNotes')} ({t('cancel')})</Text>
        <View style={[csStyles.sheetInput, { backgroundColor: colors.background, borderColor: colors.border, minHeight: 80, alignItems: 'flex-start' }]}>
          <TextInput
            style={[csStyles.sheetTextInput, { color: colors.text, minHeight: 60, textAlignVertical: 'top' }]}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('contactNotes')}
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
            textAlign="right"
          />
        </View>

        {/* Save / Delete buttons */}
        <View style={{ marginTop: 20, gap: 10 }}>
          <TouchableOpacity style={[csStyles.saveSheetBtn, { backgroundColor: colors.primary }]} onPress={handleSave} activeOpacity={0.8}>
            <Text style={csStyles.saveSheetBtnText}>{t('save')}</Text>
          </TouchableOpacity>

          {editingContact && (
            <TouchableOpacity
              style={[csStyles.deleteSheetBtn, { backgroundColor: colors.error + '10' }]}
              onPress={() => {
                closeSheet();
                setTimeout(() => handleDelete(editingContact!), 400);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={18} color={colors.error} />
              <Text style={[csStyles.deleteSheetBtnText, { color: colors.error }]}>{t('delete')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </BottomSheet>
    </View>
  );
}

const csStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  // ============ Header ============
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.text },
  headerCount: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  // ============ Search ============
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
  // ============ List ============
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
  // ============ Empty ============
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 40 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  emptyAddBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  emptyAddText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  // ============ Bottom Sheet ============
  sheetLabel: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 6, marginTop: 14, textAlign: 'right' },
  sheetInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, minHeight: 48 },
  sheetTextInput: { flex: 1, fontSize: 15, color: Colors.text, paddingVertical: 10 },
  errorText: { color: Colors.error, fontSize: 12, marginTop: 4, textAlign: 'right', marginRight: 4 },
  rolePill: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12 },
  rolePillText: { fontSize: 14, fontWeight: '600' },
  saveSheetBtn: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  saveSheetBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  deleteSheetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 14 },
  deleteSheetBtnText: { fontSize: 16, fontWeight: '700' },
});
