import type { Gallery, Photo } from '../types/photo';

const PHOTO_COUNT = 13;

function makeSeedPhoto(index: number): Photo {
  const num = String(index + 1).padStart(2, '0');
  return {
    id: crypto.randomUUID(),
    fileName: `moe-johanna-${num}.jpg`,
    url: `/demo-photos/moe-johanna-${num}.jpg`,
    status: 'pending',
  };
}

export function createSeedGallery(): Gallery {
  return {
    id: crypto.randomUUID(),
    slug: 'moe-johanna-demo',
    title: 'Moe & Johanna Party',
    clientName: 'Moe & Johanna',
    createdAt: new Date().toISOString(),
    review: { kind: 'awaiting-client' },
    photos: Array.from({ length: PHOTO_COUNT }, (_, i) => makeSeedPhoto(i)),
  };
}
