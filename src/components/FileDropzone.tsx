import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';

interface FileDropzoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

function isDuplicate(a: File, b: File): boolean {
  return a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
}

/**
 * Owns the object URL for exactly one file: creates it on mount, revokes it
 * on unmount. Keeping this per-item (rather than one big map at the parent)
 * means removing a file just unmounts its thumbnail — cleanup falls out of
 * React's own lifecycle instead of being tracked by hand.
 */
function FilePreviewThumbnail({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="dropzone-preview">
      {url && <img src={url} alt="" />}
      <button
        type="button"
        className="dropzone-remove"
        aria-label={`Remove ${file.name}`}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        ✕
      </button>
    </div>
  );
}

export function FileDropzone({ files, onFilesChange }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function addFiles(incoming: FileList | File[]) {
    const incomingImages = Array.from(incoming).filter((f) => f.type.startsWith('image/'));
    const merged = [...files];
    for (const file of incomingImages) {
      if (!merged.some((existing) => isDuplicate(existing, file))) {
        merged.push(file);
      }
    }
    onFilesChange(merged);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) addFiles(e.target.files);
    e.target.value = '';
  }

  function removeFile(index: number) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="dropzone-wrapper">
      <div
        className={`dropzone${isDragging ? ' dropzone-active' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          hidden
        />
        <p className="dropzone-label">
          {isDragging ? 'Drop photos here' : 'Drag photos here, or click to browse'}
        </p>
        {files.length > 0 && (
          <p className="dropzone-count">
            {files.length} photo{files.length === 1 ? '' : 's'} selected
          </p>
        )}
      </div>

      {files.length > 0 && (
        <div className="dropzone-previews">
          {files.map((file, index) => (
            <FilePreviewThumbnail
              key={`${file.name}-${file.lastModified}-${file.size}`}
              file={file}
              onRemove={() => removeFile(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
