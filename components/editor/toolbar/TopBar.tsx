"use client";

import Link from "next/link";
import { useEditorStore } from "@/store/editor-store";
import { Breakpoint } from "@/types/document";

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

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          Bharat UI Canvas
        </Link>
        <span className="text-zinc-300 dark:text-zinc-700">/</span>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {project?.name ?? "Loading…"}
        </span>
      </div>

      <div className="flex items-center gap-1 rounded-md border border-zinc-200 p-0.5 dark:border-zinc-800">
        {breakpoints.map((bp) => (
          <button
            key={bp.id}
            onClick={() => setBreakpoint(bp.id)}
            className={`rounded px-2.5 py-1 text-xs font-medium ${
              activeBreakpoint === bp.id
                ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            {bp.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {project && (
          <Link
            href={`/preview/${project.id}`}
            target="_blank"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Preview
          </Link>
        )}
        <div className="w-14 text-right text-xs text-zinc-400">
          {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : ""}
        </div>
      </div>
    </header>
  );
}
