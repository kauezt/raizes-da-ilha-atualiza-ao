import { AppData } from '../types';

const DB_NAME = 'raizes_da_ilha_db';
const DB_VERSION = 1;
const STORE_NAME = 'app_state';
const RECORD_KEY = 'site_data_v2';

export const LEGACY_STORAGE_KEY_V2 = 'raizes_da_ilha_data_v2';
export const LEGACY_STORAGE_KEY_V1 = 'raizes_da_ilha_data_v1';
const IDB_MARKER = '__RAIZES_IDB_ONLY__';
const MAX_LOCALSTORAGE_CHARS = 2_500_000;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB indisponível neste navegador.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Erro ao abrir banco de dados local.'));
  });
}

async function readFromIdb(): Promise<AppData | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(RECORD_KEY);
    req.onsuccess = () => resolve((req.result as AppData) || null);
    req.onerror = () => reject(req.error || new Error('Erro ao ler dados salvos.'));
    tx.oncomplete = () => db.close();
  });
}

async function writeToIdb(data: AppData): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(data, RECORD_KEY);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error || new Error('Erro ao gravar dados no navegador.'));
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error || new Error('Gravação cancelada pelo navegador.'));
    };
  });
}

export function loadSyncFallback(): Partial<AppData> | null {
  try {
    const saved =
      localStorage.getItem(LEGACY_STORAGE_KEY_V2) ||
      localStorage.getItem(LEGACY_STORAGE_KEY_V1);
    if (!saved || saved === IDB_MARKER) return null;
    const parsed = JSON.parse(saved);
    if (parsed && typeof parsed === 'object') {
      return parsed as Partial<AppData>;
    }
  } catch {
    // Ignore malformed localStorage
  }
  return null;
}

export async function loadAppData(): Promise<Partial<AppData> | null> {
  try {
    const idbData = await readFromIdb();
    if (idbData && typeof idbData === 'object') {
      return idbData;
    }
  } catch (err) {
    console.warn('IndexedDB read fallback to localStorage:', err);
  }

  const lsData = loadSyncFallback();
  if (lsData) {
    // Migrate existing localStorage data into IndexedDB seamlessly
    try {
      await writeToIdb(lsData as AppData);
    } catch {
      // Non-fatal
    }
    return lsData;
  }

  return null;
}

export interface SaveResult {
  ok: boolean;
  error?: string;
}

export async function saveAppData(data: AppData): Promise<SaveResult> {
  let idbSaved = false;
  let idbError: string | undefined;

  try {
    await writeToIdb(data);
    idbSaved = true;
  } catch (err) {
    idbError = err instanceof Error ? err.message : 'Erro ao salvar no IndexedDB';
    console.error('IndexedDB save failed:', err);
  }

  try {
    const serialized = JSON.stringify(data);
    if (serialized.length <= MAX_LOCALSTORAGE_CHARS) {
      localStorage.setItem(LEGACY_STORAGE_KEY_V2, serialized);
    } else if (idbSaved) {
      // Mark localStorage so stale small snapshot does not shadow newer IndexedDB data
      localStorage.setItem(LEGACY_STORAGE_KEY_V2, IDB_MARKER);
    }
    return { ok: true };
  } catch (err) {
    if (idbSaved) {
      try {
        localStorage.setItem(LEGACY_STORAGE_KEY_V2, IDB_MARKER);
      } catch {
        // Ignore even if localStorage is completely full; IDB has the authoritative copy
      }
      return { ok: true };
    }

    const lsError =
      err instanceof Error
        ? err.message
        : 'Espaço de armazenamento do navegador esgotado.';
    return {
      ok: false,
      error: idbError ? `${idbError} / ${lsError}` : lsError,
    };
  }
}
