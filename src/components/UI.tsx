// ============ مكونات واجهة المستخدم الموحدة - Mobbin Design System ============
import React, { useRef, useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
  Image,
  Modal,
  Animated,
  Pressable,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// تمكين LayoutAnimation على أندرويد
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============ الألوان ============
export const Colors = {
  primary: '#0F766E',
  primaryLight: '#14B8A6',
  primaryDark: '#0D5E56',
  secondary: '#D4A72C',
  secondaryLight: '#F0D060',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  cardBg: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  error: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  overlay: 'rgba(0,0,0,0.5)',
  whatsapp: '#25D366',
};

// ============ ظلال موحدة ============
export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};

// ============ توليد لون للأفاتار بناءً على الحرف الأول ============
const AVATAR_COLORS: string[] = [
  '#0F766E', '#D4A72C', '#7C3AED', '#EF4444', '#3B82F6',
  '#F59E0B', '#EC4899', '#06B6D4', '#8B5CF6', '#10B981',
  '#F97316', '#6366F1', '#14B8A6', '#E11D48', '#1D4ED8',
];

export function getAvatarColor(letter: string): string {
  const code = letter.toUpperCase().charCodeAt(0) || 65;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0);
  return parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
}

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
      style={[{
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
      }, style]}
    >
      {loading ? (
        <ActivityIndicator color={text} size="small" />
      ) : icon ? (
        <Ionicons name={icon as any} size={fs + 4} color={text} />
      ) : null}
      <Text style={{ color: text, fontSize: fs, fontWeight: '700' }}>{title}</Text>
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
          placeholderTextColor={Colors.textTertiary}
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
      {error && <Text style={{ color: Colors.error, fontSize: 12, marginTop: 4, textAlign: 'right', marginRight: 4 }}>{error}</Text>}
    </View>
  );
}

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

// ============ بطاقة عقار - نمط Zillow/Bayut/عقار ============
interface PropertyCardProps {
  property: any;
  onPress: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
}

export function PropertyCard({ property, onPress, onFavoritePress, isFavorite }: PropertyCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const hasImage = property.images && property.images.length > 0;
  const imageSource = hasImage ? { uri: property.images[0] } : null;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
        style={[pStyles.card, Shadows.card]}
      >
        {/* صورة العقار - 75% من ارتفاع البطاقة */}
        <View style={pStyles.imageContainer}>
          {imageSource ? (
            <Image source={imageSource} style={pStyles.image} resizeMode="cover" />
          ) : (
            <View style={pStyles.imagePlaceholder}>
              <Ionicons
                name={property.type === 'فيلا' ? 'home' : property.type === 'شقة' ? 'business' : property.type === 'أرض' ? 'map' : 'briefcase'}
                size={40}
                color={Colors.primaryLight}
              />
            </View>
          )}

          {/* شريط السعر في أسفل يسار الصورة */}
          <View style={pStyles.priceOverlay}>
            <Text style={pStyles.priceOverlayText}>
              {property.price.toLocaleString('ar-SA')} {property.status === 'للإيجار' ? 'ر.س/سنة' : 'ر.س'}
            </Text>
          </View>

          {/* وسام الحالة في أعلى اليسار */}
          <View style={[pStyles.statusBadge, {
            backgroundColor: property.status === 'للبيع' ? Colors.primary : property.status === 'للإيجار' ? Colors.secondary : Colors.warning,
          }]}>
            <Text style={pStyles.statusBadgeText}>{property.status}</Text>
          </View>

          {/* زر المفضلة في أعلى اليمين */}
          <TouchableOpacity
            style={pStyles.favoriteBtn}
            onPress={(e) => { e.stopPropagation(); onFavoritePress?.(); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? Colors.error : Colors.text}
            />
          </TouchableOpacity>

          {/* عدد الصور */}
          {hasImage && (property.images?.length || 0) > 1 && (
            <View style={pStyles.imageCountBadge}>
              <Ionicons name="images-outline" size={11} color="#FFF" />
              <Text style={pStyles.imageCountText}>{property.images.length}</Text>
            </View>
          )}
        </View>

        {/* معلومات العقار */}
        <View style={pStyles.infoContainer}>
          <Text style={pStyles.title} numberOfLines={1}>{property.title}</Text>
          <View style={pStyles.locationRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={pStyles.location} numberOfLines={1}>
              {property.location.district ? `${property.location.district}، ` : ''}{property.location.city}
            </Text>
          </View>
          <View style={pStyles.specsRow}>
            {property.bedrooms > 0 && (
              <View style={pStyles.specItem}>
                <Ionicons name="bed-outline" size={14} color={Colors.textSecondary} />
                <Text style={pStyles.specText}>{property.bedrooms}</Text>
              </View>
            )}
            {property.bathrooms > 0 && (
              <View style={pStyles.specItem}>
                <Ionicons name="water-outline" size={14} color={Colors.textSecondary} />
                <Text style={pStyles.specText}>{property.bathrooms}</Text>
              </View>
            )}
            {property.area > 0 && (
              <View style={pStyles.specItem}>
                <Ionicons name="resize-outline" size={14} color={Colors.textSecondary} />
                <Text style={pStyles.specText}>{property.area} م²</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const pStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  imageContainer: {
    height: 160,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary + '08',
  },
  priceOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  priceOverlayText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  imageCountText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  location: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});

// ============ بطاقة عقار مصغرة للقوائم الأفقية ============
export function PropertyImageCard({ property, onPress }: { property: any; onPress: () => void }) {
  const hasImage = property.images && property.images.length > 0;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={piStyles.card}>
      <View style={piStyles.imageWrap}>
        {hasImage ? (
          <Image source={{ uri: property.images[0] }} style={piStyles.image} resizeMode="cover" />
        ) : (
          <View style={piStyles.placeholder}>
            <Ionicons name="home-outline" size={28} color={Colors.primaryLight} />
          </View>
        )}
        <View style={[piStyles.miniBadge, {
          backgroundColor: property.status === 'للبيع' ? Colors.primary : Colors.secondary,
        }]}>
          <Text style={piStyles.miniBadgeText}>{property.status}</Text>
        </View>
      </View>
      <View style={piStyles.info}>
        <Text style={piStyles.price} numberOfLines={1}>
          {property.price.toLocaleString('ar-SA')} ر.س
        </Text>
        <Text style={piStyles.name} numberOfLines={1}>{property.title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const piStyles = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 12,
    ...Shadows.card,
  },
  imageWrap: {
    height: 110,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary + '08',
  },
  miniBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  info: {
    padding: 10,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 2,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
});

// ============ عنصر مواصفة (أيقونة + قيمة) ============
export function SpecItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 10 }}>
      <Ionicons name={icon as any} size={22} color={Colors.primary} />
      <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.text, marginTop: 4 }}>{value}</Text>
      <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

// ============ شريحة ميزة ============
export function FeatureChip({ label, selected, onPress, showCheck }: { label: string; selected?: boolean; onPress?: () => void; showCheck?: boolean }) {
  const content = (
    <View style={[{
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: selected ? Colors.primary : Colors.border,
      backgroundColor: selected ? Colors.primary + '10' : Colors.surface,
      gap: 6,
    }]}>
      {showCheck && <Ionicons name="checkmark-circle" size={16} color={selected ? Colors.success : Colors.textTertiary} />}
      <Text style={{ fontSize: 13, fontWeight: '600', color: selected ? Colors.primary : Colors.textSecondary }}>{label}</Text>
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{content}</TouchableOpacity>;
  }
  return content;
}

// ============ بطاقة مقطع ============
export function SectionCard({ title, icon, children, style }: { title?: string; icon?: string; children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[{
      backgroundColor: Colors.surface,
      borderRadius: 20,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 16,
      ...Shadows.card,
    }, style]}>
      {title && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          {icon && <Ionicons name={icon as any} size={20} color={Colors.primary} />}
          <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.text }}>{title}</Text>
        </View>
      )}
      {children}
    </View>
  );
}

// ============ بوتوم شيت ============
interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: number;
}

export function BottomSheet({ visible, onClose, title, children, height = 340 }: BottomSheetProps) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }),
        Animated.timing(overlayAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: height, duration: 200, useNativeDriver: true }),
        Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', opacity: overlayAnim, justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <Animated.View style={{
          backgroundColor: Colors.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 20,
          paddingBottom: 36,
          transform: [{ translateY: slideAnim }],
          maxHeight: height + 60,
        }}>
          <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginBottom: 16 }} />
          {title && <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: 16 }}>{title}</Text>}
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ============ زر عائم ============
export function FloatingActionButton({ icon, onPress, color, bottom }: { icon: string; onPress: () => void; color?: string; bottom?: number }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[{
        position: 'absolute',
        right: 20,
        bottom: bottom ?? 28,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: color || Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.elevated,
      }]}
    >
      <Ionicons name={icon as any} size={26} color="#FFF" />
    </TouchableOpacity>
  );
}

// ============ شريط بحث دائري ============
export function SearchBar({ placeholder, onPress, value, onChangeText, autoFocus }: { placeholder: string; onPress?: () => void; value?: string; onChangeText?: (t: string) => void; autoFocus?: boolean }) {
  if (onChangeText) {
    return (
      <View style={[sbStyles.container, Shadows.card]}>
        <Ionicons name="search-outline" size={20} color={Colors.textSecondary} style={{ marginLeft: 12 }} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          autoFocus={autoFocus}
          style={sbStyles.input}
        />
        {value ? (
          <TouchableOpacity onPress={() => onChangeText('')} style={{ padding: 6 }}>
            <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[sbStyles.container, Shadows.card]}>
      <Ionicons name="search-outline" size={20} color={Colors.textSecondary} style={{ marginLeft: 12 }} />
      <Text style={sbStyles.placeholder}>{placeholder}</Text>
    </TouchableOpacity>
  );
}

const sbStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    height: 52,
    marginHorizontal: 16,
  },
  placeholder: {
    flex: 1,
    fontSize: 15,
    color: Colors.textTertiary,
    marginLeft: 10,
    textAlign: 'right',
    marginRight: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    marginLeft: 10,
    textAlign: 'right',
    marginRight: 4,
    paddingVertical: 0,
  },
});

// ============ أفاتار ============
export function Avatar({ name, size, uri }: { name: string; size?: number; uri?: string }) {
  const s = size || 48;
  const initials = getInitials(name);
  const bg = getAvatarColor(initials);

  if (uri) {
    return (
      <Image source={{ uri }} style={{ width: s, height: s, borderRadius: s / 2, backgroundColor: '#F1F5F9' }} />
    );
  }

  return (
    <View style={{
      width: s,
      height: s,
      borderRadius: s / 2,
      backgroundColor: bg + '18',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: bg + '30',
    }}>
      <Text style={{ fontSize: s * 0.36, fontWeight: '800', color: bg }}>{initials}</Text>
    </View>
  );
}

// ============ صف إحصائيات ============
export function StatsRow({ items }: { items: { icon: string; label: string; value: number; color: string }[] }) {
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 16 }}>
      {items.map((item, i) => (
        <View key={i} style={{
          flex: 1,
          backgroundColor: Colors.surface,
          borderRadius: 16,
          padding: 14,
          alignItems: 'center',
          ...Shadows.card,
        }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: item.color + '15', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <Ionicons name={item.icon as any} size={20} color={item.color} />
          </View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: Colors.text }}>{item.value}</Text>
          <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ============ شريحة حالة ============
export function StatusBadge({ status }: { status: string }) {
  const bg = status === 'للبيع' ? Colors.primary : status === 'للإيجار' ? Colors.secondary : Colors.warning;
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 }}>
      <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '800' }}>{status}</Text>
    </View>
  );
}

// ============ مؤشر النقاط للكاروسيل ============
export function DotIndicators({ total, active, color, inactiveColor }: { total: number; active: number; color?: string; inactiveColor?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 8 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{
          width: i === active ? 20 : 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: i === active ? (color || Colors.primary) : (inactiveColor || '#D1D5DB'),
        }} />
      ))}
    </View>
  );
}
