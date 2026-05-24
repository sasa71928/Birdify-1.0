import NetInfo from '@react-native-community/netinfo';
import db from '../lib/database';
import { supabase } from '../lib/supabase';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export let isOnline = true;

export function generateId(): string {
  return uuidv4();
}

export function initNetworkListener() {
  NetInfo.addEventListener(state => {
    const wasOffline = !isOnline;
    isOnline = !!state.isConnected;

    if (wasOffline && isOnline) {
      console.log('🌐 Red recuperada, sincronizando...');
      flushSyncQueue();
    }

    if (!isOnline) {
      console.log('📴 Sin red, modo offline activado');
    }
  });
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
      if (row.operation === 'INSERT') {
        ({ error } = await supabase.from(row.table_name).insert(payload));
      } else if (row.operation === 'UPDATE') {
        ({ error } = await supabase.from(row.table_name).update(payload).eq('id', payload.id));
      } else if (row.operation === 'DELETE') {
        ({ error } = await supabase.from(row.table_name).delete().eq('id', payload.id));
      }

      if (!error) {
        await db.runAsync(`DELETE FROM sync_queue WHERE id = ?`, [row.id]);
        console.log(`✅ Sincronizado: ${row.operation} en ${row.table_name}`);
      } else {
        throw error;
      }
    } catch (err) {
      console.warn(`⚠️ Falló sync (intento ${row.attempts + 1}):`, err);
      await db.runAsync(
        `UPDATE sync_queue SET attempts = attempts + 1 WHERE id = ?`,
        [row.id]
      );
    }
  }
}