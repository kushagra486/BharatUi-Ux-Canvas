import { create } from "zustand";
import {
  Project,
  DesignNode,
  NodeType,
  Page,
  createPage,
  DesignDocument,
  Breakpoint,
} from "@/types/document";
import { getProject, saveProject } from "@/lib/db/projects";
import {
  addComponentInstance,
  addNode,
  convertToComponentInstance,
  detachInstance,
  extractComponentDocument,
  removeNode,
  updateNode,
} from "@/engine/document/document";

const HISTORY_LIMIT = 50;
// Continuous edits (dragging, resizing, typing) within this window collapse
// into a single undo step instead of one per pointermove/keystroke.
const CONTINUOUS_HISTORY_THROTTLE_MS = 500;

interface EditorState {
  project: Project | null;
  activePageId: string | null;
  selectedNodeId: string | null;
  activeBreakpoint: Breakpoint;
  status: "idle" | "loading" | "saving" | "saved" | "error";
  past: Project[];
  future: Project[];

  load: (projectId: string) => Promise<void>;
  selectPage: (pageId: string) => void;
  setBreakpoint: (bp: Breakpoint) => void;
  addPage: () => void;
  renamePage: (pageId: string, name: string) => void;
  deletePage: (pageId: string) => void;
  selectNode: (nodeId: string | null) => void;
  insertNode: (type: NodeType) => void;
  updateSelected: (
    patch: Partial<
      Pick<
        DesignNode,
        | "name"
        | "props"
        | "style"
        | "layout"
        | "autoLayout"
        | "responsive"
        | "overrideText"
        | "animations"
        | "onClickNavigateToPageId"
      >
    >
  ) => void;
  deleteSelected: () => void;
  createComponentFromSelection: () => void;
  insertComponentInstance: (componentId: string) => void;
  detachSelected: () => void;
  undo: () => void;
  redo: () => void;
  save: () => Promise<void>;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let lastContinuousHistoryPushAt = 0;

/** Records the current project onto the undo stack before a mutation, clearing redo. */
function pushHistory(
  get: () => EditorState,
  set: (patch: Partial<EditorState>) => void,
  options?: { continuous?: boolean }
): void {
  const { project, past } = get();
  if (!project) return;
  if (options?.continuous) {
    const now = Date.now();
    if (now - lastContinuousHistoryPushAt < CONTINUOUS_HISTORY_THROTTLE_MS) return;
    lastContinuousHistoryPushAt = now;
  }
  set({ past: [...past, project].slice(-HISTORY_LIMIT), future: [] });
}

/** Applies `fn` to the active page's document, writes the result back, and schedules a save. */
function withActivePageDocument(
  get: () => EditorState,
  set: (patch: Partial<EditorState>) => void,
  fn: (doc: DesignDocument, page: Page) => DesignDocument,
  options?: { continuous?: boolean }
): void {
  const { project, activePageId } = get();
  if (!project || !activePageId) return;
  const pageIdx = project.pages.findIndex((p) => p.id === activePageId);
  if (pageIdx === -1) return;
  const page = project.pages[pageIdx];
  const doc = fn(page.document, page);
  pushHistory(get, set, options);
  const pages = [...project.pages];
  pages[pageIdx] = { ...page, document: doc };
  set({ project: { ...project, pages } });
  get().save();
}

export const useEditorStore = create<EditorState>((set, get) => ({
  project: null,
  activePageId: null,
  selectedNodeId: null,
  activeBreakpoint: "desktop",
  status: "idle",
  past: [],
  future: [],

  load: async (projectId: string) => {
    set({ status: "loading" });
    const loaded = await getProject(projectId);
    // Older saved projects predate the components field; default it in.
    const project = loaded ? { ...loaded, components: loaded.components ?? [] } : null;
    set({
      project,
      activePageId: project?.pages[0]?.id ?? null,
      selectedNodeId: null,
      status: project ? "saved" : "error",
      past: [],
      future: [],
    });
  },

  selectPage: (pageId) => set({ activePageId: pageId, selectedNodeId: null }),

  setBreakpoint: (bp) => set({ activeBreakpoint: bp }),

  addPage: () => {
    const { project } = get();
    if (!project) return;
    pushHistory(get, set);
    const page = createPage(`Page ${project.pages.length + 1}`);
    set({
      project: { ...project, pages: [...project.pages, page] },
      activePageId: page.id,
      selectedNodeId: null,
    });
    get().save();
  },

  renamePage: (pageId, name) => {
    const { project } = get();
    if (!project) return;
    pushHistory(get, set);
    const pages = project.pages.map((p) => (p.id === pageId ? { ...p, name } : p));
    set({ project: { ...project, pages } });
    get().save();
  },

  deletePage: (pageId) => {
    const { project, activePageId } = get();
    if (!project || project.pages.length <= 1) return;
    pushHistory(get, set);
    const pages = project.pages.filter((p) => p.id !== pageId);
    const nextActive = activePageId === pageId ? pages[0].id : activePageId;
    set({ project: { ...project, pages }, activePageId: nextActive, selectedNodeId: null });
    get().save();
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  insertNode: (type) => {
    let insertedId: string | null = null;
    withActivePageDocument(get, set, (doc) => {
      const selectedNodeId = get().selectedNodeId;
      const selectedNode = selectedNodeId ? doc.nodes[selectedNodeId] : null;
      const canContainChildren =
        selectedNode?.type === "frame" || selectedNode?.type === "container";
      const parentId = canContainChildren ? selectedNode!.id : doc.rootId;
      const { doc: nextDoc, id } = addNode(doc, type, parentId, {
        x: 40 + Math.round(Math.random() * 40),
        y: 40 + Math.round(Math.random() * 40),
      });
      insertedId = id;
      return nextDoc;
    });
    if (insertedId) set({ selectedNodeId: insertedId });
  },

  updateSelected: (patch) => {
    const { selectedNodeId, activeBreakpoint } = get();
    if (!selectedNodeId) return;
    withActivePageDocument(
      get,
      set,
      (doc) => {
        const { layout, style, ...rest } = patch;
        let nextDoc = doc;
        if (Object.keys(rest).length > 0) {
          nextDoc = updateNode(nextDoc, selectedNodeId, rest);
        }
        if (!layout && !style) return nextDoc;
        if (activeBreakpoint === "desktop") {
          return updateNode(nextDoc, selectedNodeId, { layout, style });
        }
        // Non-desktop breakpoints write into the node's per-breakpoint override
        // instead of its base layout/style (blueprint 5.4 responsive layout).
        const node = nextDoc.nodes[selectedNodeId];
        const existing = node.responsive?.[activeBreakpoint] ?? {};
        const merged = { ...existing, ...layout, ...style };
        return updateNode(nextDoc, selectedNodeId, {
          responsive: { ...node.responsive, [activeBreakpoint]: merged },
        });
      },
      { continuous: true }
    );
  },

  deleteSelected: () => {
    const { selectedNodeId } = get();
    if (!selectedNodeId) return;
    withActivePageDocument(get, set, (doc) => removeNode(doc, selectedNodeId));
    set({ selectedNodeId: null });
  },

  createComponentFromSelection: () => {
    const { project, activePageId, selectedNodeId } = get();
    if (!project || !activePageId || !selectedNodeId) return;
    const pageIdx = project.pages.findIndex((p) => p.id === activePageId);
    if (pageIdx === -1) return;
    const page = project.pages[pageIdx];
    const node = page.document.nodes[selectedNodeId];
    if (!node || node.id === page.document.rootId || node.type === "instance") return;

    const definition = {
      id: crypto.randomUUID(),
      name: node.name,
      document: extractComponentDocument(page.document, selectedNodeId),
    };
    const doc = convertToComponentInstance(page.document, selectedNodeId, definition.id);
    pushHistory(get, set);
    const pages = [...project.pages];
    pages[pageIdx] = { ...page, document: doc };
    set({ project: { ...project, pages, components: [...project.components, definition] } });
    get().save();
  },

  insertComponentInstance: (componentId) => {
    let insertedId: string | null = null;
    withActivePageDocument(get, set, (doc) => {
      const component = get().project?.components.find((c) => c.id === componentId);
      if (!component) return doc;
      const selectedNodeId = get().selectedNodeId;
      const selectedNode = selectedNodeId ? doc.nodes[selectedNodeId] : null;
      const canContainChildren =
        selectedNode?.type === "frame" || selectedNode?.type === "container";
      const parentId = canContainChildren ? selectedNode!.id : doc.rootId;
      const { doc: nextDoc, id } = addComponentInstance(doc, component, parentId, {
        x: 40 + Math.round(Math.random() * 40),
        y: 40 + Math.round(Math.random() * 40),
      });
      insertedId = id;
      return nextDoc;
    });
    if (insertedId) set({ selectedNodeId: insertedId });
  },

  detachSelected: () => {
    const { selectedNodeId, project } = get();
    if (!selectedNodeId) return;
    withActivePageDocument(get, set, (doc) => {
      const node = doc.nodes[selectedNodeId];
      if (!node || node.type !== "instance" || !node.componentId) return doc;
      const definition = project?.components.find((c) => c.id === node.componentId);
      if (!definition) return doc;
      return detachInstance(doc, selectedNodeId, definition.document, node.overrideText);
    });
  },

  undo: () => {
    const { past, project, future, activePageId } = get();
    if (past.length === 0 || !project) return;
    const previous = past[past.length - 1];
    const pageStillExists = previous.pages.some((p) => p.id === activePageId);
    set({
      project: previous,
      past: past.slice(0, -1),
      future: [project, ...future],
      selectedNodeId: null,
      activePageId: pageStillExists ? activePageId : previous.pages[0].id,
    });
    get().save();
  },

  redo: () => {
    const { future, project, past, activePageId } = get();
    if (future.length === 0 || !project) return;
    const next = future[0];
    const pageStillExists = next.pages.some((p) => p.id === activePageId);
    set({
      project: next,
      future: future.slice(1),
      past: [...past, project],
      selectedNodeId: null,
      activePageId: pageStillExists ? activePageId : next.pages[0].id,
    });
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
