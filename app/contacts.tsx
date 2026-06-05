import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Linking,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/context/AppContext';
import { Colors, Input } from '../src/components/UI';
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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0);
  return parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
}

function isValidSaudiPhone(phone: string): boolean {
  return /^(05\d{8}|5\d{8})$/.test(phone.replace(/[\s-]/g, ''));
}

export default function ContactsScreen() {
  const { contacts, addContact, updateContact, deleteContact } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('مالك');
  const [notes, setNotes] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const openModal = (contact?: Contact) => {
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
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingContact(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال الاسم');
      return;
    }
    if (!phone.trim()) {
      setPhoneError('رقم الهاتف مطلوب');
      return;
    }
    if (!isValidSaudiPhone(phone.trim())) {
      setPhoneError('يرجى إدخال رقم سعودي صحيح (05xxxxxxxx)');
      return;
    }

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
    closeModal();
  };

  const handleDelete = (contact: Contact) => {
    Alert.alert(
      'حذف جهة اتصال',
      `هل أنت متأكد من حذف "${contact.name}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => deleteContact(contact.id),
        },
      ]
    );
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[\s-]/g, '').replace(/^0/, '966');
    Linking.openURL(
      `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(`مرحباً ${name}`)}`
    );
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const renderContact = ({ item }: { item: Contact }) => {
    const initials = getInitials(item.name);
    const roleColor = ROLE_COLORS[item.role] || ROLE_COLORS['أخرى'];

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => handleDelete(item)}
        style={styles.contactCard}
      >
        <View style={styles.contactRow}>
          {/* Avatar */}
          <View style={[styles.avatar, { backgroundColor: roleColor + '18' }]}>
            <Text style={[styles.avatarText, { color: roleColor }]}>{initials}</Text>
          </View>

          {/* Info */}
          <View style={styles.contactInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.contactName} numberOfLines={1}>{item.name}</Text>
              <View style={[styles.roleBadge, { backgroundColor: roleColor + '15' }]}>
                <Text style={[styles.roleText, { color: roleColor }]}>{item.role}</Text>
              </View>
            </View>
            <Text style={styles.contactPhone}>{item.phone}</Text>
            {item.email ? (
              <Text style={styles.contactEmail}>{item.email}</Text>
            ) : null}
          </View>

          {/* Actions */}
          <View style={styles.actionsColumn}>
            <TouchableOpacity
              onPress={() => handleCall(item.phone)}
              style={[styles.actionBtn, { backgroundColor: Colors.success + '15' }]}
            >
              <Ionicons name="call-outline" size={18} color={Colors.success} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleWhatsApp(item.phone, item.name)}
              style={[styles.actionBtn, { backgroundColor: '#25D36615' }]}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom row with edit */}
        <TouchableOpacity
          onPress={() => openModal(item)}
          style={styles.editRow}
        >
          <Ionicons name="create-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.editText}>تعديل</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="people-outline" size={64} color="#CBD5E1" />
      </View>
      <Text style={styles.emptyTitle}>لا توجد جهات اتصال</Text>
      <Text style={styles.emptySub}>
        أضف جهات اتصال لربطها بالعقارات وتنظيم أعمالك
      </Text>
      <TouchableOpacity style={styles.addFirstBtn} onPress={() => openModal()}>
        <Ionicons name="person-add-outline" size={20} color="#FFF" />
        <Text style={styles.addFirstText}>أضف أول جهة اتصال</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>جهات الاتصال</Text>
          <Text style={styles.headerCount}>
            {contacts.length} {contacts.length === 1 ? 'جهة' : contacts.length <= 10 ? 'جهات' : 'جهة'} اتصال
          </Text>
        </View>
        <TouchableOpacity style={styles.headerAddBtn} onPress={() => openModal()}>
          <Ionicons name="add" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Contact List */}
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContact}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          contacts.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingContact ? 'تعديل جهة اتصال' : 'جهة اتصال جديدة'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.modalSave}>حفظ</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.modalBodyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Name */}
            <Text style={styles.fieldLabel}>الاسم *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="الاسم الكامل"
                placeholderTextColor="#94A3B8"
                textAlign="right"
              />
            </View>

            {/* Phone */}
            <Text style={styles.fieldLabel}>رقم الهاتف *</Text>
            <View style={[styles.inputWrapper, phoneError ? styles.inputError : null]}>
              <Ionicons name="call-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={(t) => { setPhone(t); setPhoneError(''); }}
                placeholder="05xxxxxxxx"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                textAlign="right"
              />
            </View>
            {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

            {/* Email */}
            <Text style={styles.fieldLabel}>البريد الإلكتروني (اختياري)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="example@domain.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                textAlign="right"
              />
            </View>

            {/* Role Picker */}
            <Text style={styles.fieldLabel}>الدور</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rolesScroll}
            >
              {CONTACT_ROLES.map((r) => {
                const isActive = role === r;
                const rColor = ROLE_COLORS[r];
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRole(r)}
                    style={[
                      styles.rolePill,
                      isActive && { backgroundColor: rColor, borderColor: rColor },
                    ]}
                  >
                    <Text style={[styles.rolePillText, isActive && { color: '#FFF' }]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Notes */}
            <Text style={styles.fieldLabel}>ملاحظات (اختياري)</Text>
            <View style={[styles.inputWrapper, styles.textareaWrapper]}>
              <TextInput
                style={[styles.textInput, styles.textarea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="أضف ملاحظاتك هنا..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                textAlign="right"
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  headerCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerAddBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  contactCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  contactInfo: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    flexShrink: 1,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  contactPhone: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: 12,
    color: Colors.textLight,
  },
  actionsColumn: {
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  editText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  addFirstBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  addFirstText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    padding: 20,
    paddingBottom: 60,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'right',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
    marginRight: 4,
  },
  textareaWrapper: {
    minHeight: 100,
    alignItems: 'flex-start',
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  // Roles
  rolesScroll: {
    gap: 8,
    paddingRight: 4,
  },
  rolePill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  rolePillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
});
