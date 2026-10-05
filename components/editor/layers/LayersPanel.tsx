"use client";

import { useEditorStore } from "@/store/editor-store";
import { DesignDocument } from "@/types/document";

function LayerRow({
  nodeId,
  document,
  depth,
}: {
  nodeId: string;
  document: DesignDocument;
  depth: number;
}) {
  const node = document.nodes[nodeId];
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectNode = useEditorStore((s) => s.selectNode);
  if (!node) return null;

  return (
    <div>
      <button
        onClick={() => selectNode(nodeId)}
        style={{ paddingLeft: 8 + depth * 14 }}
        className={`flex w-full cursor-pointer items-center gap-2 rounded-md py-1.5 pr-2 text-left text-sm transition-colors ${
          selectedNodeId === nodeId
            ? "bg-brand/15 text-brand"
            : "text-editor-foreground/80 hover:bg-white/5 hover:text-editor-foreground"
        }`}
      >
        <span className="truncate">{node.name}</span>
      </button>
      {node.children.map((childId) => (
        <LayerRow key={childId} nodeId={childId} document={document} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function LayersPanel() {
  const project = useEditorStore((s) => s.project);
  const activePageId = useEditorStore((s) => s.activePageId);
  const page = project?.pages.find((p) => p.id === activePageId);
  if (!page) return null;

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-editor p-2">
      <LayerRow nodeId={page.document.rootId} document={page.document} depth={0} />
    </div>
  );
}
