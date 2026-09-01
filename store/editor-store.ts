import { create } from "zustand";
import { Project, DesignNode, NodeType } from "@/types/document";
import { getProject, saveProject } from "@/lib/db/projects";
import { addNode, removeNode, updateNode } from "@/engine/document/document";

interface EditorState {
  project: Project | null;
  activePageId: string | null;
  selectedNodeId: string | null;
  status: "idle" | "loading" | "saving" | "saved" | "error";

  load: (projectId: string) => Promise<void>;
  selectPage: (pageId: string) => void;
  selectNode: (nodeId: string | null) => void;
  insertNode: (type: NodeType) => void;
  updateSelected: (patch: Partial<Pick<DesignNode, "name" | "props" | "style" | "layout">>) => void;
  deleteSelected: () => void;
  save: () => Promise<void>;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const useEditorStore = create<EditorState>((set, get) => ({
  project: null,
  activePageId: null,
  selectedNodeId: null,
  status: "idle",

  load: async (projectId: string) => {
    set({ status: "loading" });
    const project = await getProject(projectId);
    set({
      project,
      activePageId: project?.pages[0]?.id ?? null,
      selectedNodeId: null,
      status: project ? "saved" : "error",
    });
  },

  selectPage: (pageId) => set({ activePageId: pageId, selectedNodeId: null }),

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  insertNode: (type) => {
    const { project, activePageId, selectedNodeId } = get();
    if (!project || !activePageId) return;
    const pageIdx = project.pages.findIndex((p) => p.id === activePageId);
    if (pageIdx === -1) return;
    const page = project.pages[pageIdx];
    const selectedNode = selectedNodeId ? page.document.nodes[selectedNodeId] : null;
    const canContainChildren =
      selectedNode?.type === "frame" || selectedNode?.type === "container";
    const parentId = canContainChildren ? selectedNode!.id : page.document.rootId;
    const { doc, id } = addNode(page.document, type, parentId, {
      x: 40 + Math.round(Math.random() * 40),
      y: 40 + Math.round(Math.random() * 40),
    });
    const pages = [...project.pages];
    pages[pageIdx] = { ...page, document: doc };
    set({ project: { ...project, pages }, selectedNodeId: id });
    get().save();
  },

  updateSelected: (patch) => {
    const { project, activePageId, selectedNodeId } = get();
    if (!project || !activePageId || !selectedNodeId) return;
    const pageIdx = project.pages.findIndex((p) => p.id === activePageId);
    if (pageIdx === -1) return;
    const page = project.pages[pageIdx];
    const doc = updateNode(page.document, selectedNodeId, patch);
    const pages = [...project.pages];
    pages[pageIdx] = { ...page, document: doc };
    set({ project: { ...project, pages } });
    get().save();
  },

  deleteSelected: () => {
    const { project, activePageId, selectedNodeId } = get();
    if (!project || !activePageId || !selectedNodeId) return;
    const pageIdx = project.pages.findIndex((p) => p.id === activePageId);
    if (pageIdx === -1) return;
    const page = project.pages[pageIdx];
    const doc = removeNode(page.document, selectedNodeId);
    const pages = [...project.pages];
    pages[pageIdx] = { ...page, document: doc };
    set({ project: { ...project, pages }, selectedNodeId: null });
    get().save();
  },

  save: async () => {
    const { project } = get();
    if (!project) return;
    set({ status: "saving" });
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      const current = get().project;
      if (!current) return;
      await saveProject(current);
      set({ status: "saved" });
    }, 400);
  },
}));
