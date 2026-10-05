"use client";

import { useState } from "react";
import Link from "next/link";
import { useEditorStore } from "@/store/editor-store";
import { Breakpoint } from "@/types/document";
import ExportModal from "@/components/editor/export/ExportModal";

const breakpoints: { id: Breakpoint; label: string }[] = [
  { id: "desktop", label: "Desktop" },
  { id: "tablet", label: "Tablet" },
  { id: "mobile", label: "Mobile" },
];

export default function TopBar() {
  const project = useEditorStore((s) => s.project);
  const status = useEditorStore((s) => s.status);
  const activeBreakpoint = useEditorStore((s) => s.activeBreakpoint);
  const setBreakpoint = useEditorStore((s) => s.setBreakpoint);
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between border-b border-editor-border bg-editor px-4">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-sm font-semibold text-editor-foreground">
          Bharat UI Canvas
        </Link>
        <span className="text-white/15">/</span>
        <span className="text-sm text-editor-muted">{project?.name ?? "Loading…"}</span>
        <div className="ml-2 flex items-center gap-0.5">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="cursor-pointer rounded-md px-2 py-1 text-sm text-editor-muted transition-colors hover:bg-white/5 hover:text-editor-foreground disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
          >
            ↶
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            className="cursor-pointer rounded-md px-2 py-1 text-sm text-editor-muted transition-colors hover:bg-white/5 hover:text-editor-foreground disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
          >
            ↷
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-editor-border bg-editor-elevated p-0.5">
        {breakpoints.map((bp) => (
          <button
            key={bp.id}
            onClick={() => setBreakpoint(bp.id)}
            className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              activeBreakpoint === bp.id
                ? "bg-brand text-brand-foreground"
                : "text-editor-muted hover:text-editor-foreground"
            }`}
          >
            {bp.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {project && (
          <>
            <button
              onClick={() => setExportOpen(true)}
              className="cursor-pointer rounded-md border border-editor-border px-3 py-1.5 text-xs font-medium text-editor-foreground/90 transition-colors hover:border-brand/50 hover:bg-white/5"
            >
              Export
            </button>
            <Link
              href={`/preview/${project.id}`}
              target="_blank"
              className="cursor-pointer rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-brand-foreground transition-colors hover:bg-brand-hover"
            >
              Preview
            </Link>
          </>
        )}
        <div className="w-14 text-right text-xs text-editor-muted">
          {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : ""}
        </div>
      </div>

      {exportOpen && <ExportModal onClose={() => setExportOpen(false)} />}
    </header>
  );
}
