"use client";

import { useMemo, useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { generateHtmlDocument } from "@/engine/export/html";

export default function ExportModal({ onClose }: { onClose: () => void }) {
  const project = useEditorStore((s) => s.project);
  const activePageId = useEditorStore((s) => s.activePageId);
  const [copied, setCopied] = useState(false);

  const page = project?.pages.find((p) => p.id === activePageId);

  const code = useMemo(() => {
    if (!project || !page) return "";
    return generateHtmlDocument(page, project.components, project.name, project.assets);
  }, [project, page]);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleDownload() {
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(page?.name ?? "page").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!project || !page) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-8"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-3xl flex-col rounded-xl border border-editor-border bg-editor shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-editor-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-editor-foreground">
              Export &quot;{page.name}&quot; — HTML/CSS
            </p>
            <p className="text-xs text-editor-muted">
              A self-contained static page. Click-triggered animations and click-navigate
              aren&apos;t included yet — they need JavaScript, which this export doesn&apos;t emit.
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-md px-2 py-1 text-sm text-editor-muted transition-colors hover:bg-white/5 hover:text-editor-foreground"
          >
            Close
          </button>
        </div>
        <pre className="flex-1 overflow-auto bg-black/30 p-4 text-xs text-editor-foreground/90">
          <code>{code}</code>
        </pre>
        <div className="flex justify-end gap-2 border-t border-editor-border px-4 py-3">
          <button
            onClick={handleCopy}
            className="cursor-pointer rounded-md border border-editor-border px-3 py-1.5 text-sm text-editor-foreground/90 transition-colors hover:border-brand/50 hover:bg-white/5"
          >
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="cursor-pointer rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-hover"
          >
            Download .html
          </button>
        </div>
      </div>
    </div>
  );
}
