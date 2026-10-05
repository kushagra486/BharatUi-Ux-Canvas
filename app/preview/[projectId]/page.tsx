"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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
      <div className="flex min-h-screen items-center justify-center text-sm text-editor-muted">
        Loading…
      </div>
    );
  }

  if (status === "error" || !project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-editor-muted">
        Project not found.
        <Link href="/dashboard" className="font-medium text-violet-400 hover:text-violet-300">
          Back to dashboard
        </Link>
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
    <div className="min-h-screen bg-slate-200">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-editor-border bg-editor px-3 py-2">
        <Link
          href={`/editor/${project.id}`}
          className="rounded-md px-2 py-1 text-xs font-medium text-editor-muted transition-colors hover:bg-white/5 hover:text-editor-foreground"
        >
          ← Back to editor
        </Link>
        <span className="truncate text-xs text-editor-foreground">{project.name}</span>
        {project.pages.length > 1 && (
          <nav aria-label="Pages" className="ml-auto flex gap-1 overflow-x-auto">
            {project.pages.map((p) => (
              <button
                key={p.id}
                onClick={() => setPageId(p.id)}
                aria-current={p.id === page.id ? "page" : undefined}
                className={`cursor-pointer whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  p.id === page.id
                    ? "bg-brand text-brand-foreground"
                    : "text-editor-muted hover:bg-white/5 hover:text-editor-foreground"
                }`}
              >
                {p.name}
              </button>
            ))}
          </nav>
        )}
      </div>
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
