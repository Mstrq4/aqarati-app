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
  Button,
  PropertyCard,
  SectionCard,
} from '../src/components/UI';
import { useApp } from '../src/context/AppContext';

export default function FavoritesScreen() {
  const router = useRouter();
  const { properties, t, colors } = useApp();

  const sortedProperties = useMemo(
    () =>
      [...properties].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [properties],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.background }]}>
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('myProperties')}</Text>
        <View style={{ width: 36 }} />
      </View>

      {properties.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <SectionCard>
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Ionicons name="home-outline" size={48} color={colors.textTertiary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('noResults')}</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {t('addFirstProperty')}
              </Text>
              <Button
                title={t('addProperty')}
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
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  list: { paddingVertical: 8, paddingBottom: 32 },
  emptyWrapper: { flex: 1, justifyContent: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderStyle: 'dashed' },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
});
