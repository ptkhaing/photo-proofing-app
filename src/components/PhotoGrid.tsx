import type { Photo, SelectionStatus } from '../types/photo';

interface PhotoGridProps {
  photos: readonly Photo[];
  interactive: boolean;
  onOpen: (index: number) => void;
  onStatusChange?: ((photoId: string, status: SelectionStatus) => void) | undefined;
}

export function PhotoGrid({ photos, interactive, onOpen, onStatusChange }: PhotoGridProps) {
  return (
    <div className="photo-grid">
      {photos.map((photo, index) => (
        <figure
          key={photo.id}
          className={`photo-card photo-card-${photo.status}`}
        >
          <button
            className="photo-card-image"
            onClick={() => onOpen(index)}
            aria-label={`Open ${photo.fileName}`}
          >
            <img src={photo.url} alt="" loading="lazy" />
            {photo.status !== 'pending' && (
              <span className={`status-badge status-badge-${photo.status}`}>
                {photo.status === 'selected' ? 'Selected' : 'Passed'}
              </span>
            )}
          </button>

          {interactive && onStatusChange && (
            <div className="photo-card-actions">
              <button
                className={photo.status === 'rejected' ? 'is-active' : ''}
                onClick={() => onStatusChange(photo.id, 'rejected')}
                aria-label="Pass on this photo"
              >
                Pass
              </button>
              <button
                className={photo.status === 'selected' ? 'is-active' : ''}
                onClick={() => onStatusChange(photo.id, 'selected')}
                aria-label="Select this photo"
              >
                Select
              </button>
            </div>
          )}
        </figure>
      ))}
    </div>
  );
}
