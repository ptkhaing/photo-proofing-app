import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGalleryStore } from '../data/galleryStore';
import { PhotoGrid } from '../components/PhotoGrid';
import { Lightbox } from '../components/Lightbox';
import { SelectionBar } from '../components/SelectionBar';
import type { Photo } from '../types/photo';

export function ClientGallery() {
  const { slug } = useParams<{ slug: string }>();
  const { getBySlug, setPhotoStatus, submitGallery } = useGalleryStore();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const gallery = slug ? getBySlug(slug) : undefined;

  if (!gallery) {
    return (
      <div className="page page-empty">
        <p>This gallery link doesn't exist, or the demo data was cleared.</p>
      </div>
    );
  }

  const submitted = gallery.review.kind === 'submitted';

  return (
    <div className="page page-client">
      <header className="page-header page-header-client">
        <p className="eyebrow-muted">Gallery for {gallery.clientName}</p>
        <h1>{gallery.title}</h1>
        <p>Click a photo to preview it, then mark your selects below.</p>
      </header>

      <PhotoGrid
        photos={gallery.photos}
        interactive={!submitted}
        onOpen={setOpenIndex}
        onStatusChange={
          submitted
            ? undefined
            : (photoId, status) => setPhotoStatus(gallery.id, photoId, status)
        }
      />

      <Lightbox<Photo>
        items={gallery.photos}
        openIndex={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
        getKey={(photo) => photo.id}
        renderItem={(photo) => <img src={photo.url} alt="" />}
        renderCaption={(photo) => (
          <div className="lightbox-caption-row">
            <span>{photo.fileName}</span>
            {!submitted && (
              <div className="lightbox-actions">
                <button
                  className={photo.status === 'rejected' ? 'is-active' : ''}
                  onClick={() => setPhotoStatus(gallery.id, photo.id, 'rejected')}
                >
                  Pass
                </button>
                <button
                  className={photo.status === 'selected' ? 'is-active' : ''}
                  onClick={() => setPhotoStatus(gallery.id, photo.id, 'selected')}
                >
                  Select
                </button>
              </div>
            )}
          </div>
        )}
      />

      <SelectionBar
        photos={gallery.photos}
        submitted={submitted}
        onSubmit={() => submitGallery(gallery.id)}
      />
    </div>
  );
}
