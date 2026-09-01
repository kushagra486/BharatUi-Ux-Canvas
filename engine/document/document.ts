// Pure operations over a DesignDocument node tree (blueprint section 9).
// Kept framework-neutral so the renderer, editor and future code generator can share it.

import {
  Breakpoint,
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
): DesignDocument {
  const node = doc.nodes[id];
  if (!node) return doc;
  const updated: DesignNode = {
    ...node,
    ...patch,
    props: { ...node.props, ...(patch.props ?? {}) },
    style: { ...node.style, ...(patch.style ?? {}) },
    layout: { ...node.layout, ...(patch.layout ?? {}) },
    responsive: patch.responsive ?? node.responsive,
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

/** Merges a node's per-breakpoint overrides (blueprint 5.4 responsive layout) on top of its base layout/style. */
export function resolveNode(node: DesignNode, breakpoint: Breakpoint): DesignNode {
  if (breakpoint === "desktop") return node;
  const o = node.responsive?.[breakpoint];
  if (!o) return node;
  return {
    ...node,
    layout: {
      x: o.x ?? node.layout.x,
      y: o.y ?? node.layout.y,
      width: o.width ?? node.layout.width,
      height: o.height ?? node.layout.height,
    },
    style: {
      backgroundColor: o.backgroundColor ?? node.style.backgroundColor,
      color: o.color ?? node.style.color,
      borderRadius: o.borderRadius ?? node.style.borderRadius,
      borderWidth: o.borderWidth ?? node.style.borderWidth,
      borderColor: o.borderColor ?? node.style.borderColor,
      opacity: o.opacity ?? node.style.opacity,
      fontSize: o.fontSize ?? node.style.fontSize,
      fontWeight: o.fontWeight ?? node.style.fontWeight,
      textAlign: o.textAlign ?? node.style.textAlign,
    },
  };
}

/** Finds the first text-bearing node in a document, depth-first from the root. Used to target the one node an instance override applies to. */
export function findFirstTextNodeId(doc: DesignDocument): string | null {
  function walk(id: string): string | null {
    const node = doc.nodes[id];
    if (!node) return null;
    if (node.type === "text" || node.type === "button") return id;
    for (const childId of node.children) {
      const found = walk(childId);
      if (found) return found;
    }
    return null;
  }
  return walk(doc.rootId);
}

/** Deep-clones a node subtree into a standalone document, for use as a component definition (blueprint 5.14). */
export function extractComponentDocument(doc: DesignDocument, nodeId: string): DesignDocument {
  const ids = [nodeId];
  collectDescendants(doc, nodeId, ids);
  const nodes: Record<string, DesignNode> = {};
  for (const id of ids) {
    nodes[id] = { ...doc.nodes[id] };
  }
  nodes[nodeId] = { ...nodes[nodeId], parentId: null };
  return { rootId: nodeId, nodes };
}

/** Replaces a node (and drops its descendants from the page document) with a component instance in the same place. */
export function convertToComponentInstance(
  doc: DesignDocument,
  nodeId: string,
  componentId: string
): DesignDocument {
  const node = doc.nodes[nodeId];
  if (!node) return doc;
  const descendants: string[] = [];
  collectDescendants(doc, nodeId, descendants);
  const nodes = { ...doc.nodes };
  for (const id of descendants) delete nodes[id];
  nodes[nodeId] = {
    ...node,
    type: "instance",
    componentId,
    children: [],
    overrideText: undefined,
  };
  return { ...doc, nodes };
}

/** Adds a new instance of a component definition as a child of `parentId`. */
export function addComponentInstance(
  doc: DesignDocument,
  component: { id: string; name: string; document: DesignDocument },
  parentId: string,
  layoutOverride?: Partial<NodeLayout>
): { doc: DesignDocument; id: string } {
  const id = crypto.randomUUID();
  const defRoot = component.document.nodes[component.document.rootId];
  const node: DesignNode = {
    id,
    type: "instance",
    parentId,
    children: [],
    name: component.name,
    props: {},
    style: {},
    layout: { ...defRoot.layout, x: 0, y: 0, ...layoutOverride },
    componentId: component.id,
  };
  const parent = doc.nodes[parentId];
  const nodes = {
    ...doc.nodes,
    [id]: node,
    [parentId]: { ...parent, children: [...parent.children, id] },
  };
  return { doc: { ...doc, nodes }, id };
}

/** Converts an instance back into an editable, standalone subtree (undoes convertToComponentInstance). */
export function detachInstance(
  doc: DesignDocument,
  instanceId: string,
  definitionDoc: DesignDocument,
  overrideText?: string
): DesignDocument {
  const instance = doc.nodes[instanceId];
  if (!instance) return doc;
  const overrideTargetId = overrideText ? findFirstTextNodeId(definitionDoc) : null;

  const idMap: Record<string, string> = { [definitionDoc.rootId]: instanceId };
  for (const id of Object.keys(definitionDoc.nodes)) {
    if (id !== definitionDoc.rootId) idMap[id] = crypto.randomUUID();
  }

  const nodes = { ...doc.nodes };
  for (const [oldId, defNode] of Object.entries(definitionDoc.nodes)) {
    const newId = idMap[oldId];
    const props =
      oldId === overrideTargetId ? { ...defNode.props, text: overrideText } : defNode.props;
    nodes[newId] = {
      ...defNode,
      id: newId,
      parentId: oldId === definitionDoc.rootId ? instance.parentId : idMap[defNode.parentId!],
      children: defNode.children.map((childId) => idMap[childId]),
      props,
    };
  }
  // Keep the instance's own canvas position/size rather than the definition's stored layout.
  nodes[instanceId] = { ...nodes[instanceId], layout: instance.layout };
  return { ...doc, nodes };
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
