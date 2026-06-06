import { Stack } from 'expo-router';
import { AppProvider } from '../src/context/AppContext';
import { useApp } from '../src/context/AppContext';
import { useColorScheme } from 'react-native';

function StackNavigator() {
  const { colors } = useApp();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerTitleAlign: 'center',
        contentStyle: { backgroundColor: colors.background },
      }}
      initialRouteName="splash"
    >
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="favorites" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="add" options={{ title: '\u0625\u0636\u0627\u0641\u0629 \u0639\u0642\u0627\u0631', presentation: 'modal' }} />
      <Stack.Screen name="property/[id]" options={{ title: '\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0639\u0642\u0627\u0631' }} />
      <Stack.Screen name="search" options={{ title: '\u0628\u062D\u062B' }} />
      <Stack.Screen name="contacts" options={{ title: '\u062C\u0647\u0627\u062A \u0627\u0644\u0627\u062A\u0635\u0627\u0644' }} />
      <Stack.Screen name="office" options={{ title: '\u0627\u0644\u0645\u0643\u062A\u0628' }} />
      <Stack.Screen name="subscription" options={{ title: '\u0627\u0644\u0628\u0627\u0642\u0629' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <StackNavigator />
    </AppProvider>
  );
}
