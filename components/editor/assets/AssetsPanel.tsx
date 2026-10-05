"use client";

import { useRef, useState } from "react";
import { useEditorStore } from "@/store/editor-store";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AssetsPanel() {
  const assets = useEditorStore((s) => s.project?.assets ?? []);
  const uploadAsset = useEditorStore((s) => s.uploadAsset);
  const deleteAsset = useEditorStore((s) => s.deleteAsset);
  const insertAssetImage = useEditorStore((s) => s.insertAssetImage);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setError(`"${file.name}" isn't an image — only images are supported right now.`);
        continue;
      }
      try {
        await uploadAsset(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-editor">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload images"
        className={`m-2 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed px-3 py-3 text-center text-xs transition-colors ${
          isDraggingOver
            ? "border-brand bg-brand/10 text-violet-300"
            : "border-editor-border text-editor-muted hover:border-brand/50 hover:text-editor-foreground"
        }`}
      >
        <span className="font-medium">Drop images here, or click to upload</span>
        <span className="text-[10px] opacity-70">PNG, JPG, SVG — up to 2MB</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p className="mx-2 mb-1 rounded-md bg-red-500/10 px-2 py-1 text-[11px] text-red-400">
          {error}
        </p>
      )}

      {assets.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-4 text-center text-xs text-editor-muted">
          No assets yet.
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-[repeat(auto-fill,minmax(88px,1fr))] content-start gap-2 overflow-auto px-2 pb-2">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="group relative flex flex-col overflow-hidden rounded-lg border border-editor-border bg-editor-elevated"
            >
              <button
                onClick={() => insertAssetImage(asset.id)}
                title={`Insert "${asset.name}"`}
                className="flex aspect-square w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden bg-black/20"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset.dataUrl} alt={asset.name} className="h-full w-full object-cover" />
              </button>
              <div className="px-1.5 py-1">
                <p className="truncate text-[10px] text-editor-foreground">{asset.name}</p>
                <p className="text-[9px] text-editor-muted">{formatBytes(asset.size)}</p>
              </div>
              <button
                onClick={() => deleteAsset(asset.id)}
                title="Delete asset"
                aria-label={`Delete "${asset.name}"`}
                className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-md bg-black/60 text-xs text-white hover:bg-red-600 group-focus-within:flex group-hover:flex"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
