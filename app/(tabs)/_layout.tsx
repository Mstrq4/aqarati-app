import { Tabs } from 'expo-router';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useApp } from '../../src/context/AppContext';

const TAB_ICON_SIZE = 24;

function AddTabIcon({ colors }: { colors: any }) {
  return (
    <View style={[styles.addTab, {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
    }]}>
      <Ionicons name="add" size={28} color="#FFFFFF" />
    </View>
  );
}

export default function TabLayout() {
  const { t, colors, language } = useApp();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          height: 70,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          backgroundColor: colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: colors.tabBarBorder,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          maxWidth: 100,
        },
        headerTitleAlign: 'center',
        tabBarAllowFontScaling: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={TAB_ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('explore'),
          tabBarIcon: ({ color }) => <Ionicons name="compass-outline" size={TAB_ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-tab"
        options={{
          title: '',
          tabBarIcon: () => <AddTabIcon colors={colors} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('add');
          },
        })}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: t('reminders'),
          tabBarIcon: ({ color }) => <Feather name="bell" size={TAB_ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t('account'),
          tabBarIcon: ({ color }) => <MaterialIcons name="person-outline" size={TAB_ICON_SIZE} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addTab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
