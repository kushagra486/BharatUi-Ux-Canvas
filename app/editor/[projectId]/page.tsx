"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useRequireSession } from "@/lib/auth/use-session";
import { useEditorStore } from "@/store/editor-store";
import TopBar from "@/components/editor/toolbar/TopBar";
import InsertToolbar from "@/components/editor/toolbar/InsertToolbar";
import Canvas from "@/components/editor/canvas/Canvas";
import LayersPanel from "@/components/editor/layers/LayersPanel";
import PropertiesPanel from "@/components/editor/properties/PropertiesPanel";

export default function EditorPage() {
  const session = useRequireSession();
  const params = useParams<{ projectId: string }>();
  const load = useEditorStore((s) => s.load);
  const project = useEditorStore((s) => s.project);
  const status = useEditorStore((s) => s.status);
  const deleteSelected = useEditorStore((s) => s.deleteSelected);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);

  useEffect(() => {
    if (session && params.projectId) {
      load(params.projectId);
    }
  }, [session, params.projectId, load]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if ((e.key === "Backspace" || e.key === "Delete") && selectedNodeId) {
        e.preventDefault();
        deleteSelected();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodeId, deleteSelected]);

  if (!session) return null;

  if (status === "loading" || status === "idle") {
    return <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">Loading…</div>;
  }

  if (status === "error" || !project) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
        Project not found.
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <InsertToolbar />
        <Canvas />
        <PropertiesPanel />
      </div>
      <div className="flex h-40 border-t border-zinc-200 dark:border-zinc-800">
        <div className="w-full">
          <p className="border-b border-zinc-200 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
            Layers
          </p>
          <LayersPanel />
        </div>
      </div>
    </div>
  );
}
