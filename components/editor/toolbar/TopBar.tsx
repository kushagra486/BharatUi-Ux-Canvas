"use client";

import Link from "next/link";
import { useEditorStore } from "@/store/editor-store";

export default function TopBar() {
  const project = useEditorStore((s) => s.project);
  const status = useEditorStore((s) => s.status);

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
      <div className="text-xs text-zinc-400">
        {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : ""}
      </div>
    </header>
  );
}
