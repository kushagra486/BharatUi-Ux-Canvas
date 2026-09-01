"use client";

import { useEditorStore } from "@/store/editor-store";
import { BREAKPOINT_WIDTHS } from "@/types/document";
import NodeView from "./NodeView";

export default function Canvas() {
  const project = useEditorStore((s) => s.project);
  const activePageId = useEditorStore((s) => s.activePageId);
  const activeBreakpoint = useEditorStore((s) => s.activeBreakpoint);
  const selectNode = useEditorStore((s) => s.selectNode);

  const page = project?.pages.find((p) => p.id === activePageId);
  if (!page) return null;
  const root = page.document.nodes[page.document.rootId];

  const rootOverrideWidth = root.responsive?.[activeBreakpoint]?.width;
  const width =
    activeBreakpoint === "desktop"
      ? root.layout.width
      : (rootOverrideWidth ?? BREAKPOINT_WIDTHS[activeBreakpoint]);
  const effectiveRoot = { ...root, layout: { ...root.layout, width } };

  return (
    <div
      className="flex flex-1 items-start justify-center overflow-auto bg-zinc-100 p-12 dark:bg-zinc-900"
      onPointerDown={() => selectNode(null)}
    >
      <div className="shadow-lg">
        <NodeView node={effectiveRoot} document={page.document} isRoot />
      </div>
    </div>
  );
}
