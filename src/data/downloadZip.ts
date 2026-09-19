import JSZip from 'jszip';
import type { Photo } from '../types/photo';

export type ZipProgress = { done: number; total: number };

/**
 * Fetches each selected photo as a blob and packages them into a single
 * .zip, entirely client-side — there's no server to do this for us.
 * `onProgress` lets the caller show a "3 of 12" style indicator, since
 * fetching many full-size images can take a few seconds.
 */
export async function downloadPhotosAsZip(
  photos: readonly Photo[],
  zipFileName: string,
  onProgress?: (progress: ZipProgress) => void
): Promise<void> {
  const zip = new JSZip();
  let done = 0;

  for (const photo of photos) {
    const response = await fetch(photo.url);
    if (!response.ok) {
      throw new Error(`Couldn't fetch ${photo.fileName} (${response.status})`);
    }
    const blob = await response.blob();
    zip.file(photo.fileName, blob);
    done += 1;
    onProgress?.({ done, total: photos.length });
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = zipFileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
