"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useEditorStore } from "@/store/editor-store";
import { Breakpoint, BREAKPOINT_WIDTHS } from "@/types/document";
import NodeView from "@/components/editor/canvas/NodeView";

function detectBreakpoint(width: number): Breakpoint {
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export default function PreviewPage() {
  const params = useParams<{ projectId: string }>();
  const load = useEditorStore((s) => s.load);
  const project = useEditorStore((s) => s.project);
  const status = useEditorStore((s) => s.status);
  const activeBreakpoint = useEditorStore((s) => s.activeBreakpoint);
  const setBreakpoint = useEditorStore((s) => s.setBreakpoint);
  const [pageId, setPageId] = useState<string | null>(null);

  useEffect(() => {
    if (params.projectId) load(params.projectId);
  }, [params.projectId, load]);

  useEffect(() => {
    function handleResize() {
      setBreakpoint(detectBreakpoint(window.innerWidth));
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setBreakpoint]);

  if (status === "loading" || status === "idle") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
        Loading…
      </div>
    );
  }

  if (status === "error" || !project) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
        Project not found.
      </div>
    );
  }

  const page = project.pages.find((p) => p.id === pageId) ?? project.pages[0];
  const root = page.document.nodes[page.document.rootId];
  const rootOverrideWidth = root.responsive?.[activeBreakpoint]?.width;
  const width =
    activeBreakpoint === "desktop"
      ? root.layout.width
      : (rootOverrideWidth ?? BREAKPOINT_WIDTHS[activeBreakpoint]);
  const effectiveRoot = { ...root, layout: { ...root.layout, width } };

  return (
    <div className="min-h-screen bg-zinc-100">
      {project.pages.length > 1 && (
        <div className="flex gap-1 border-b border-zinc-200 bg-white px-3 py-2">
          {project.pages.map((p) => (
            <button
              key={p.id}
              onClick={() => setPageId(p.id)}
              className={`rounded-md px-3 py-1 text-xs font-medium ${
                p.id === page.id
                  ? "bg-zinc-100 text-zinc-950"
                  : "text-zinc-500 hover:bg-zinc-50"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
      <div className="mx-auto bg-white" style={{ width: "100%", maxWidth: width }}>
        <NodeView
          node={effectiveRoot}
          document={page.document}
          isRoot
          readOnly
          onNavigate={setPageId}
        />
      </div>
    </div>
  );
}
