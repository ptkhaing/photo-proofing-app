import { selectionCounts } from '../types/photo';
import type { Photo } from '../types/photo';

interface SelectionBarProps {
  photos: readonly Photo[];
  onSubmit: () => void;
  submitted: boolean;
}

export function SelectionBar({ photos, onSubmit, submitted }: SelectionBarProps) {
  const counts = selectionCounts(photos);
  const reviewed = counts.selected + counts.rejected;

  return (
    <div className="selection-bar">
      <div className="selection-bar-counts">
        <strong>{counts.selected}</strong> selected · {reviewed}/{counts.total} reviewed
      </div>
      {submitted ? (
        <span className="selection-bar-submitted">Selections submitted ✓</span>
      ) : (
        <button
          className="selection-bar-submit"
          disabled={counts.selected === 0}
          onClick={onSubmit}
        >
          Submit selections
        </button>
      )}
    </div>
  );
}
