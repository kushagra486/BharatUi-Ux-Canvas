"use client";

import { useEditorStore } from "@/store/editor-store";
import { NodeType } from "@/types/document";

const items: { type: NodeType; label: string }[] = [
  { type: "container", label: "Container" },
  { type: "text", label: "Text" },
  { type: "image", label: "Image" },
  { type: "button", label: "Button" },
];

export default function InsertToolbar() {
  const insertNode = useEditorStore((s) => s.insertNode);

  return (
    <aside className="flex w-44 flex-col gap-1 border-r border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="mb-1 px-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
        Insert
      </p>
      {items.map((item) => (
        <button
          key={item.type}
          onClick={() => insertNode(item.type)}
          className="rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          {item.label}
        </button>
      ))}
    </aside>
  );
}
