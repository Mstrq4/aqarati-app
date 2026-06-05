// ============ مكونات واجهة المستخدم الموحدة ============
import React from 'react';
import {
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// الألوان الأساسية
export const Colors = {
  primary: '#0F766E',
  primaryLight: '#14B8A6',
  primaryDark: '#0D5E56',
  secondary: '#D4A72C',
  secondaryLight: '#F0D060',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  border: '#E2E8F0',
  error: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  overlay: 'rgba(0,0,0,0.5)',
};

// ============ زر ============
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', size = 'md', loading, disabled, icon, style }: ButtonProps) {
  const bgColors = {
    primary: { bg: Colors.primary, text: '#FFFFFF' },
    secondary: { bg: Colors.secondary, text: '#FFFFFF' },
    outline: { bg: 'transparent', text: Colors.primary },
    ghost: { bg: 'transparent', text: Colors.text },
  };

  const sizes = {
    sm: { h: 40, py: 0, px: 20, fs: 14 },
    md: { h: 50, py: 0, px: 28, fs: 16 },
    lg: { h: 56, py: 0, px: 36, fs: 18 },
  };

  const { bg, text } = bgColors[variant];
  const { h, px, fs } = sizes[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        {
          height: h,
          paddingHorizontal: px,
          backgroundColor: bg,
          borderRadius: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: variant === 'outline' ? Colors.primary : 'transparent',
          opacity: disabled ? 0.5 : 1,
          shadowColor: variant === 'primary' ? Colors.primary : 'transparent',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: variant === 'primary' ? 0.2 : 0,
          shadowRadius: 6,
          elevation: variant === 'primary' ? 4 : 0,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={text} size="small" />
      ) : icon ? (
        <Ionicons name={icon as any} size={fs + 4} color={text} />
      ) : null}
      <Text style={{ color: text, fontSize: fs, fontWeight: '700', fontFamily: 'System' }}>{title}</Text>
    </TouchableOpacity>
  );
}

// ============ حقل إدخال ============
interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  icon?: string;
  error?: string;
  multiline?: boolean;
  style?: ViewStyle;
}

export function Input({ value, onChangeText, placeholder, secureTextEntry, keyboardType, icon, error, multiline, style }: InputProps) {
  const [focused, setFocused] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <View style={[{ marginBottom: 14 }, style]}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: error ? Colors.error : focused ? Colors.primary : Colors.border,
        paddingHorizontal: 14,
        minHeight: multiline ? 120 : 50,
      }}>
        {icon && (
          <Ionicons name={icon as any} size={20} color={focused ? Colors.primary : Colors.textSecondary} style={{ marginRight: 10 }} />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            fontSize: 15,
            color: Colors.text,
            fontFamily: 'System',
            paddingVertical: multiline ? 12 : 0,
            textAlign: 'right',
          }}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={{ color: Colors.error, fontSize: 12, marginTop: 4, textAlign: 'right', marginRight: 4 }}>{error}</Text>
      )}
    </View>
  );
}

// ============ بطاقة عقار ============
export function PropertyCard({ property, onPress }: { property: any; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={propertyStyles.card}>
      {/* صورة العقار */}
      <View style={propertyStyles.imageContainer}>
        <View style={propertyStyles.imagePlaceholder}>
          <Ionicons
            name={property.type === 'فيلا' ? 'home' : property.type === 'شقة' ? 'business' : property.type === 'أرض' ? 'map' : 'briefcase'}
            size={40}
            color={Colors.primaryLight}
          />
        </View>
        {/* وسوم */}
        <View style={propertyStyles.badges}>
          <View style={[propertyStyles.badge, { backgroundColor: property.status === 'للبيع' ? Colors.primary : property.status === 'للإيجار' ? Colors.secondary : Colors.warning }]}>
            <Text style={propertyStyles.badgeText}>{property.status}</Text>
          </View>
          <View style={[propertyStyles.badge, { backgroundColor: Colors.overlay }]}>
            <Ionicons name="heart-outline" size={12} color="#FFF" />
            <Text style={propertyStyles.badgeText}>{property.favorites}</Text>
          </View>
        </View>
      </View>

      {/* معلومات */}
      <View style={propertyStyles.info}>
        <Text style={propertyStyles.price}>
          {property.price.toLocaleString('ar-SA')} {property.status === 'للإيجار' ? 'ريال/سنة' : 'ريال'}
        </Text>
        <Text style={propertyStyles.title} numberOfLines={1}>{property.title}</Text>
        <Text style={propertyStyles.location} numberOfLines={1}>
          <Ionicons name="location-outline" size={13} color={Colors.textSecondary} /> {property.location.district}، {property.location.city}
        </Text>

        {/* مواصفات */}
        <View style={propertyStyles.specs}>
          {property.area > 0 && (
            <View style={propertyStyles.spec}>
              <Ionicons name="resize-outline" size={15} color={Colors.textSecondary} />
              <Text style={propertyStyles.specText}>{property.area} م²</Text>
            </View>
          )}
          {property.bedrooms > 0 && (
            <View style={propertyStyles.spec}>
              <Ionicons name="bed-outline" size={15} color={Colors.textSecondary} />
              <Text style={propertyStyles.specText}>{property.bedrooms}</Text>
            </View>
          )}
          {property.bathrooms > 0 && (
            <View style={propertyStyles.spec}>
              <Ionicons name="water-outline" size={15} color={Colors.textSecondary} />
              <Text style={propertyStyles.specText}>{property.bathrooms}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const propertyStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    height: 180,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badges: {
    position: 'absolute',
    top: 12,
    right: 12,
    left: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  info: {
    padding: 14,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  specs: {
    flexDirection: 'row',
    gap: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});

// ============ قسم بعنوان ============
export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.text }}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.primary }}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
