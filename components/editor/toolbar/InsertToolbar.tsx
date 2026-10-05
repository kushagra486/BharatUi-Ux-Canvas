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
    <aside className="flex w-44 flex-col gap-1 border-r border-editor-border bg-editor p-3">
      <p className="mb-1 px-1 text-xs font-medium uppercase tracking-wide text-editor-muted">
        Insert
      </p>
      {items.map((item) => (
        <button
          key={item.type}
          onClick={() => insertNode(item.type)}
          className="cursor-pointer rounded-md px-3 py-2 text-left text-sm text-editor-foreground/80 transition-colors hover:bg-white/5 hover:text-editor-foreground"
        >
          {item.label}
        </button>
      ))}
    </aside>
  );
}
