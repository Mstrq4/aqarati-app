import { Tabs } from 'expo-router';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

const TAB_ICON_SIZE = 24;

function AddTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.addTab, focused && styles.addTabFocused]}>
      <Ionicons name="add" size={28} color="#FFFFFF" />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#0F766E' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: '#0F766E',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 4 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerTitleAlign: 'center',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={TAB_ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'استكشاف',
          tabBarIcon: ({ color }) => <Ionicons name="compass-outline" size={TAB_ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-tab"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => <AddTabIcon focused={focused} />,
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
          title: 'تذكيرات',
          tabBarIcon: ({ color }) => <Feather name="bell" size={TAB_ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'الحساب',
          tabBarIcon: ({ color }) => <MaterialIcons name="person-outline" size={TAB_ICON_SIZE} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addTab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addTabFocused: {
    backgroundColor: '#115E59',
    transform: [{ scale: 1.1 }],
  },
});
