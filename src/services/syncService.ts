import NetInfo from '@react-native-community/netinfo';
import db from '../lib/database';
import { supabase } from '../lib/supabase';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { DeviceEventEmitter } from 'react-native';

export let isOnline = false;

const MAX_SYNC_ATTEMPTS = 5;

export function generateId(): string {
  return uuidv4();
}

export function initNetworkListener() {
  NetInfo.addEventListener((state) => {
    isOnline = state.isConnected !== false && state.isInternetReachable !== false;
    if (isOnline) {
      flushSyncQueue().catch(console.error);
    }
  });
  NetInfo.fetch().then((state) => {
    isOnline = state.isConnected !== false && state.isInternetReachable !== false;
    if (isOnline) {
      flushSyncQueue().catch(console.error);
    }
  });
}

export async function addToQueue(
  tableName: string,
  operation: 'INSERT' | 'UPDATE' | 'DELETE' | 'DELETE_REACTION',
  payload: any
) {
  const id = generateId();
  await db.runAsync(
    `INSERT INTO sync_queue (id, table_name, operation, payload) VALUES (?, ?, ?, ?)`,
    [id, tableName, operation, JSON.stringify(payload)]
  );
}

let isSyncing = false;

export async function flushSyncQueue() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    // AUD-011: Limitar reintentos a MAX_SYNC_ATTEMPTS para evitar bucles infinitos ante errores permanentes de RLS/validación
    const queue = await db.getAllAsync<any>(
      `SELECT * FROM sync_queue WHERE COALESCE(attempts, 0) < ? ORDER BY created_at ASC`,
      [MAX_SYNC_ATTEMPTS]
    );

    if (queue.length === 0) return;

    let syncedAnything = false;

    for (const row of queue) {
      const payload = JSON.parse(row.payload);
      let error = null;

      try {
        if (row.table_name === 'sightings') {
          const { _localImagePaths, _localImagePath, _birdName, _scientificName, ...sightingData } = payload;

          if (row.operation === 'INSERT') {
            // 1. Resolver bird_id válido en catálogo de Supabase
            let finalBirdId: string | null = sightingData.bird_id ?? null;

            if (_birdName && (!finalBirdId || String(finalBirdId).endsWith('_bird'))) {
              const { data: birds } = await supabase
                .from('birds')
                .select('id')
                .ilike('common_name', _birdName)
                .limit(1);

              if (birds && birds.length > 0) {
                finalBirdId = birds[0].id;
              }
            }

            if (!finalBirdId || String(finalBirdId).endsWith('_bird')) {
              throw new Error(`La especie "${_birdName || 'desconocida'}" no existe en el catálogo oficial.`);
            }

            // 2. Subir imágenes locales a Supabase Storage mediante ArrayBuffer directo (AUD-022)
            const photoUrls: string[] = [];
            if (_localImagePaths || _localImagePath) {
              let pathsArray: string[] = [];

              try {
                if (_localImagePaths) {
                  pathsArray = typeof _localImagePaths === 'string' && _localImagePaths.startsWith('[')
                    ? JSON.parse(_localImagePaths)
                    : [_localImagePaths];
                } else if (_localImagePath) {
                  pathsArray = [_localImagePath];
                }
              } catch {
                pathsArray = [_localImagePaths || _localImagePath];
              }

              for (let i = 0; i < pathsArray.length; i++) {
                const path = pathsArray[i];
                if (!path) continue;

                if (path.startsWith('http://') || path.startsWith('https://')) {
                  photoUrls.push(path);
                  continue;
                }

                const rawExt = (path.split('?')[0].split('.').pop() || 'jpg').toLowerCase();
                const ext = rawExt === 'png' || rawExt === 'webp' ? rawExt : 'jpg';
                const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
                const fileName = `${sightingData.user_id}/${Date.now()}_${i}.${ext}`;

                const response = await fetch(path);
                const arrayBuffer = await response.arrayBuffer();

                let bucketName = 'Sightings';
                let { error: uploadError } = await supabase.storage
                  .from(bucketName)
                  .upload(fileName, arrayBuffer, {
                    contentType,
                    upsert: true,
                  });

                if (uploadError && (uploadError as any).code === 'NoSuchBucket') {
                  bucketName = 'sightings';
                  const retry = await supabase.storage
                    .from(bucketName)
                    .upload(fileName, arrayBuffer, {
                      contentType,
                      upsert: true,
                    });
                  uploadError = retry.error;
                }

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(fileName);
                photoUrls.push(publicUrl);
              }
            }

            const finalPhotoUrl =
              photoUrls.length === 1
                ? photoUrls[0]
                : photoUrls.length > 1
                  ? JSON.stringify(photoUrls)
                  : null;

            // 3. Insertar avistamiento en Supabase respetando privacidad de ubicación (AUD-001)
            const isPrivateLoc = Boolean(sightingData.is_location_private);
            ({ error } = await supabase.from('sightings').upsert(
              {
                ...sightingData,
                bird_id: finalBirdId,
                latitude: isPrivateLoc ? null : sightingData.latitude,
                longitude: isPrivateLoc ? null : sightingData.longitude,
                photo_url: finalPhotoUrl,
              },
              { onConflict: 'id' }
            ));

            if (!error) {
              if (sightingData.bird_id !== finalBirdId) {
                const existingLocalBird = await db.getFirstAsync<{ id: string }>(
                  `SELECT id FROM birds WHERE id = ? LIMIT 1`,
                  [finalBirdId]
                );

                if (existingLocalBird) {
                  await db.runAsync(`DELETE FROM birds WHERE id = ?`, [sightingData.bird_id]);
                } else {
                  await db.runAsync(`UPDATE birds SET id = ? WHERE id = ?`, [
                    finalBirdId,
                    sightingData.bird_id,
                  ]);
                }
              }

              await db.runAsync(
                `UPDATE sightings
                 SET photo_url = ?, sync_status = 'synced', bird_id = ?
                 WHERE id = ?`,
                [finalPhotoUrl, finalBirdId, sightingData.id]
              );
            }
          } else if (row.operation === 'UPDATE') {
            ({ error } = await supabase.from('sightings').update(sightingData).eq('id', sightingData.id));
            if (!error) {
              await db.runAsync(`UPDATE sightings SET sync_status = 'synced' WHERE id = ?`, [sightingData.id]);
            }
          } else if (row.operation === 'DELETE') {
            ({ error } = await supabase.from('sightings').delete().eq('id', sightingData.id));
          }
        } else {
          if (row.operation === 'INSERT') {
            ({ error } = await supabase.from(row.table_name).insert(payload));
          } else if (row.operation === 'UPDATE') {
            ({ error } = await supabase.from(row.table_name).update(payload).eq('id', payload.id));
          } else if (row.operation === 'DELETE') {
            ({ error } = await supabase.from(row.table_name).delete().eq('id', payload.id));
          } else if (row.operation === 'DELETE_REACTION') {
            ({ error } = await supabase
              .from('reactions')
              .delete()
              .match({ sighting_id: payload.sighting_id, user_id: payload.user_id }));
          }
        }

        if (!error) {
          await db.runAsync(`DELETE FROM sync_queue WHERE id = ?`, [row.id]);
          console.log(`Sincronizado: ${row.operation} en ${row.table_name}`);
          syncedAnything = true;
        } else {
          throw error;
        }
      } catch (err) {
        console.warn(`Fallo sync (intento ${(row.attempts || 0) + 1}):`, err);
        await db.runAsync(
          `UPDATE sync_queue SET attempts = COALESCE(attempts, 0) + 1 WHERE id = ?`,
          [row.id]
        );
      }
    }

    if (syncedAnything) {
      DeviceEventEmitter.emit('sync_completed');
    }
  } finally {
    isSyncing = false;
  }
}

/**
 * Elimina un avistamiento local preservando cualquier operación DELETE encolada
 * para registros que ya habían sido sincronizados en el servidor (AUD-019).
 */
export async function deletePendingSighting(sightingId: string): Promise<void> {
  await db.runAsync(
    `DELETE FROM sync_queue
     WHERE table_name = 'sightings'
       AND operation != 'DELETE'
       AND JSON_EXTRACT(payload, '$.id') = ?`,
    [sightingId]
  );
  await db.runAsync(`DELETE FROM sightings WHERE id = ?`, [sightingId]);
}

/**
 * Limpia la caché local y la cola de sincronización al cerrar sesión
 * para evitar fugas de información entre cuentas (AUD-008).
 */
export async function clearLocalData(): Promise<void> {
  try {
    await db.execAsync(`
      DELETE FROM sync_queue;
      DELETE FROM sightings;
      DELETE FROM comments;
      DELETE FROM reactions;
      DELETE FROM follows;
      DELETE FROM users;
    `);
  } catch (e) {
    console.warn('[clearLocalData] Error limpiando base local:', e);
  }
}
