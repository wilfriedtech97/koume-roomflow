// Offline-first layer for the app's entities.
// - Reads are served from the server when online (and cached), from the local cache when offline.
// - Writes are sent straight to the server when online; when offline they are saved
//   locally and queued, then automatically synced (last write wins) once online.
import {
  getCacheRecords, putCacheRecord, deleteCacheRecord,
  getOps, addOp, putOp, deleteOp
} from '@/lib/offlineDb';

const EXCLUDED_ENTITIES = ['User'];
const FALLBACK_ENTITIES = ['Site', 'Building', 'Room', 'Occupant', 'Reservation', 'HistoryEvent'];

const rawEntities = {};
const listeners = new Set();
let status = {
  online: typeof navigator === 'undefined' ? true : navigator.onLine,
  pending: 0,
  syncing: false
};
let flushing = false;

/* ── sync status (used by the UI indicator) ───────────────────────────── */
export function getSyncStatus() { return status; }

export function onSyncStatus(fn) {
  listeners.add(fn);
  try { fn({ ...status }); } catch (e) { /* noop */ }
  return () => listeners.delete(fn);
}

function emit() {
  const snap = { ...status };
  for (const l of listeners) {
    try { l(snap); } catch (e) { /* noop */ }
  }
}

function setOnline(v) {
  if (status.online !== v) {
    status.online = v;
    emit();
  }
  if (v) flushOfflineOps();
}

async function refreshPending() {
  try {
    status.pending = (await getOps()).length;
  } catch (e) { /* noop */ }
  emit();
}

/* ── local query engine (mirror of the server-side filters the app uses) ─ */
function matchQuery(rec, query) {
  if (!query || typeof query !== 'object') return true;
  return Object.entries(query).every(([field, cond]) => {
    if (field === '$or') return Array.isArray(cond) && cond.some((sub) => matchQuery(rec, sub));
    if (field === '$and') return Array.isArray(cond) && cond.every((sub) => matchQuery(rec, sub));
    return matchField(rec ? rec[field] : undefined, cond);
  });
}

function matchField(value, cond) {
  if (cond === undefined) return true;
  if (cond === null) return value === null || value === undefined;
  if (typeof cond !== 'object' || Array.isArray(cond)) return value === cond;
  for (const [op, v] of Object.entries(cond)) {
    switch (op) {
      case '$in': if (!(Array.isArray(v) && v.includes(value))) return false; break;
      case '$nin': if (Array.isArray(v) && v.includes(value)) return false; break;
      case '$ne': if (value === v) return false; break;
      case '$gt': if (!(value > v)) return false; break;
      case '$gte': if (!(value >= v)) return false; break;
      case '$lt': if (!(value < v)) return false; break;
      case '$lte': if (!(value <= v)) return false; break;
      case '$exists': if ((value !== undefined) !== Boolean(v)) return false; break;
      case '$regex': {
        const flags = cond.$options && String(cond.$options).includes('i') ? 'i' : '';
        if (!new RegExp(String(v), flags).test(value == null ? '' : String(value))) return false;
        break;
      }
      case '$options': break;
      default: if (value !== v) return false;
    }
  }
  return true;
}

function sortItems(items, sort) {
  if (!sort) return items;
  const parts = String(sort).split(',').map((p) => p.trim()).filter(Boolean);
  return [...items].sort((a, b) => {
    for (const p of parts) {
      const desc = p.startsWith('-');
      const f = desc ? p.slice(1) : p;
      const av = a ? a[f] : undefined;
      const bv = b ? b[f] : undefined;
      if (av === bv) continue;
      if (av === undefined || av === null) return 1;
      if (bv === undefined || bv === null) return -1;
      const c = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
      return desc ? -c : c;
    }
    return 0;
  });
}

async function computeFilter(entity, query, opts = {}) {
  let items = (await getCacheRecords(entity)).filter((r) => matchQuery(r, query));
  items = sortItems(items, opts.sort);
  if (opts.limit) items = items.slice(0, opts.limit);
  if (opts.fields) {
    items = items.map((r) => {
      const o = {};
      for (const f of opts.fields) o[f] = r ? r[f] : undefined;
      return o;
    });
  }
  return { items, next_cursor: null, has_more: false };
}

async function computeList(entity, sort, limit) {
  let items = await getCacheRecords(entity);
  items = sortItems(items, sort);
  if (limit) items = items.slice(0, limit);
  return items;
}

async function computeCount(entity, query) {
  const recs = await getCacheRecords(entity);
  return recs.filter((r) => matchQuery(r, query)).length;
}

function asList(v) { return v == null ? [] : Array.isArray(v) ? v : [v]; }

async function computeAggregate(entity, spec = {}) {
  const recs = (await getCacheRecords(entity)).filter((r) => matchQuery(r, spec.query));
  const { groupBy, sum, avg, min, max, countDistinct, having, sort, limit, dateBucket } = spec;
  const bucketKey = (val) => {
    if (!dateBucket || !val) return '';
    const s = String(val);
    if (dateBucket.unit === 'year') return s.slice(0, 4);
    if (dateBucket.unit === 'month') return s.slice(0, 7);
    return s.slice(0, 10);
  };
  const groups = new Map();
  for (const r of recs) {
    const key = dateBucket ? bucketKey(r[dateBucket.field]) : groupBy ? String(r[groupBy]) : '_all';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  let rows = Array.from(groups.values()).map((groupRecs) => {
    const row = {};
    if (dateBucket) row[dateBucket.field] = bucketKey(groupRecs[0][dateBucket.field]);
    if (groupBy) row[groupBy] = groupRecs[0][groupBy];
    row.count = groupRecs.length;
    for (const f of asList(sum)) row['sum_' + f] = groupRecs.reduce((a, r) => a + (Number(r[f]) || 0), 0);
    for (const f of asList(avg)) row['avg_' + f] = groupRecs.length ? groupRecs.reduce((a, r) => a + (Number(r[f]) || 0), 0) / groupRecs.length : 0;
    for (const f of asList(min)) row['min_' + f] = groupRecs.reduce((m, r) => (r[f] != null && (m == null || r[f] < m) ? r[f] : m), null);
    for (const f of asList(max)) row['max_' + f] = groupRecs.reduce((m, r) => (r[f] != null && (m == null || r[f] > m) ? r[f] : m), null);
    for (const f of asList(countDistinct)) {
      row['count_' + f] = new Set(groupRecs.map((r) => r[f]).filter((x) => x != null)).size;
    }
    return row;
  });
  if (having) rows = rows.filter((row) => matchQuery(row, having));
  rows = sortItems(rows, sort);
  if (limit) rows = rows.slice(0, limit);
  return { rows, truncated: false };
}

/* ── cache helpers ─────────────────────────────────────────────────────── */
async function mergeCacheRecord(entity, rec) {
  if (!rec || rec.id == null) return;
  const recs = await getCacheRecords(entity);
  const existing = recs.find((r) => String(r.id) === String(rec.id));
  await putCacheRecord(entity, { ...(existing || {}), ...rec });
}

async function cacheRecords(entity, records) {
  for (const r of records || []) {
    if (r && r.id != null) await mergeCacheRecord(entity, r);
  }
}

/* ── offline write queue ───────────────────────────────────────────────── */
async function offlineCreate(entity, data) {
  const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : 'local-' + Date.now() + '-' + Math.floor(Math.random() * 1e9);
  const rec = {
    ...data,
    id,
    _offline_pending: true,
    created_date: (data && data.created_date) ? data.created_date : new Date().toISOString()
  };
  await putCacheRecord(entity, rec);
  await addOp({ entity, type: 'create', localId: id, serverId: id, data: rec, ts: Date.now() });
  await refreshPending();
  return rec;
}

async function offlineUpdate(entity, id, data) {
  const recs = await getCacheRecords(entity);
  const rec = recs.find((r) => String(r.id) === String(id));
  if (rec) await putCacheRecord(entity, { ...rec, ...data });
  await addOp({ entity, type: 'update', localId: String(id), serverId: String(id), data: { ...data }, ts: Date.now() });
  await refreshPending();
  return rec ? { ...rec, ...data } : { id, ...data };
}

async function offlineDelete(entity, id) {
  await deleteCacheRecord(entity, id);
  const ops = await getOps();
  const related = ops.filter(
    (o) => o.entity === entity && (String(o.localId) === String(id) || String(o.serverId) === String(id))
  );
  const hadCreate = related.some((o) => o.type === 'create');
  for (const o of related) await deleteOp(o.seq);
  if (!hadCreate) {
    await addOp({ entity, type: 'delete', localId: String(id), serverId: String(id), ts: Date.now() });
  }
  await refreshPending();
}

/* ── sync (push queued changes to the server) ──────────────────────────── */
async function remapOps(localId, serverId, fromSeq) {
  const ops = await getOps();
  for (const o of ops) {
    if (o.seq > fromSeq && String(o.serverId) === String(localId)) {
      await putOp({ ...o, serverId: String(serverId) });
    }
  }
}

export async function flushOfflineOps() {
  if (flushing || !navigator.onLine) return;
  flushing = true;
  status.syncing = true;
  emit();
  try {
    const ops = await getOps();
    for (const op of ops) {
      if (!navigator.onLine) break;
      const raw = rawEntities[op.entity];
      if (!raw) { await deleteOp(op.seq); continue; }
      try {
        if (op.type === 'create') {
          const payload = { ...(op.data || {}) };
          delete payload.id;
          delete payload._offline_pending;
          const rec = await raw.create(payload);
          await deleteCacheRecord(op.entity, op.localId);
          if (rec && rec.id != null) await mergeCacheRecord(op.entity, rec);
          await remapOps(op.localId, rec && rec.id != null ? rec.id : op.localId, op.seq);
        } else if (op.type === 'update') {
          try {
            const rec = await raw.update(op.serverId, op.data);
            if (rec && rec.id != null) await mergeCacheRecord(op.entity, rec);
          } catch (e) {
            // The record no longer exists on the server; drop the change.
          }
        } else if (op.type === 'delete') {
          try { await raw.delete(op.serverId); } catch (e) { /* already gone */ }
          await deleteCacheRecord(op.entity, op.serverId);
        }
        await deleteOp(op.seq);
      } catch (err) {
        if (!navigator.onLine) break;
        console.warn('[offline-sync] dropped a change that could not be synced', op.entity, op.type, err && err.message);
        await deleteOp(op.seq);
      }
    }
  } finally {
    flushing = false;
    status.syncing = false;
    await refreshPending();
  }
}

/* ── entity wrapper ────────────────────────────────────────────────────── */
async function readThrough(entity, onlineFn, offlineFn, { skipCache } = {}) {
  if (navigator.onLine) {
    try {
      const res = await onlineFn();
      if (!skipCache) {
        const items = res && res.items ? res.items : Array.isArray(res) ? res : null;
        if (items) await cacheRecords(entity, items);
      }
      return res;
    } catch (err) {
      try {
        return await offlineFn();
      } catch (e) {
        throw err;
      }
    }
  }
  return offlineFn();
}

function wrapEntity(entity, raw) {
  if (raw && raw.__offlineWrapped) {
    rawEntities[entity] = raw.__rawEntity;
    return raw;
  }
  const rawRef = raw;
  rawEntities[entity] = raw;

  const target = {
    async filter(query, opts) {
      return readThrough(
        entity,
        () => rawRef.filter(query, opts),
        () => computeFilter(entity, query, opts),
        { skipCache: !!(opts && opts.fields) }
      );
    },
    async list(sort, limit) {
      return readThrough(
        entity,
        () => rawRef.list(sort, limit),
        () => computeList(entity, sort, limit),
        {}
      );
    },
    async get(id) {
      if (navigator.onLine) {
        try {
          const rec = await rawRef.get(id);
          if (rec && rec.id != null) await mergeCacheRecord(entity, rec);
          return rec;
        } catch (err) {
          const recs = await getCacheRecords(entity);
          const rec = recs.find((r) => String(r.id) === String(id));
          if (rec) return rec;
          throw err;
        }
      }
      const recs = await getCacheRecords(entity);
      return recs.find((r) => String(r.id) === String(id));
    },
    async count(query) {
      if (navigator.onLine) {
        try { return await rawRef.count(query); } catch (err) { return computeCount(entity, query); }
      }
      return computeCount(entity, query);
    },
    async aggregate(spec) {
      if (navigator.onLine) {
        try { return await rawRef.aggregate(spec); } catch (err) { return computeAggregate(entity, spec); }
      }
      return computeAggregate(entity, spec);
    },
    async create(data) {
      if (navigator.onLine) {
        const rec = await rawRef.create(data);
        if (rec && rec.id != null) await mergeCacheRecord(entity, rec);
        return rec;
      }
      return offlineCreate(entity, data);
    },
    async update(id, data) {
      if (navigator.onLine) {
        const rec = await rawRef.update(id, data);
        if (rec && rec.id != null) await mergeCacheRecord(entity, rec);
        return rec;
      }
      return offlineUpdate(entity, id, data);
    },
    async delete(id) {
      if (navigator.onLine) {
        const res = await rawRef.delete(id);
        await deleteCacheRecord(entity, id);
        return res;
      }
      return offlineDelete(entity, id);
    }
  };

  const wrapped = new Proxy(target, {
    get(t, prop) {
      if (prop in t) return t[prop];
      const v = rawRef[prop];
      return typeof v === 'function' ? v.bind(rawRef) : v;
    }
  });
  wrapped.__offlineWrapped = true;
  wrapped.__rawEntity = rawRef;
  return wrapped;
}

let initialized = false;

function initListeners() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  window.addEventListener('online', () => setOnline(true));
  window.addEventListener('offline', () => setOnline(false));
  refreshPending();
  if (navigator.onLine) flushOfflineOps();
  setInterval(() => {
    if (navigator.onLine) flushOfflineOps();
  }, 20000);
}

// The SDK's entity collection doesn't accept direct assignment, so instead of
// mutating it we return a proxied client whose .entities are offline-aware.
export function wrapEntitiesForOffline(client) {
  if (!client || !client.entities) return client;
  initListeners();
  const wrappedCache = new Map();
  const entitiesProxy = new Proxy({}, {
    get(_t, prop) {
      if (typeof prop === 'symbol') return Reflect.get(client.entities, prop);
      const raw = client.entities[prop];
      if (!raw || (typeof raw !== 'object' && typeof raw !== 'function')) return raw;
      if (EXCLUDED_ENTITIES.includes(String(prop))) return raw;
      if (!wrappedCache.has(prop)) {
        try {
          wrappedCache.set(prop, wrapEntity(String(prop), raw));
        } catch (e) {
          console.warn('[offline-sync] could not enable offline mode for', prop, e);
          wrappedCache.set(prop, raw);
        }
      }
      return wrappedCache.get(prop);
    },
    has(_t, prop) { return prop in client.entities; },
    ownKeys() { return Reflect.ownKeys(client.entities); },
    getOwnPropertyDescriptor(_t, prop) {
      const d = Reflect.getOwnPropertyDescriptor(client.entities, prop);
      return d ? { ...d, configurable: true } : undefined;
    }
  });
  return new Proxy(client, {
    get(t, prop) {
      if (prop === 'entities') return entitiesProxy;
      return t[prop];
    }
  });
}