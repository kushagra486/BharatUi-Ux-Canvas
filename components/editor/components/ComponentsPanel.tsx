"use client";

import { useEditorStore } from "@/store/editor-store";

export default function ComponentsPanel() {
  const components = useEditorStore((s) => s.project?.components ?? []);
  const insertComponentInstance = useEditorStore((s) => s.insertComponentInstance);

  if (components.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center bg-editor p-4 text-center text-xs text-editor-muted">
        No components yet. Select an element and click &quot;Create component&quot; in
        Properties.
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-wrap content-start gap-2 overflow-auto bg-editor p-2">
      {components.map((c) => (
        <button
          key={c.id}
          onClick={() => insertComponentInstance(c.id)}
          title={`Insert instance of ${c.name}`}
          className="cursor-pointer rounded-md border border-editor-border px-3 py-1.5 text-left text-sm text-editor-foreground/80 transition-colors hover:border-brand/50 hover:bg-white/5 hover:text-editor-foreground"
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
