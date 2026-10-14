// Local IndexedDB storage used by the offline-first layer.
const DB_NAME = 'koume-roomflow';
const DB_VERSION = 1;
const CACHE_STORE = 'cache';
const OPS_STORE = 'ops';
let dbPromise = null;

function openDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB unavailable'));
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(CACHE_STORE)) {
          db.createObjectStore(CACHE_STORE, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(OPS_STORE)) {
          db.createObjectStore(OPS_STORE, { keyPath: 'seq', autoIncrement: true });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

async function run(storeName, mode, action) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    let result;
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const req = action(store);
    if (req) {
      req.onsuccess = () => { result = req.result; };
    }
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export const getCacheRecords = (entity) =>
  run(CACHE_STORE, 'readonly', (s) => s.getAll()).then((rows) =>
    (rows || [])
      .filter((r) => r && typeof r.key === 'string' && r.key.startsWith(entity + '::'))
      .map((r) => r.value)
  );

export const putCacheRecord = (entity, rec) =>
  run(CACHE_STORE, 'readwrite', (s) => s.put({ key: entity + '::' + rec.id, value: rec }));

export const deleteCacheRecord = (entity, id) =>
  run(CACHE_STORE, 'readwrite', (s) => s.delete(entity + '::' + id));

export const getOps = () => run(OPS_STORE, 'readonly', (s) => s.getAll());

export const addOp = (op) => run(OPS_STORE, 'readwrite', (s) => s.add(op));

export const putOp = (op) => run(OPS_STORE, 'readwrite', (s) => s.put(op));

export const deleteOp = (seq) => run(OPS_STORE, 'readwrite', (s) => s.delete(seq));