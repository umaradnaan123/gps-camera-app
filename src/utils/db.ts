import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export interface GeotaggedPhoto {
  id: string; // UUID or timestamp
  imageBlob: Blob;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  address?: string;
  houseNumber?: string;
  street?: string;
  area?: string;
  locality?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  mapsUrl: string;
  notes?: string;
  tags: string[];
  isFavorite: boolean;
  cameraMake?: string;
  cameraModel?: string;
  resolution?: string;
}

interface GeoTagDB extends DBSchema {
  photos: {
    key: string;
    value: GeotaggedPhoto;
    indexes: {
      'by-date': string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<GeoTagDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<GeoTagDB>('geotag-pro-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('photos', {
          keyPath: 'id',
        });
        store.createIndex('by-date', 'date');
      },
    });
  }
  return dbPromise;
}

export async function savePhoto(photo: GeotaggedPhoto): Promise<void> {
  const db = await getDB();
  await db.put('photos', photo);
}

export async function getAllPhotos(): Promise<GeotaggedPhoto[]> {
  const db = await getDB();
  return db.getAll('photos');
}

export async function getPhotoById(id: string): Promise<GeotaggedPhoto | undefined> {
  const db = await getDB();
  return db.get('photos', id);
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('photos', id);
}

export async function toggleFavorite(id: string): Promise<GeotaggedPhoto | undefined> {
  const db = await getDB();
  const photo = await db.get('photos', id);
  if (photo) {
    photo.isFavorite = !photo.isFavorite;
    await db.put('photos', photo);
    return photo;
  }
  return undefined;
}
