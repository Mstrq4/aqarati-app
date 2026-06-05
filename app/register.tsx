import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Button, Input } from '../src/components/UI';
import { useApp } from '../src/context/AppContext';

type Role = 'مستخدم' | 'وسيط' | 'مدير مكتب';

const ROLES: { key: Role; icon: string }[] = [
  { key: 'مستخدم', icon: 'person-outline' },
  { key: 'وسيط', icon: 'briefcase-outline' },
  { key: 'مدير مكتب', icon: 'business-outline' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('مستخدم');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'يرجى إدخال الاسم الكامل';
    }

    if (!email.trim()) {
      newErrors.email = 'يرجى إدخال البريد الإلكتروني';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';
    }

    if (!phone.trim()) {
      newErrors.phone = 'يرجى إدخال رقم الهاتف';
    } else if (!/^(05|5)\d{8}$/.test(phone.trim())) {
      newErrors.phone = 'صيغة رقم الهاتف غير صحيحة (05xxxxxxxx)';
    }

    if (!password) {
      newErrors.password = 'يرجى إدخال كلمة المرور';
    } else if (password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون ٦ أحرف على الأقل';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'يرجى تأكيد كلمة المرور';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'كلمتا المرور غير متطابقتين';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('خطأ في إنشاء الحساب', err?.message || 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="home" size={34} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>عقاراتي</Text>
          <Text style={styles.subtitle}>إنشاء حساب جديد</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            placeholder="الاسم الكامل"
            icon="person-outline"
            error={errors.name}
          />

          <Input
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            placeholder="البريد الإلكتروني"
            keyboardType="email-address"
            icon="mail-outline"
            error={errors.email}
          />

          <Input
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
            }}
            placeholder="رقم الهاتف (05xxxxxxxx)"
            keyboardType="phone-pad"
            icon="call-outline"
            error={errors.phone}
          />

          <Input
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            placeholder="كلمة المرور"
            secureTextEntry
            icon="lock-closed-outline"
            error={errors.password}
          />

          <Input
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }}
            placeholder="تأكيد كلمة المرور"
            secureTextEntry
            icon="lock-closed-outline"
            error={errors.confirmPassword}
          />

          {/* Role picker */}
          <Text style={styles.roleLabel}>نوع الحساب</Text>
          <View style={styles.roleRow}>
            {ROLES.map((r) => {
              const isSelected = role === r.key;
              return (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.rolePill, isSelected && styles.rolePillSelected]}
                  onPress={() => setRole(r.key)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={r.icon as any}
                    size={17}
                    color={isSelected ? '#FFFFFF' : Colors.textSecondary}
                  />
                  <Text style={[styles.rolePillText, isSelected && styles.rolePillTextSelected]}>
                    {r.key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Register button */}
          <Button
            title="إنشاء حساب"
            onPress={handleRegister}
            loading={loading}
            size="lg"
            style={styles.registerButton}
          />

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginLabel}>لديك حساب؟</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>تسجيل دخول</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  rolePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  rolePillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rolePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  rolePillTextSelected: {
    color: '#FFFFFF',
  },
  registerButton: {
    marginBottom: 20,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 16,
  },
  loginLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
});
