import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Alert, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import db from '../../lib/database';
import { Colors } from '../../theme';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { createStyles } from '../../styles/screens/main/feedScreen.styles';
import { useAuth } from '../../context/AuthContext';
import { deletePendingSighting } from '../../services/syncService';

interface LocalSighting {
  id: string;
  bird_id: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  photo_url: string | null;
  local_photo_path: string | null;
  sighting_date: string | null;
  created_at: string | null;
  sync_status: string | null;
  common_name: string | null;
  scientific_name: string | null;
}

const SyncBadge = ({ status }: { status: string | null }) => {
  const isPending = status !== 'synced';
  return (
    <View style={[styles.badge, isPending ? styles.badgePending : styles.badgeSynced]}>
      <Ionicons
        name={isPending ? 'cloud-upload-outline' : 'cloud-done-outline'}
        size={12}
        color={isPending ? '#92400e' : '#166534'}
      />
      <Text style={[styles.badgeText, isPending ? styles.badgeTextPending : styles.badgeTextSynced]}>
        {isPending ? 'Pendiente' : 'Sincronizado'}
      </Text>
    </View>
  );
};

const SightingCard = ({ item, onDelete, }: { item: LocalSighting; onDelete: (id: string) => void; }) =>{
  const date = item.sighting_date
    ? new Date(item.sighting_date).toLocaleDateString('es-MX', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : item.created_at
    ? new Date(item.created_at).toLocaleDateString('es-MX', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : 'Fecha desconocida';

  const photoUri = item.local_photo_path ?? item.photo_url;
  const isPending = item.sync_status !== 'synced';

  const handleDelete = () => {
    Alert.alert(
      'Eliminar avistamiento',
      '¿Seguro que quieres eliminar este avistamiento? No se ha sincronizado aún.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDelete(item.id),
        },
      ]
    );
  };


  return (
    <View style={styles.card}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={[styles.photo, styles.photoPlaceholder]}>
          <Ionicons name="image-outline" size={36} color={Colors.textSecondary} />
        </View>
      )}

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.birdName} numberOfLines={1}>
              {item.common_name ?? 'Ave desconocida'}
            </Text>
            {item.scientific_name ? (
              <Text style={styles.scientificName} numberOfLines={1}>
                {item.scientific_name}
              </Text>
            ) : null}
          </View>
          <SyncBadge status={item.sync_status} />
        </View>

        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.cardFooter}>
          {item.latitude && item.longitude ? (
            <View style={styles.footerItem}>
              <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.footerText}>
                {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
              </Text>
            </View>
          ) : null}
          <View style={styles.footerItem}>
            <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.footerText}>{date}</Text>
          </View>
        </View>

        {isPending && (
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteButton}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={14} color="#b91c1c" />
            <Text style={styles.deleteText}>Eliminar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function OfflineFeedScreen() {
  const { colors, isDark } = useDynamicStyles(createStyles);
  const { user } = useAuth();
  const [sightings, setSightings] = useState<LocalSighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSightings = useCallback(async () => {
    if (!user) return;
    try {
      const rows = await db.getAllAsync<LocalSighting>(`
        SELECT
          s.id, s.bird_id, s.description, s.latitude, s.longitude,
          s.photo_url, s.local_photo_path, s.sighting_date, s.created_at, s.sync_status,
          b.common_name, b.scientific_name
        FROM sightings s
        LEFT JOIN birds b ON b.id = s.bird_id
        WHERE s.user_id = ?
        ORDER BY s.created_at DESC
      `, [user.id]);
      setSightings(rows);
    } catch (e) {
      console.error('Error leyendo sightings offline:', e);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    loadSightings().finally(() => setLoading(false));
  }, [loadSightings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSightings();
    setRefreshing(false);
  }, [loadSightings]);

  // ← NUEVO: handler de borrado
  const handleDelete = useCallback(async (id: string) => {
    try {
      await deletePendingSighting(id);
      setSightings(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      console.error('Error eliminando sighting:', e);
      Alert.alert('Error', 'No se pudo eliminar el avistamiento.');
    }
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.offlinePill}>
          <Ionicons name="cloud-offline-outline" size={14} color="#92400e" />
          <Text style={styles.offlinePillText}>Modo sin conexión</Text>
        </View>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Mis avistamientos</Text>
        <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
          Se sincronizarán cuando haya conexión
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : sightings.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="binoculars-outline" size={48} color={Colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.primary }]}>Sin avistamientos locales</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Registra un avistamiento y se guardará aquí aunque no tengas internet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sightings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SightingCard item={item} onDelete={handleDelete} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  headerTitle: { fontSize: 20, fontFamily: 'PlusJakartaSans-Bold' },
  headerSub: { fontSize: 13, fontFamily: 'PlusJakartaSans' },
  offlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: '#fef3c7',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 4,
  },
  offlinePillText: { fontSize: 12, color: '#92400e', fontFamily: 'PlusJakartaSans-SemiBold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  emptyTitle: { fontSize: 17, fontFamily: 'PlusJakartaSans-SemiBold', textAlign: 'center' },
  emptyText: { fontSize: 14, fontFamily: 'PlusJakartaSans', textAlign: 'center', lineHeight: 20 },
  list: { padding: 12, gap: 12 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  photo: { width: '100%', height: 180 },
  photoPlaceholder: {
    backgroundColor: Colors.secondaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: { padding: 14, gap: 6 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  birdName: { fontSize: 16, fontFamily: 'PlusJakartaSans-Bold', color: Colors.primary },
  scientificName: { fontSize: 13, fontFamily: 'PlusJakartaSans', color: Colors.textSecondary, fontStyle: 'italic' },
  description: { fontSize: 14, fontFamily: 'PlusJakartaSans', color: Colors.textSecondary, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', gap: 16, marginTop: 4 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'PlusJakartaSans' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  badgePending: { backgroundColor: '#fef3c7' },
  badgeSynced: { backgroundColor: '#dcfce7' },
  badgeText: { fontSize: 11, fontFamily: 'PlusJakartaSans-SemiBold' },
  badgeTextPending: { color: '#92400e' },
  badgeTextSynced: { color: '#166534' },

  deleteButton: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  alignSelf: 'flex-start',
  marginTop: 6,
  paddingVertical: 4,
  paddingHorizontal: 10,
  borderRadius: 99,
  backgroundColor: '#fee2e2',
},
deleteText: {
  fontSize: 12,
  color: '#b91c1c',
  fontFamily: 'PlusJakartaSans-SemiBold',
},
});