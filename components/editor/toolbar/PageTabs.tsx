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
    <div className="flex h-10 items-center gap-1 border-b border-zinc-200 bg-white px-2 dark:border-zinc-800 dark:bg-zinc-950">
      {project.pages.map((page) => (
        <div
          key={page.id}
          className={`group flex items-center rounded-md ${
            page.id === activePageId
              ? "bg-zinc-100 dark:bg-zinc-900"
              : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
          }`}
        >
          <button
            onClick={() => selectPage(page.id)}
            onDoubleClick={() => {
              const name = window.prompt("Rename page", page.name);
              if (name) renamePage(page.id, name);
            }}
            title="Double-click to rename"
            className={`px-3 py-1.5 text-xs font-medium ${
              page.id === activePageId
                ? "text-zinc-950 dark:text-zinc-50"
                : "text-zinc-500"
            }`}
          >
            {page.name}
          </button>
          {project.pages.length > 1 && (
            <button
              onClick={() => deletePage(page.id)}
              title="Delete page"
              className="hidden pr-2 text-zinc-400 hover:text-red-600 group-hover:block"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        onClick={addPage}
        className="ml-1 rounded-md px-2 py-1.5 text-xs text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
      >
        + Page
      </button>
    </div>
  );
}
