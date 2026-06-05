import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { I18nManager } from 'react-native';
import { AppProvider } from '../src/context/AppContext';

export default function RootLayout() {
  useEffect(() => {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  }, []);

  return (
    <AppProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0F766E' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          headerTitleAlign: 'center',
          contentStyle: { backgroundColor: '#F8FAFC' },
        }}
        initialRouteName="splash"
      >
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="favorites" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="add" options={{ title: 'إضافة عقار', presentation: 'modal' }} />
        <Stack.Screen name="property/[id]" options={{ title: 'تفاصيل العقار' }} />
        <Stack.Screen name="search" options={{ title: 'بحث' }} />
        <Stack.Screen name="contacts" options={{ title: 'جهات الاتصال' }} />
        <Stack.Screen name="office" options={{ title: 'المكتب' }} />
        <Stack.Screen name="subscription" options={{ title: 'الباقة' }} />
      </Stack>
    </AppProvider>
  );
}
