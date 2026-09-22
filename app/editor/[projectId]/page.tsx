"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useRequireSession } from "@/lib/auth/use-session";
import { useEditorStore } from "@/store/editor-store";
import TopBar from "@/components/editor/toolbar/TopBar";
import PageTabs from "@/components/editor/toolbar/PageTabs";
import InsertToolbar from "@/components/editor/toolbar/InsertToolbar";
import Canvas from "@/components/editor/canvas/Canvas";
import BottomPanel from "@/components/editor/layers/BottomPanel";
import PropertiesPanel from "@/components/editor/properties/PropertiesPanel";

export default function EditorPage() {
  const session = useRequireSession();
  const params = useParams<{ projectId: string }>();
  const load = useEditorStore((s) => s.load);
  const project = useEditorStore((s) => s.project);
  const status = useEditorStore((s) => s.status);
  const deleteSelected = useEditorStore((s) => s.deleteSelected);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  useEffect(() => {
    if (session && params.projectId) {
      load(params.projectId);
    }
  }, [session, params.projectId, load]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isTextInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (!isTextInput && (e.key === "Backspace" || e.key === "Delete") && selectedNodeId) {
        e.preventDefault();
        deleteSelected();
        return;
      }
      // Undo/redo stays global even while a properties field has focus — this is a
      // design tool, so Ctrl/Cmd+Z means "undo the last canvas change" the way
      // Figma/Sketch treat it, not "undo the last keystroke in this text field".
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (meta && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodeId, deleteSelected, undo, redo]);

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
      <PageTabs />
      <div className="flex flex-1 overflow-hidden">
        <InsertToolbar />
        <Canvas />
        <PropertiesPanel />
      </div>
      <div className="flex h-40 border-t border-zinc-200 dark:border-zinc-800">
        <BottomPanel />
      </div>
    </div>
  );
}
