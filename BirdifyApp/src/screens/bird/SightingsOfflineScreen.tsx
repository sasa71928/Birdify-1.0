import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import db from '../../lib/database';
import { useAuth } from '../../context/AuthContext';
import ScreenHeader from '../../components/ScreenHeader';

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface LocalSighting {
  id: string;
  bird_id: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  photo_url: string | null;
  sighting_date: string;
  sync_status: 'synced' | 'pending' | 'error';
  common_name: string | null;
  scientific_name: string | null;
}

// ── Query ─────────────────────────────────────────────────────────────────────
async function fetchLocalSightings(userId: string): Promise<LocalSighting[]> {
  return db.getAllAsync<LocalSighting>(`
    SELECT
      s.id, s.bird_id, s.description,
      s.latitude, s.longitude,
      s.photo_url, s.sighting_date, s.sync_status,
      b.common_name, b.scientific_name
    FROM sightings s
    LEFT JOIN birds b ON b.id = s.bird_id
    WHERE s.user_id = ?
    ORDER BY s.sighting_date DESC
  `, [userId]);
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function SightingsOfflineScreen() {
  const { user } = useAuth();
  const [sightings, setSightings]   = useState<LocalSighting[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      setSightings(await fetchLocalSightings(user?.id ?? ''));
    } catch (e) {
      console.error('SightingsOfflineScreen:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <ScreenHeader />
        <View style={s.center}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────
  if (sightings.length === 0) {
    return (
      <SafeAreaView style={s.container}>
        <ScreenHeader />
        <View style={s.banner}>
          <Ionicons name="cloud-offline-outline" size={13} color="#fff" />
          <Text style={s.bannerText}>Sin conexión · solo tus registros</Text>
        </View>
        <View style={s.center}>
          <Ionicons name="camera-outline" size={56} color="#999" />
          <Text style={s.emptyTitle}>Sin avistamientos guardados</Text>
          <Text style={s.emptySubtitle}>
            Tus registros offline aparecerán aquí.{'\n'}
            Usa el botón + para agregar uno.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── List ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.container}>
      <ScreenHeader />
      <View style={s.banner}>
        <Ionicons name="cloud-offline-outline" size={13} color="#fff" />
        <Text style={s.bannerText}>Sin conexión · solo tus registros</Text>
      </View>
      <FlatList
        data={sightings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
        }
        renderItem={({ item }) => <SightingCard sighting={item} />}
      />
    </SafeAreaView>
  );
}

// ── Tarjeta ───────────────────────────────────────────────────────────────────
function SightingCard({ sighting }: { sighting: LocalSighting }) {
  const date = sighting.sighting_date
    ? new Date(sighting.sighting_date).toLocaleDateString('es-MX', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : '—';

  const syncColor =
    sighting.sync_status === 'synced'  ? '#4CAF50' :
    sighting.sync_status === 'pending' ? '#FFA000' : '#F44336';

  const syncIcon =
    sighting.sync_status === 'synced'  ? 'checkmark-circle-outline' :
    sighting.sync_status === 'pending' ? 'time-outline' : 'alert-circle-outline';

  return (
    <View style={s.card}>
      {sighting.photo_url ? (
        <Image source={{ uri: sighting.photo_url }} style={s.cardImage} resizeMode="cover" />
      ) : (
        <View style={[s.cardImage, s.cardImagePlaceholder]}>
          <Ionicons name="image-outline" size={32} color="#aaa" />
        </View>
      )}

      <View style={s.cardBody}>
        <Text style={s.cardBird} numberOfLines={1}>
          {sighting.common_name ?? 'Ave desconocida'}
        </Text>
        {sighting.scientific_name ? (
          <Text style={s.cardScientific} numberOfLines={1}>{sighting.scientific_name}</Text>
        ) : null}
        {sighting.description ? (
          <Text style={s.cardDesc} numberOfLines={2}>{sighting.description}</Text>
        ) : null}
        <View style={s.cardMeta}>
          <Ionicons name="calendar-outline" size={13} color="#999" />
          <Text style={s.cardMetaText}>{date}</Text>
          {sighting.latitude && sighting.longitude ? (
            <>
              <Ionicons name="location-outline" size={13} color="#999" style={{ marginLeft: 8 }} />
              <Text style={s.cardMetaText}>
                {sighting.latitude.toFixed(4)}, {sighting.longitude.toFixed(4)}
              </Text>
            </>
          ) : null}
        </View>
      </View>

      <View style={s.syncBadge}>
        <Ionicons name={syncIcon as any} size={16} color={syncColor} />
      </View>
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#f5f5f5' },
  center:               { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  banner:               { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                          backgroundColor: '#78909C', paddingVertical: 6, gap: 6 },
  bannerText:           { color: '#fff', fontSize: 12, fontWeight: '500' },
  list:                 { padding: 16 },
  emptyTitle:           { fontSize: 17, fontWeight: '600', color: '#111', textAlign: 'center' },
  emptySubtitle:        { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20 },
  card:                 { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12,
                          overflow: 'hidden', elevation: 2, shadowColor: '#000',
                          shadowOpacity: 0.07, shadowRadius: 6,
                          shadowOffset: { width: 0, height: 2 }, marginBottom: 12 },
  cardImage:            { width: 90, height: 90 },
  cardImagePlaceholder: { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
  cardBody:             { flex: 1, padding: 10, justifyContent: 'center', gap: 2 },
  cardBird:             { fontSize: 15, fontWeight: '600', color: '#111' },
  cardScientific:       { fontSize: 12, fontStyle: 'italic', color: '#888' },
  cardDesc:             { fontSize: 13, color: '#666', marginTop: 2 },
  cardMeta:             { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  cardMetaText:         { fontSize: 12, color: '#888' },
  syncBadge:            { padding: 8, paddingTop: 10, justifyContent: 'flex-start', alignItems: 'center' },
});