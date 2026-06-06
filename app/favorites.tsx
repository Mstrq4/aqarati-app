import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Colors,
  Button,
  PropertyCard,
  SectionCard,
} from '../src/components/UI';
import { useApp } from '../src/context/AppContext';

export default function FavoritesScreen() {
  const router = useRouter();
  const { properties } = useApp();

  const sortedProperties = useMemo(
    () =>
      [...properties].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [properties],
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-forward" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>عقاراتي</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Content */}
      {properties.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <SectionCard>
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons name="home-outline" size={48} color={Colors.textTertiary} />
              </View>
              <Text style={styles.emptyTitle}>لم تقم بإضافة عقارات</Text>
              <Text style={styles.emptySubtitle}>
                أضف عقارك الأول للبدء في إدارته ومتابعته
              </Text>
              <Button
                title="إضافة عقار"
                onPress={() => router.push('/add')}
                variant="primary"
                size="md"
                icon="add-outline"
              />
            </View>
          </SectionCard>
        </View>
      ) : (
        <FlatList
          data={sortedProperties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onPress={() => router.push(`/property/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  list: {
    paddingVertical: 8,
    paddingBottom: 32,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
});
