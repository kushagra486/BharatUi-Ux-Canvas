// Framework-neutral design document model (blueprint section 9).
// The same document powers the editor, preview renderer and (future) code generator.

export type NodeType =
  | "frame"
  | "container"
  | "text"
  | "image"
  | "button"
  | "instance";

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

// When set on a frame/container, its children flow via flexbox instead of
// free-form x/y positioning (blueprint 5.4 "auto layout").
export interface AutoLayout {
  direction: "row" | "column";
  gap: number;
  padding: number;
  align: "start" | "center" | "end";
  justify: "start" | "center" | "end" | "between";
}

export type Breakpoint = "desktop" | "tablet" | "mobile";

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
  autoLayout?: AutoLayout;
  responsive?: Partial<Record<Breakpoint, Partial<NodeLayout & NodeStyle>>>;
  interactions?: unknown[];
  animations?: unknown[];
  // Only set when type === "instance": which component this node instantiates,
  // and an optional override for that component's primary text content
  // (blueprint 5.14 "component instances with override controls").
  componentId?: string;
  overrideText?: string;
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

// A reusable component definition (blueprint 5.14): a standalone snapshot of a
// node subtree that instances on any page can reference and lightly override.
export interface ComponentDefinition {
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
  components: ComponentDefinition[];
}

export const BREAKPOINT_WIDTHS: Record<Breakpoint, number> = {
  desktop: 1280,
  tablet: 834,
  mobile: 390,
};

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
    components: [],
  };
}
