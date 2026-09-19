import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useGalleryStore } from '../data/galleryStore';
import { CopyLinkButton } from '../components/CopyLinkButton';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FileDropzone } from '../components/FileDropzone';
import type { Gallery, Photo } from '../types/photo';

function filesToPhotos(files: File[]): Photo[] {
  return files.map((file) => ({
    id: crypto.randomUUID(),
    fileName: file.name,
    url: URL.createObjectURL(file),
    status: 'pending' as const,
  }));
}

export function PhotographerUpload() {
  const { galleries, createGallery, deleteGallery } = useGalleryStore();
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Gallery | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !clientName.trim() || files.length === 0) return;

    const gallery = createGallery(title.trim(), clientName.trim(), filesToPhotos(files));
    setCreatedSlug(gallery.slug);
    setTitle('');
    setClientName('');
    setFiles([]);
  }

  function confirmDelete() {
    if (pendingDelete) {
      deleteGallery(pendingDelete.id);
      setPendingDelete(null);
    }
  }

  return (
    <div className="page page-upload">
      <header className="page-header">
        <h1>Your galleries</h1>
        <p>Create a proofing gallery and send the client link — no account needed on their end.</p>
      </header>

      <form className="upload-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="title">Shoot title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="clientName">Client name</label>
          <input
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label>Photos</label>
          <FileDropzone files={files} onFilesChange={setFiles} />
        </div>

        <button type="submit" className="primary-button">
          Create gallery
        </button>
      </form>

      {createdSlug && (
        <p className="created-notice">
          Gallery created — <Link to={`/gallery/${createdSlug}`}>view client link</Link>{' '}
          <CopyLinkButton path={`/gallery/${createdSlug}`} />
        </p>
      )}

      <section className="gallery-list">
        <h2>All galleries</h2>
        {galleries.length === 0 && <p className="empty-state">No galleries yet.</p>}
        <ul>
          {galleries.map((gallery) => (
            <li key={gallery.id} className="gallery-list-item">
              <div>
                <strong>{gallery.title}</strong>
                <span className="muted"> for {gallery.clientName}</span>
              </div>
              <div className="gallery-list-links">
                <Link to={`/gallery/${gallery.slug}`}>Client link</Link>
                <CopyLinkButton path={`/gallery/${gallery.slug}`} />
                <Link to={`/results/${gallery.slug}`}>Results</Link>
                <button
                  type="button"
                  className="delete-link"
                  onClick={() => setPendingDelete(gallery)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {pendingDelete && (
        <ConfirmDialog
          title="Delete gallery?"
          message={`"${pendingDelete.title}" and its ${pendingDelete.photos.length} photo${pendingDelete.photos.length === 1 ? '' : 's'} will be permanently removed. This can't be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
