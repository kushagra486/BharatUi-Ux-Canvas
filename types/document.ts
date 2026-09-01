// Framework-neutral design document model (blueprint section 9).
// The same document powers the editor, preview renderer and (future) code generator.

export type NodeType =
  | "frame"
  | "container"
  | "text"
  | "image"
  | "button";

export interface NodeStyle {
  backgroundColor?: string;
  color?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  opacity?: number;
  fontSize?: number;
  fontWeight?: number;
  textAlign?: "left" | "center" | "right";
}

export interface NodeLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DesignNode {
  id: string;
  type: NodeType;
  parentId: string | null;
  children: string[];
  name: string;
  props: {
    text?: string;
    src?: string;
    alt?: string;
    href?: string;
  };
  style: NodeStyle;
  layout: NodeLayout;
  responsive?: Record<string, Partial<NodeLayout & NodeStyle>>;
  interactions?: unknown[];
  animations?: unknown[];
}

export interface DesignDocument {
  rootId: string;
  nodes: Record<string, DesignNode>;
}

export interface Page {
  id: string;
  name: string;
  document: DesignDocument;
}

export interface Project {
  id: string;
  ownerEmail: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  pages: Page[];
}

export function createEmptyDocument(): DesignDocument {
  const rootId = "root";
  return {
    rootId,
    nodes: {
      [rootId]: {
        id: rootId,
        type: "frame",
        parentId: null,
        children: [],
        name: "Page",
        props: {},
        style: { backgroundColor: "#ffffff" },
        layout: { x: 0, y: 0, width: 1280, height: 800 },
      },
    },
  };
}

export function createPage(name: string): Page {
  return {
    id: crypto.randomUUID(),
    name,
    document: createEmptyDocument(),
  };
}

export function createProject(ownerEmail: string, name: string): Project {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    ownerEmail,
    name,
    createdAt: now,
    updatedAt: now,
    pages: [createPage("Home")],
  };
}
