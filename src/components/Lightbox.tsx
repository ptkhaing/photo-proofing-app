import { useEffect, type ReactNode } from 'react';

interface LightboxProps<T> {
  items: readonly T[];
  openIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  renderCaption?: (item: T) => ReactNode;
}

/**
 * A generic lightbox: it knows nothing about photos specifically, only how
 * to open/close/navigate a list of `T`. The caller supplies rendering via
 * `renderItem`/`renderCaption`, so this same component could show a lightbox
 * over any media type without modification.
 */
export function Lightbox<T>({
  items,
  openIndex,
  onClose,
  onNavigate,
  getKey,
  renderItem,
  renderCaption,
}: LightboxProps<T>) {
  const isOpen = openIndex !== null;
  const current = isOpen ? items[openIndex] : undefined;

  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && openIndex !== null && openIndex < items.length - 1) {
        onNavigate(openIndex + 1);
      }
      if (e.key === 'ArrowLeft' && openIndex !== null && openIndex > 0) {
        onNavigate(openIndex - 1);
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, openIndex, items.length, onClose, onNavigate]);

  if (!isOpen || current === undefined || openIndex === null) return null;

  return (
    <div className="lightbox" role="dialog" aria-modal="true" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close">
        ✕
      </button>

      {openIndex > 0 && (
        <button
          className="lightbox-nav lightbox-nav-prev"
          aria-label="Previous photo"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(openIndex - 1);
          }}
        >
          ‹
        </button>
      )}

      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <div key={getKey(current)} className="lightbox-media">
          {renderItem(current)}
        </div>
        {renderCaption && <div className="lightbox-caption">{renderCaption(current)}</div>}
      </div>

      {openIndex < items.length - 1 && (
        <button
          className="lightbox-nav lightbox-nav-next"
          aria-label="Next photo"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(openIndex + 1);
          }}
        >
          ›
        </button>
      )}
    </div>
  );
}
