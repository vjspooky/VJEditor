import { useRef, useState } from "react";

interface UploadAreaProps {
  onUpload: (files: File[]) => void;
}

export default function UploadArea({ onUpload }: UploadAreaProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) onUpload(files);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) onUpload(files);
    e.target.value = "";
  }

  return (
    <div
      id="media-upload-area"
      role="button"
      tabIndex={0}
      aria-label="Upload media files"
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      style={{
        margin: "10px",
        borderRadius: "var(--radius-md)",
        border: `2px dashed ${dragging ? "var(--color-primary)" : "var(--color-border)"}`,
        background: dragging ? "rgba(108,99,255,0.08)" : "transparent",
        padding: "14px",
        textAlign: "center",
        cursor: "pointer",
        transition: "border-color var(--transition-fast), background var(--transition-fast)",
        fontSize: "0.78rem",
        color: "var(--color-text-muted)",
      }}
    >
      <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>📁</div>
      Click or drag files here
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="video/*,image/*,audio/*"
        style={{ display: "none" }}
        onChange={handleChange}
      />
    </div>
  );
}
