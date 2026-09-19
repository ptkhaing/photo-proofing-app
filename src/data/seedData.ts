import type { Gallery, Photo } from '../types/photo';

function makeSeedPhoto(index: number): Photo {
  const seed = `proof-${index}`;
  return {
    id: crypto.randomUUID(),
    fileName: `IMG_${1000 + index}.jpg`,
    url: `https://picsum.photos/seed/${seed}/900/1200`,
    status: 'pending',
  };
}

export function createSeedGallery(): Gallery {
  return {
    id: crypto.randomUUID(),
    slug: 'nguyen-wedding-demo',
    title: 'Nguyen Wedding — Full Day Coverage',
    clientName: 'An & Minh Nguyen',
    createdAt: new Date().toISOString(),
    review: { kind: 'awaiting-client' },
    photos: Array.from({ length: 14 }, (_, i) => makeSeedPhoto(i)),
  };
}
