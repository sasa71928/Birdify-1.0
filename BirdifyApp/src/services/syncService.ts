import NetInfo from '@react-native-community/netinfo';
import db from '../lib/database';
import { supabase } from '../lib/supabase';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export let isOnline = false;

export function generateId(): string {
  return uuidv4();
}


export async function addToQueue(
  tableName: string,
  operation: 'INSERT' | 'UPDATE' | 'DELETE',
  payload: object
) {
  const id = generateId();
  await db.runAsync(
    `INSERT INTO sync_queue (id, table_name, operation, payload) VALUES (?, ?, ?, ?)`,
    [id, tableName, operation, JSON.stringify(payload)]
  );
}

function decodeBase64ToArrayBuffer(base64: string): ArrayBuffer {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }
  let bufferLength = base64.length * 0.75;
  if (base64[base64.length - 1] === '=') {
    bufferLength--;
    if (base64[base64.length - 2] === '=') bufferLength--;
  }
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);
  let p = 0;
  for (let i = 0; i < base64.length; i += 4) {
    const b1 = lookup[base64.charCodeAt(i)];
    const b2 = lookup[base64.charCodeAt(i + 1)];
    const b3 = lookup[base64.charCodeAt(i + 2)];
    const b4 = lookup[base64.charCodeAt(i + 3)];
    bytes[p++] = (b1 << 2) | (b2 >> 4);
    if (p < bufferLength) bytes[p++] = ((b2 & 15) << 4) | (b3 >> 2);
    if (p < bufferLength) bytes[p++] = ((b3 & 3) << 6) | (b4 & 63);
  }
  return arrayBuffer;
}

export async function flushSyncQueue() {
  const rows = await db.getAllAsync<{
    id: string;
    table_name: string;
    operation: string;
    payload: string;
    attempts: number;
  }>(`SELECT * FROM sync_queue ORDER BY created_at ASC`);

  for (const row of rows) {
    const payload = JSON.parse(row.payload);
    let error = null;

    try {
      if (row.table_name === 'sightings' && row.operation === 'INSERT' && payload._localImagePath) {
        const { _localImagePath, _birdName, _scientificName, ...sightingData } = payload;

        // 1. Buscar o crear ave en Supabase
        let finalBirdId = sightingData.bird_id;
        const { data: birds } = await supabase
          .from('birds')
          .select('id')
          .ilike('common_name', _birdName)
          .limit(1);

        if (birds && birds.length > 0) {
          finalBirdId = birds[0].id;
        } else {
          const { data: newBird, error: birdError } = await supabase
            .from('birds')
            .insert({
              common_name: _birdName,
              scientific_name: _scientificName || _birdName + ' sp.',
              description: 'Registrado offline.',
              season: 'Desconocido',
              habitat_info: 'Desconocido',
              ideal_zones: 'Desconocido',
            })
            .select()
            .single();
          if (birdError) throw birdError;
          finalBirdId = newBird.id;
        }

        // 2. Subir imagen a Supabase Storage
        const ext = _localImagePath.split('.').pop() || 'jpg';
        const fileName = `${sightingData.user_id}/${Date.now()}.${ext}`;
        const base64 = await fetch(_localImagePath)
          .then(r => r.blob())
          .then(blob => new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          }));

        const arrayBuffer = decodeBase64ToArrayBuffer(base64);
        const { error: uploadError } = await supabase.storage
          .from('Sightings')
          .upload(fileName, arrayBuffer, {
            contentType: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
            upsert: true,
          });
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('Sightings').getPublicUrl(fileName);

        // 3. Insertar sighting en Supabase
        ({ error } = await supabase.from('sightings').upsert({
          ...sightingData,
          bird_id: finalBirdId,
          photo_url: publicUrl,
        }, { onConflict: 'id' }));

        if (!error) {
          // 4. Actualizar bird local con ID real de Supabase para que el JOIN siga funcionando
          await db.runAsync(
            `UPDATE birds SET id = ? WHERE id = ?`,
            [finalBirdId, sightingData.bird_id]
          );

          // 5. Actualizar sighting — photo_url = URL Supabase, local_photo_path intacto
          await db.runAsync(
            `UPDATE sightings
             SET photo_url = ?, sync_status = 'synced', bird_id = ?
             WHERE id = ?`,
            [publicUrl, finalBirdId, sightingData.id]
          );
        }

      } else {
        if (row.operation === 'INSERT') {
          ({ error } = await supabase.from(row.table_name).insert(payload));
        } else if (row.operation === 'UPDATE') {
          ({ error } = await supabase.from(row.table_name).update(payload).eq('id', payload.id));
        } else if (row.operation === 'DELETE') {
          ({ error } = await supabase.from(row.table_name).delete().eq('id', payload.id));
        }
      }

      if (!error) {
        await db.runAsync(`DELETE FROM sync_queue WHERE id = ?`, [row.id]);
        console.log(`Sincronizado: ${row.operation} en ${row.table_name}`);
      } else {
        throw error;
      }

    } catch (err) {
      console.warn(`Fallo sync (intento ${row.attempts + 1}):`, err);
      await db.runAsync(
        `UPDATE sync_queue SET attempts = attempts + 1 WHERE id = ?`,
        [row.id]
      );
    }
  }
}