/**
 * Persistent IndexedDB media and configuration storage.
 * Overcomes localStorage's 5MB quota limit and ensures uploaded
 * video files (.mp4, .webm) persist permanently across page refreshes.
 * Uses ArrayBuffer storage to guarantee cross-browser cloning stability.
 */

const DB_NAME = 'Sapotlokal_MediaDB_v4';
const DB_VERSION = 1;
const BLOB_STORE = 'media_blobs';
const CONFIG_STORE = 'app_config';

interface StoredBlobRecord {
  id: string;
  data?: ArrayBuffer;
  blob?: Blob;
  mimeType: string;
  name?: string;
  size?: number;
  updatedAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        db.createObjectStore(BLOB_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CONFIG_STORE)) {
        db.createObjectStore(CONFIG_STORE);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      dbPromise = null;
      reject(request.error || new Error('Failed opening IndexedDB'));
    };

    request.onblocked = () => {
      console.warn('[MediaDB] Database open blocked; please close other tabs.');
    };
  });

  return dbPromise;
}

/**
 * Saves a binary video or image Blob/File to IndexedDB as an ArrayBuffer.
 * ArrayBuffers are structured-clone safe across all browser versions.
 */
export async function saveMediaBlob(key: string, blobOrFile: Blob | File): Promise<void> {
  const db = await getDB();
  const buffer = await blobOrFile.arrayBuffer();

  const record: StoredBlobRecord = {
    id: key,
    data: buffer,
    mimeType: blobOrFile.type || 'video/mp4',
    name: (blobOrFile as File).name || 'video_asset.mp4',
    size: buffer.byteLength,
    updatedAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction([BLOB_STORE], 'readwrite');
      const store = tx.objectStore(BLOB_STORE);
      store.put(record);

      tx.oncomplete = () => {
        resolve();
      };
      tx.onerror = () => {
        console.error(`[MediaDB] Transaction error saving "${key}":`, tx.error);
        reject(tx.error);
      };
      tx.onabort = () => {
        console.error(`[MediaDB] Transaction aborted saving "${key}":`, tx.error);
        reject(tx.error || new Error('Transaction aborted'));
      };
    } catch (err) {
      console.error(`[MediaDB] Error starting save transaction for "${key}":`, err);
      reject(err);
    }
  });
}

/**
 * Retrieves a binary Blob from IndexedDB with fallback DB checks.
 */
export async function getMediaBlob(key: string): Promise<Blob | null> {
  const tryDB = (db: IDBDatabase, storeName: string, targetKey: string): Promise<Blob | null> => {
    return new Promise((resolve) => {
      try {
        if (!db.objectStoreNames.contains(storeName)) {
          resolve(null);
          return;
        }
        const tx = db.transaction([storeName], 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(targetKey);

        req.onsuccess = () => {
          const record = req.result as StoredBlobRecord | undefined;
          if (!record) {
            resolve(null);
            return;
          }
          if (record.data && record.data instanceof ArrayBuffer) {
            resolve(new Blob([record.data], { type: record.mimeType || 'video/mp4' }));
          } else if (record.blob && record.blob instanceof Blob) {
            resolve(record.blob);
          } else if (record instanceof Blob) {
            resolve(record);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
        tx.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  };

  try {
    const db = await getDB();
    // 1. Try exact key in current DB
    let result = await tryDB(db, BLOB_STORE, key);
    if (result) return result;

    // 2. Try alternative keys (e.g. without prefix or with prefix)
    const altKeys = [
      key.replace('portfolio_video_', ''),
      `portfolio_video_${key}`,
      key.replace('hero_video_blob', 'hero_video'),
      key.replace('hero_video', 'hero_video_blob'),
      key.replace('services_video_blob', 'services_video'),
      key.replace('services_video', 'services_video_blob'),
    ];
    for (const alt of altKeys) {
      if (alt !== key) {
        result = await tryDB(db, BLOB_STORE, alt);
        if (result) return result;
      }
    }

    // 3. Check older IndexedDB database versions
    const legacyDBs = [
      'Sapotlokal_MediaDB_v3',
      'Sapotlokal_MediaDB_v2',
      'Sapotlokal_MediaDB_v1',
      'Sapotlokal_MediaDB',
      'sapotlokal_cms_db',
    ];
    for (const legacyName of legacyDBs) {
      try {
        const legacyBlob = await new Promise<Blob | null>((resolve) => {
          const openReq = indexedDB.open(legacyName);
          openReq.onsuccess = async () => {
            const legDB = openReq.result;
            const stores = Array.from(legDB.objectStoreNames);
            for (const sName of stores) {
              const found = await tryDB(legDB, sName, key);
              if (found) {
                legDB.close();
                resolve(found);
                return;
              }
            }
            legDB.close();
            resolve(null);
          };
          openReq.onerror = () => resolve(null);
        });
        if (legacyBlob) {
          // Copy to current DB so it's preserved permanently
          saveMediaBlob(key, legacyBlob).catch(() => {});
          return legacyBlob;
        }
      } catch {}
    }
  } catch (err) {
    console.warn(`[MediaDB] Failed to retrieve media blob for "${key}":`, err);
  }
  return null;
}

/**
 * Searches all IndexedDB stores for ANY stored video blob (e.g. if the item key was changed).
 */
export async function findAnyUploadedVideoBlob(hintKey?: string): Promise<Blob | null> {
  try {
    const db = await getDB();
    if (!db.objectStoreNames.contains(BLOB_STORE)) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([BLOB_STORE], 'readonly');
        const store = tx.objectStore(BLOB_STORE);
        const req = store.openCursor();

        let matchedBlob: Blob | null = null;
        let firstVideoBlob: Blob | null = null;

        req.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
          if (!cursor) {
            resolve(matchedBlob || firstVideoBlob);
            return;
          }
          const rec = cursor.value as StoredBlobRecord;
          const isVideo = rec.mimeType?.startsWith('video/') || cursor.key.toString().includes('video');
          if (isVideo) {
            let blob: Blob | null = null;
            if (rec.data && rec.data instanceof ArrayBuffer) {
              blob = new Blob([rec.data], { type: rec.mimeType || 'video/mp4' });
            } else if (rec.blob && rec.blob instanceof Blob) {
              blob = rec.blob;
            } else if (cursor.value instanceof Blob) {
              blob = cursor.value;
            }

            if (blob) {
              if (hintKey && cursor.key.toString().includes(hintKey)) {
                matchedBlob = blob;
                resolve(matchedBlob);
                return;
              }
              if (!firstVideoBlob) {
                firstVideoBlob = blob;
              }
            }
          }
          cursor.continue();
        };

        req.onerror = () => resolve(firstVideoBlob);
        tx.onerror = () => resolve(firstVideoBlob);
      } catch {
        resolve(null);
      }
    });
  } catch {
    return null;
  }
}

/**
 * Retrieves metadata for a media blob without downloading the entire buffer.
 */
export async function getMediaBlobMeta(key: string): Promise<{ name?: string; size?: number; updatedAt?: number } | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([BLOB_STORE], 'readonly');
      const store = tx.objectStore(BLOB_STORE);
      const req = store.get(key);

      req.onsuccess = () => {
        const record = req.result as StoredBlobRecord | undefined;
        if (!record) {
          resolve(null);
          return;
        }
        resolve({
          name: record.name,
          size: record.size || (record.data ? record.data.byteLength : undefined),
          updatedAt: record.updatedAt,
        });
      };

      req.onerror = () => reject(req.error);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn(`[MediaDB] Failed to get media blob meta for "${key}":`, err);
    return null;
  }
}

/**
 * Deletes a binary Blob from IndexedDB.
 */
export async function deleteMediaBlob(key: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([BLOB_STORE], 'readwrite');
      const store = tx.objectStore(BLOB_STORE);
      store.delete(key);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch (err) {
    console.error(`[MediaDB] Failed to delete media blob for "${key}":`, err);
  }
}

/**
 * Saves arbitrary app configuration or state object in IndexedDB.
 */
export async function saveConfigToDB<T>(key: string, data: T): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([CONFIG_STORE], 'readwrite');
      const store = tx.objectStore(CONFIG_STORE);
      store.put(data, key);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch (err) {
    console.error(`[MediaDB] Failed to save config for "${key}":`, err);
  }
}

/**
 * Retrieves arbitrary app configuration or state object from IndexedDB.
 */
export async function getConfigFromDB<T>(key: string): Promise<T | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([CONFIG_STORE], 'readonly');
      const store = tx.objectStore(CONFIG_STORE);
      const req = store.get(key);

      req.onsuccess = () => {
        resolve(req.result !== undefined ? (req.result as T) : null);
      };
      req.onerror = () => reject(req.error);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error(`[MediaDB] Failed to read config for "${key}":`, err);
    return null;
  }
}
