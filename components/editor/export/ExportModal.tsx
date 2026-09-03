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
    return generateHtmlDocument(page, project.components, project.name);
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
        className="flex h-full w-full max-w-3xl flex-col rounded-xl bg-white shadow-xl dark:bg-zinc-950"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div>
            <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              Export &quot;{page.name}&quot; — HTML/CSS
            </p>
            <p className="text-xs text-zinc-500">
              A self-contained static page. Click-triggered animations and click-navigate
              aren&apos;t included yet — they need JavaScript, which this export doesn&apos;t emit.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Close
          </button>
        </div>
        <pre className="flex-1 overflow-auto bg-zinc-50 p-4 text-xs text-zinc-800 dark:bg-black dark:text-zinc-200">
          <code>{code}</code>
        </pre>
        <div className="flex justify-end gap-2 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <button
            onClick={handleCopy}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="rounded-md bg-zinc-950 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Download .html
          </button>
        </div>
      </div>
    </div>
  );
}
