// Minimal promise-based IndexedDB wrapper (no dependencies).
// Two stores:
//   - "districts": cached road data keyed by city (for offline lookup)
//   - "queue":     complaints filed while offline, flushed on reconnect

const DB_NAME = "roadwatch";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("districts")) {
        db.createObjectStore("districts", { keyPath: "city" });
      }
      if (!db.objectStoreNames.contains("queue")) {
        db.createObjectStore("queue", { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = fn(t.objectStore(store));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export function idbPut(store: string, value: any): Promise<any> {
  return tx(store, "readwrite", (s) => s.put(value));
}

export function idbGet<T = any>(store: string, key: IDBValidKey): Promise<T | undefined> {
  return tx<T | undefined>(store, "readonly", (s) => s.get(key) as IDBRequest<T | undefined>);
}

export function idbGetAll<T = any>(store: string): Promise<T[]> {
  return tx<T[]>(store, "readonly", (s) => s.getAll() as IDBRequest<T[]>);
}

export function idbDelete(store: string, key: IDBValidKey): Promise<void> {
  return tx<void>(store, "readwrite", (s) => s.delete(key) as unknown as IDBRequest<void>);
}
