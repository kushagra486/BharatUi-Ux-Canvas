"use client";

import { useEditorStore } from "@/store/editor-store";

export default function PageTabs() {
  const project = useEditorStore((s) => s.project);
  const activePageId = useEditorStore((s) => s.activePageId);
  const selectPage = useEditorStore((s) => s.selectPage);
  const addPage = useEditorStore((s) => s.addPage);
  const renamePage = useEditorStore((s) => s.renamePage);
  const deletePage = useEditorStore((s) => s.deletePage);

  if (!project) return null;

  return (
    <div className="flex h-10 items-center gap-1 border-b border-editor-border bg-editor px-2">
      {project.pages.map((page) => (
        <div
          key={page.id}
          className={`group flex items-center rounded-md transition-colors ${
            page.id === activePageId ? "bg-white/10" : "hover:bg-white/5"
          }`}
        >
          <button
            onClick={() => selectPage(page.id)}
            onDoubleClick={() => {
              const name = window.prompt("Rename page", page.name);
              if (name) renamePage(page.id, name);
            }}
            title="Double-click to rename"
            className={`cursor-pointer px-3 py-1.5 text-xs font-medium ${
              page.id === activePageId ? "text-editor-foreground" : "text-editor-muted"
            }`}
          >
            {page.name}
          </button>
          {project.pages.length > 1 && (
            <button
              onClick={() => deletePage(page.id)}
              title="Delete page"
              className="hidden cursor-pointer pr-2 text-editor-muted hover:text-red-400 group-hover:block"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        onClick={addPage}
        className="ml-1 cursor-pointer rounded-md px-2 py-1.5 text-xs text-editor-muted transition-colors hover:bg-white/5 hover:text-editor-foreground"
      >
        + Page
      </button>
    </div>
  );
}
