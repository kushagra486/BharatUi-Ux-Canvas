"use client";

import { useEditorStore } from "@/store/editor-store";
import NodeView from "./NodeView";

export default function Canvas() {
  const project = useEditorStore((s) => s.project);
  const activePageId = useEditorStore((s) => s.activePageId);
  const selectNode = useEditorStore((s) => s.selectNode);

  const page = project?.pages.find((p) => p.id === activePageId);
  if (!page) return null;
  const root = page.document.nodes[page.document.rootId];

  return (
    <div
      className="flex flex-1 items-start justify-center overflow-auto bg-zinc-100 p-12 dark:bg-zinc-900"
      onPointerDown={() => selectNode(null)}
    >
      <div className="shadow-lg">
        <NodeView node={root} document={page.document} isRoot />
      </div>
    </div>
  );
}
