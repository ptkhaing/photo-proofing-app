import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGalleryStore } from '../data/galleryStore';
import { PhotoGrid } from '../components/PhotoGrid';
import { Lightbox } from '../components/Lightbox';
import { selectionCounts } from '../types/photo';
import type { Photo } from '../types/photo';
import { downloadPhotosAsZip } from '../data/downloadZip';

type DownloadState =
  | { kind: 'idle' }
  | { kind: 'zipping'; done: number; total: number }
  | { kind: 'error'; message: string };

export function PhotographerResults() {
  const { slug } = useParams<{ slug: string }>();
  const { getBySlug } = useGalleryStore();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [download, setDownload] = useState<DownloadState>({ kind: 'idle' });

  const gallery = slug ? getBySlug(slug) : undefined;

  if (!gallery) {
    return (
      <div className="page page-empty">
        <p>No gallery found for this link.</p>
        <Link to="/">Back to dashboard</Link>
      </div>
    );
  }

  const counts = selectionCounts(gallery.photos);
  const selectedPhotos = gallery.photos.filter((p) => p.status === 'selected');

  const handleDownloadZip = async () => {
    setDownload({ kind: 'zipping', done: 0, total: selectedPhotos.length });
    try {
      const zipName = `${gallery.slug}-selects.zip`;
      await downloadPhotosAsZip(selectedPhotos, zipName, ({ done, total }) =>
        setDownload({ kind: 'zipping', done, total })
      );
      setDownload({ kind: 'idle' });
    } catch (err) {
      setDownload({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Download failed.',
      });
    }
  };

  return (
    <div className="page page-results">
      <header className="page-header">
        <Link to="/" className="back-link">
          ← All galleries
        </Link>
        <h1>{gallery.title}</h1>
        <p className="muted">
          {gallery.review.kind === 'submitted'
            ? `Client submitted final selects — ${counts.selected} of ${counts.total} photos.`
            : `In progress — ${counts.selected} selected, ${counts.pending} not yet reviewed.`}
        </p>
      </header>

      {selectedPhotos.length === 0 ? (
        <p className="empty-state">No selections yet.</p>
      ) : (
        <>
          <div className="results-toolbar">
            <button
              type="button"
              className="primary-button"
              onClick={handleDownloadZip}
              disabled={download.kind === 'zipping'}
            >
              {download.kind === 'zipping'
                ? `Zipping ${download.done}/${download.total}…`
                : `Download selects (.zip)`}
            </button>
            {download.kind === 'error' && (
              <p className="download-error">{download.message}</p>
            )}
          </div>

          <PhotoGrid photos={selectedPhotos} interactive={false} onOpen={setOpenIndex} />
          <Lightbox<Photo>
            items={selectedPhotos}
            openIndex={openIndex}
            onClose={() => setOpenIndex(null)}
            onNavigate={setOpenIndex}
            getKey={(photo) => photo.id}
            renderItem={(photo) => <img src={photo.url} alt="" />}
            renderCaption={(photo) => photo.fileName}
          />
        </>
      )}
    </div>
  );
}
