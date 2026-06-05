import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nManager } from 'react-native';
import { Colors } from '../src/constants/theme';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor={Colors.primary} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontFamily: 'System',
          },
          headerBackTitle: 'رجوع',
          contentStyle: {
            backgroundColor: Colors.background,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: '🏠 عقاراتي',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="add"
          options={{
            title: '➕ إضافة عقار',
            headerTitleAlign: 'center',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="[id]"
          options={{
            title: 'تفاصيل العقار',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: '⚙️ الإعدادات',
            headerTitleAlign: 'center',
          }}
        />
      </Stack>
    </>
  );
}
