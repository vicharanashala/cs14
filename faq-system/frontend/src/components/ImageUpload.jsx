import { useState, useRef, useCallback } from "react";
import { X, Upload, ImageIcon, Loader } from "lucide-react";
import api from "../api/axios";
import { toast } from "./Toast";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const MAX_FILES = 5;
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageUpload({ images, onImagesChange, disabled }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const inputRef = useRef(null);

  // ─── Validate a single file ─────────────────────────────────
  const validateFile = (file) => {
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      toast({ type: "error", message: `${file.name}: Unsupported format. Use JPG, PNG, WEBP, or GIF.` });
      return false;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ type: "error", message: `${file.name}: Invalid MIME type detected.` });
      return false;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast({ type: "error", message: `${file.name}: Exceeds ${MAX_SIZE_MB} MB limit (${formatBytes(file.size)}).` });
      return false;
    }
    return true;
  };

  // ─── Upload validated files to backend ──────────────────────
  const uploadFiles = async (files) => {
    const remaining = MAX_FILES - images.length;
    if (files.length > remaining) {
      toast({ type: "warning", message: `Only ${remaining} more image(s) allowed (max ${MAX_FILES}).` });
      files = Array.from(files).slice(0, remaining);
    }

    const valid = Array.from(files).filter(validateFile);
    if (!valid.length) return;

    setUploading(true);
    setProgress(10);

    try {
      const form = new FormData();
      valid.forEach((f) => form.append("images", f));

      // Simulate progress
      const tick = setInterval(() => setProgress((p) => Math.min(p + 20, 80)), 200);

      const res = await api.post("/discussions/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(tick);
      setProgress(100);

      const uploaded = res.data.images || [];
      onImagesChange([...images, ...uploaded]);
      toast({ type: "success", message: `${uploaded.length} image(s) uploaded successfully.` });
    } catch (err) {
      toast({ type: "error", message: err.response?.data?.message || "Upload failed. Please try again." });
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  // ─── Drag handlers ──────────────────────────────────────────
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  }, [disabled]);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const files = e.dataTransfer.files;
    if (files.length) uploadFiles(files);
  }, [disabled, images]);

  const onInputChange = (e) => {
    const files = e.target.files;
    if (files.length) uploadFiles(files);
  };

  // ─── Remove an image ────────────────────────────────────────
  const removeImage = (idx) => {
    onImagesChange(images.filter((_, i) => i !== idx));
  };

  const canAddMore = images.length < MAX_FILES && !disabled;

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {canAddMore && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer
            transition-all duration-200 select-none
            ${dragging
              ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary-light))]"
              : "border-[rgb(var(--border-strong))] bg-[rgb(var(--bg-base))] hover:border-[rgb(var(--color-primary))] hover:bg-[rgb(var(--bg-hover))]"
            }
            ${uploading ? "opacity-70 cursor-wait" : ""}
          `}
          style={{ minHeight: "96px" }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.gif"
            multiple
            onChange={onInputChange}
            className="hidden"
            disabled={disabled || uploading}
          />

          {uploading ? (
            <>
              <Loader size={20} className="text-[rgb(var(--color-primary))] animate-spin" />
              <span className="text-xs text-[rgb(var(--text-secondary))]">
                Uploading... {progress}%
              </span>
              {/* Progress bar */}
              <div className="w-3/4 h-1.5 bg-[rgb(var(--bg-hover))] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[rgb(var(--color-primary))] transition-all duration-200 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Upload size={16} className="text-[rgb(var(--text-tertiary))]" />
                <span className="text-xs font-semibold text-[rgb(var(--text-secondary))]">
                  Drag & drop images here
                </span>
              </div>
              <span className="text-[10px] text-[rgb(var(--text-tertiary))]">
                or click to browse · JPG, PNG, WEBP, GIF · max {MAX_SIZE_MB} MB each · up to {MAX_FILES} images
              </span>
            </>
          )}
        </div>
      )}

      {/* Image preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {images.map((img, idx) => (
            <div
              key={img.filename || idx}
              className="group relative aspect-square rounded-xl overflow-hidden border border-[rgb(var(--border-default))] bg-[rgb(var(--bg-hover))] shadow-sm"
            >
              <img
                src={`http://localhost:5000/discussions/uploads/${img.filename}`}
                alt={img.originalName || "uploaded"}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setLightboxSrc(`http://localhost:5000/discussions/uploads/${img.filename}`)}
                onError={(e) => { e.target.src = ""; e.target.className = "hidden"; }}
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X size={12} />
                </button>
              </div>
              {/* File size badge */}
              <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 py-0.5 rounded">
                {formatBytes(img.size)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Remaining slots hint */}
      {!disabled && images.length > 0 && images.length < MAX_FILES && (
        <p className="text-[10px] text-[rgb(var(--text-tertiary))]">
          {MAX_FILES - images.length} image slot(s) remaining
        </p>
      )}

      {/* Lightbox modal */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            onClick={() => setLightboxSrc(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
          <img
            src={lightboxSrc}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}