export type SelectionStatus = 'pending' | 'selected' | 'rejected';

export interface Photo {
  readonly id: string;
  readonly fileName: string;
  readonly url: string;
  readonly status: SelectionStatus;
}

/**
 * A gallery's review lifecycle, modeled as a discriminated union rather than
 * a loose boolean/string flag. Each branch carries exactly the data that's
 * valid for that state — e.g. `submittedAt` only exists once submitted.
 */
export type GalleryReviewState =
  | { readonly kind: 'awaiting-client' }
  | { readonly kind: 'in-review' }
  | { readonly kind: 'submitted'; readonly submittedAt: string };

export interface Gallery {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly clientName: string;
  readonly createdAt: string;
  readonly review: GalleryReviewState;
  readonly photos: readonly Photo[];
}

export function selectionCounts(photos: readonly Photo[]): {
  selected: number;
  rejected: number;
  pending: number;
  total: number;
} {
  return photos.reduce(
    (acc, photo) => {
      acc[photo.status] += 1;
      return acc;
    },
    { selected: 0, rejected: 0, pending: 0, total: photos.length }
  );
}
