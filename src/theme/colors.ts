// ============ نظام السمات (Theme) — Light / Dark ============

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  overlay: string;
  tabBar: string;
  tabBarBorder: string;
  inputBg: string;
  placeholder: string;
}

export const lightColors: ThemeColors = {
  primary: '#0F766E',
  primaryLight: '#14B8A6',
  primaryDark: '#0D5E56',
  secondary: '#D4A72C',
  secondaryLight: '#F0D060',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  error: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  overlay: 'rgba(0,0,0,0.5)',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  inputBg: '#F1F5F9',
  placeholder: '#94A3B8',
};

export const darkColors: ThemeColors = {
  primary: '#14B8A6',
  primaryLight: '#2DD4BF',
  primaryDark: '#0F766E',
  secondary: '#F0D060',
  secondaryLight: '#FDE68A',
  background: '#0F172A',
  surface: '#1E293B',
  card: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  border: '#334155',
  error: '#FCA5A5',
  success: '#86EFAC',
  warning: '#FDE68A',
  overlay: 'rgba(0,0,0,0.7)',
  tabBar: '#1E293B',
  tabBarBorder: '#334155',
  inputBg: '#334155',
  placeholder: '#64748B',
};

export type ThemeMode = 'light' | 'dark' | 'system';
