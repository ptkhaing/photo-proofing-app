import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react';
import type { Gallery, Photo, SelectionStatus } from '../types/photo';
import { createSeedGallery } from './seedData';

const STORAGE_KEY = 'photo-proofing:galleries';

type Action =
  | { type: 'CREATE_GALLERY'; gallery: Gallery }
  | {
      type: 'SET_PHOTO_STATUS';
      galleryId: string;
      photoId: string;
      status: SelectionStatus;
    }
  | { type: 'SUBMIT_GALLERY'; galleryId: string }
  | { type: 'DELETE_GALLERY'; galleryId: string };

function reducer(state: Gallery[], action: Action): Gallery[] {
  switch (action.type) {
    case 'CREATE_GALLERY':
      return [action.gallery, ...state];

    case 'SET_PHOTO_STATUS':
      return state.map((gallery) => {
        if (gallery.id !== action.galleryId) return gallery;
        return {
          ...gallery,
          review: { kind: 'in-review' },
          photos: gallery.photos.map((photo) =>
            photo.id === action.photoId
              ? { ...photo, status: action.status }
              : photo
          ),
        };
      });

    case 'SUBMIT_GALLERY':
      return state.map((gallery) =>
        gallery.id === action.galleryId
          ? {
              ...gallery,
              review: { kind: 'submitted', submittedAt: new Date().toISOString() },
            }
          : gallery
      );

    case 'DELETE_GALLERY':
      return state.filter((gallery) => gallery.id !== action.galleryId);

    default:
      return state;
  }
}

function loadInitialState(): Gallery[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Gallery[];
  } catch {
    // Corrupt or unavailable storage — fall through to seed data.
  }
  return [createSeedGallery()];
}

interface GalleryStoreValue {
  galleries: readonly Gallery[];
  createGallery: (title: string, clientName: string, photos: Photo[]) => Gallery;
  setPhotoStatus: (galleryId: string, photoId: string, status: SelectionStatus) => void;
  submitGallery: (galleryId: string) => void;
  deleteGallery: (galleryId: string) => void;
  getBySlug: (slug: string) => Gallery | undefined;
}

const GalleryStoreContext = createContext<GalleryStoreValue | null>(null);

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${base || 'gallery'}-${Math.random().toString(36).slice(2, 7)}`;
}

export function GalleryStoreProvider({ children }: { children: ReactNode }) {
  const [galleries, dispatch] = useReducer(reducer, undefined, loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(galleries));
    } catch {
      // Storage full (e.g. large object-URL-backed uploads) — non-fatal for the demo.
    }
  }, [galleries]);

  const value: GalleryStoreValue = {
    galleries,
    createGallery: (title, clientName, photos) => {
      const gallery: Gallery = {
        id: crypto.randomUUID(),
        slug: slugify(title),
        title,
        clientName,
        createdAt: new Date().toISOString(),
        review: { kind: 'awaiting-client' },
        photos,
      };
      dispatch({ type: 'CREATE_GALLERY', gallery });
      return gallery;
    },
    setPhotoStatus: (galleryId, photoId, status) =>
      dispatch({ type: 'SET_PHOTO_STATUS', galleryId, photoId, status }),
    submitGallery: (galleryId) => dispatch({ type: 'SUBMIT_GALLERY', galleryId }),
    deleteGallery: (galleryId) => dispatch({ type: 'DELETE_GALLERY', galleryId }),
    getBySlug: (slug) => galleries.find((g) => g.slug === slug),
  };

  return (
    <GalleryStoreContext.Provider value={value}>
      {children}
    </GalleryStoreContext.Provider>
  );
}

export function useGalleryStore(): GalleryStoreValue {
  const ctx = useContext(GalleryStoreContext);
  if (!ctx) {
    throw new Error('useGalleryStore must be used within a GalleryStoreProvider');
  }
  return ctx;
}
