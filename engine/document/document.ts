// Pure operations over a DesignDocument node tree (blueprint section 9).
// Kept framework-neutral so the renderer, editor and future code generator can share it.

import {
  DesignDocument,
  DesignNode,
  NodeLayout,
  NodeType,
} from "@/types/document";

function defaultsFor(type: NodeType): Pick<DesignNode, "props" | "style" | "layout" | "name"> {
  switch (type) {
    case "text":
      return {
        name: "Text",
        props: { text: "Text" },
        style: { color: "#171717", fontSize: 16, fontWeight: 400 },
        layout: { x: 40, y: 40, width: 160, height: 32 },
      };
    case "button":
      return {
        name: "Button",
        props: { text: "Button" },
        style: {
          backgroundColor: "#171717",
          color: "#ffffff",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 500,
          textAlign: "center",
        },
        layout: { x: 40, y: 40, width: 120, height: 40 },
      };
    case "image":
      return {
        name: "Image",
        props: { src: "", alt: "" },
        style: { backgroundColor: "#e4e4e7", borderRadius: 4 },
        layout: { x: 40, y: 40, width: 200, height: 140 },
      };
    case "container":
      return {
        name: "Container",
        props: {},
        style: { backgroundColor: "#f4f4f5", borderRadius: 8 },
        layout: { x: 40, y: 40, width: 320, height: 200 },
      };
    case "frame":
    default:
      return {
        name: "Frame",
        props: {},
        style: { backgroundColor: "#ffffff" },
        layout: { x: 0, y: 0, width: 400, height: 300 },
      };
  }
}

export function addNode(
  doc: DesignDocument,
  type: NodeType,
  parentId: string,
  layoutOverride?: Partial<NodeLayout>
): { doc: DesignDocument; id: string } {
  const id = crypto.randomUUID();
  const defaults = defaultsFor(type);
  const node: DesignNode = {
    id,
    type,
    parentId,
    children: [],
    name: defaults.name,
    props: defaults.props,
    style: defaults.style,
    layout: { ...defaults.layout, ...layoutOverride },
  };
  const parent = doc.nodes[parentId];
  const nodes = {
    ...doc.nodes,
    [id]: node,
    [parentId]: { ...parent, children: [...parent.children, id] },
  };
  return { doc: { ...doc, nodes }, id };
}

export function updateNode(
  doc: DesignDocument,
  id: string,
  patch: Partial<Pick<DesignNode, "name" | "props" | "style" | "layout">>
): DesignDocument {
  const node = doc.nodes[id];
  if (!node) return doc;
  const updated: DesignNode = {
    ...node,
    ...patch,
    props: { ...node.props, ...(patch.props ?? {}) },
    style: { ...node.style, ...(patch.style ?? {}) },
    layout: { ...node.layout, ...(patch.layout ?? {}) },
  };
  return { ...doc, nodes: { ...doc.nodes, [id]: updated } };
}

function collectDescendants(doc: DesignDocument, id: string, acc: string[]): void {
  const node = doc.nodes[id];
  if (!node) return;
  for (const childId of node.children) {
    acc.push(childId);
    collectDescendants(doc, childId, acc);
  }
}

export function removeNode(doc: DesignDocument, id: string): DesignDocument {
  const node = doc.nodes[id];
  if (!node || !node.parentId) return doc; // never remove the root
  const toRemove = [id];
  collectDescendants(doc, id, toRemove);
  const nodes = { ...doc.nodes };
  for (const rid of toRemove) delete nodes[rid];
  const parent = nodes[node.parentId];
  if (parent) {
    nodes[node.parentId] = {
      ...parent,
      children: parent.children.filter((cid) => cid !== id),
    };
  }
  return { ...doc, nodes };
}
