import React, { useRef, useState } from 'react';
import { Upload, CheckCircle, AlertCircle, X } from 'lucide-react';
import './FileUploader.css';

interface FileUploaderProps {
  accept: string;
  label: string;
  currentUrl?: string;
  onUpload: (file: File) => Promise<void>;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  accept, label, currentUrl, onUpload,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setProgress(0);
    setDone(false);
    setError(null);

    // Intercept progress updates from parent via a wrapped upload
    const originalOnUpload = onUpload;
    try {
      await originalOnUpload(file);
      setProgress(100);
      setDone(true);
    } catch {
      setError('Upload failed. Please try again.');
      setProgress(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setFileName(null);
    setProgress(null);
    setDone(false);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="file-uploader">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="file-uploader__input"
        onChange={handleInputChange}
      />

      {!fileName ? (
        <div
          className={`file-uploader__drop ${dragging ? 'file-uploader__drop--active' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <Upload size={22} className="file-uploader__icon" />
          <p className="file-uploader__label">
            <strong>Click to upload</strong> or drag and drop
          </p>
          <p className="file-uploader__hint">{label}</p>
          {currentUrl && (
            <p className="file-uploader__current">Current file already uploaded</p>
          )}
        </div>
      ) : (
        <div className={`file-uploader__progress-wrap ${done ? 'file-uploader__progress-wrap--done' : ''} ${error ? 'file-uploader__progress-wrap--error' : ''}`}>
          <div className="file-uploader__file-row">
            {done && <CheckCircle size={16} className="file-uploader__status-icon file-uploader__status-icon--done" />}
            {error && <AlertCircle size={16} className="file-uploader__status-icon file-uploader__status-icon--error" />}
            {!done && !error && <Upload size={16} className="file-uploader__status-icon" />}
            <span className="file-uploader__filename">{fileName}</span>
            <button type="button" className="file-uploader__clear" onClick={reset} title="Remove">
              <X size={14} />
            </button>
          </div>
          {progress !== null && !done && (
            <div className="file-uploader__bar-wrap">
              <div className="file-uploader__bar" style={{ width: `${progress}%` }} />
            </div>
          )}
          {error && <p className="file-uploader__error">{error}</p>}
          {done && <p className="file-uploader__success">Upload complete</p>}
        </div>
      )}
    </div>
  );
};
