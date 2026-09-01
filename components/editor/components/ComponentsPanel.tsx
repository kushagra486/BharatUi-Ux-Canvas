"use client";

import { useEditorStore } from "@/store/editor-store";

export default function ComponentsPanel() {
  const components = useEditorStore((s) => s.project?.components ?? []);
  const insertComponentInstance = useEditorStore((s) => s.insertComponentInstance);

  if (components.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 text-center text-xs text-zinc-400">
        No components yet. Select an element and click &quot;Create component&quot; in
        Properties.
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-wrap content-start gap-2 overflow-auto p-2">
      {components.map((c) => (
        <button
          key={c.id}
          onClick={() => insertComponentInstance(c.id)}
          title={`Insert instance of ${c.name}`}
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-left text-sm text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
