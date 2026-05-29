import Dexie, { type Table } from 'dexie';
import type { RawDataRow } from './dataParser';

// ── Tabelas ──────────────────────────────────────────────────────────────────

/** Registro de um upload (cabeçalho) */
export interface UploadRecord {
  id?: number;
  fileName: string;
  uploadedAt: Date;
  rowCount: number;
  rows: RawDataRow[]; // dados completos embutidos
}

/** Estado genérico da aplicação (chave → valor JSON) */
export interface AppStateEntry {
  key: string;   // primary key
  value: string; // JSON serializado
}

// ── Banco ────────────────────────────────────────────────────────────────────

class GestaoDB extends Dexie {
  uploads!: Table<UploadRecord, number>;
  appState!: Table<AppStateEntry, string>;

  constructor() {
    super('GestaoDesalocacao_v1');
    this.version(1).stores({
      uploads:  '++id, uploadedAt',
      appState: 'key',
    });
  }
}

export const db = new GestaoDB();

// ── Helpers de estado persistido ─────────────────────────────────────────────

export async function getState<T>(key: string, fallback: T): Promise<T> {
  try {
    const entry = await db.appState.get(key);
    return entry ? (JSON.parse(entry.value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function setState<T>(key: string, value: T): Promise<void> {
  await db.appState.put({ key, value: JSON.stringify(value) });
}
