// Static HTML/CSS export (blueprint 5.18 Code Generation).
//
// Produces a single self-contained .html file reproducing a page's layout,
// style, auto-layout, responsive breakpoints, and load/hover animations with
// plain CSS — no runtime JS dependency on the app.
//
// Known limitations (documented rather than faked): click-triggered
// animations and the on-click "navigate to page" interaction aren't
// representable as static per-page CSS, so they're omitted from export.

import {
  AnimatableProps,
  Breakpoint,
  ComponentDefinition,
  DesignDocument,
  DesignNode,
  Page,
} from "@/types/document";
import { detachInstance } from "@/engine/document/document";

function flattenInstances(doc: DesignDocument, components: ComponentDefinition[]): DesignDocument {
  let result = doc;
  for (let guard = 0; guard < 200; guard++) {
    const instance = Object.values(result.nodes).find(
      (n) => n.type === "instance" && n.componentId
    );
    if (!instance) break;
    const definition = components.find((c) => c.id === instance.componentId);
    if (!definition) break;
    result = detachInstance(result, instance.id, definition.document, instance.overrideText);
  }
  return result;
}

function className(id: string): string {
  return `n-${id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const JUSTIFY_MAP: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
};

const ALIGN_MAP: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
};

function transformFor(props: AnimatableProps): string | undefined {
  const parts: string[] = [];
  if (props.x !== undefined || props.y !== undefined) {
    parts.push(`translate(${props.x ?? 0}px, ${props.y ?? 0}px)`);
  }
  if (props.scale !== undefined) parts.push(`scale(${props.scale})`);
  if (props.rotate !== undefined) parts.push(`rotate(${props.rotate}deg)`);
  return parts.length > 0 ? parts.join(" ") : undefined;
}

function baseDecls(
  node: DesignNode,
  isRoot: boolean,
  inFlexParent: boolean,
  hoverFrom: AnimatableProps | undefined
): string[] {
  const decls: string[] = [];
  if (isRoot) {
    decls.push("position: relative");
    decls.push(`width: ${node.layout.width}px`);
    decls.push(`height: ${node.layout.height}px`);
  } else {
    decls.push(`position: ${inFlexParent ? "relative" : "absolute"}`);
    if (!inFlexParent) {
      decls.push(`left: ${node.layout.x}px`);
      decls.push(`top: ${node.layout.y}px`);
    } else {
      decls.push("flex-shrink: 0");
    }
    decls.push(`width: ${node.layout.width}px`);
    decls.push(`height: ${node.layout.height}px`);
    decls.push("display: flex");
    if (!node.autoLayout) {
      decls.push(`align-items: ${node.type === "button" ? "center" : "flex-start"}`);
      decls.push(
        `justify-content: ${
          node.style.textAlign === "center"
            ? "center"
            : node.style.textAlign === "right"
              ? "flex-end"
              : "flex-start"
        }`
      );
    }
  }
  if (node.autoLayout) {
    if (isRoot) decls.push("display: flex");
    decls.push(`flex-direction: ${node.autoLayout.direction}`);
    decls.push(`gap: ${node.autoLayout.gap}px`);
    decls.push(`padding: ${node.autoLayout.padding}px`);
    decls.push(`align-items: ${ALIGN_MAP[node.autoLayout.align]}`);
    decls.push(`justify-content: ${JUSTIFY_MAP[node.autoLayout.justify]}`);
  }
  if (node.style.backgroundColor) decls.push(`background-color: ${node.style.backgroundColor}`);
  if (node.style.color) decls.push(`color: ${node.style.color}`);
  if (node.style.borderRadius) decls.push(`border-radius: ${node.style.borderRadius}px`);
  if (node.style.borderWidth) {
    decls.push(`border-width: ${node.style.borderWidth}px`);
    decls.push(`border-style: solid`);
    decls.push(`border-color: ${node.style.borderColor ?? "#000000"}`);
  }
  if (node.style.opacity !== undefined) decls.push(`opacity: ${node.style.opacity}`);
  if (node.style.fontSize) decls.push(`font-size: ${node.style.fontSize}px`);
  if (node.style.fontWeight) decls.push(`font-weight: ${node.style.fontWeight}`);
  decls.push("box-sizing: border-box");
  decls.push("user-select: none");

  // A hover animation's `from` values are this node's normal (non-hovered) look.
  if (hoverFrom?.opacity !== undefined) decls.push(`opacity: ${hoverFrom.opacity}`);
  const t = transformFor(hoverFrom ?? {});
  if (t) decls.push(`transform: ${t}`);

  return decls;
}

interface GenResult {
  html: string;
  rules: string[];
  keyframes: string[];
  reducedMotionSelectors: string[];
}

function renderNode(
  node: DesignNode,
  doc: DesignDocument,
  isRoot: boolean,
  inFlexParent: boolean,
  out: GenResult
): string {
  const cls = className(node.id);
  const hoverAnim = node.animations?.find((a) => a.trigger === "hover");
  const loadAnim = node.animations?.find((a) => a.trigger === "load");

  const decls = baseDecls(node, isRoot, inFlexParent, hoverAnim?.from);
  let hoverRule: string | undefined;
  const mediaRules: string[] = [];
  if (hoverAnim) {
    decls.push(
      `transition: transform ${hoverAnim.duration}ms ${hoverAnim.easing} ${hoverAnim.delay}ms, opacity ${hoverAnim.duration}ms ${hoverAnim.easing} ${hoverAnim.delay}ms`
    );
    const toDecls: string[] = [];
    if (hoverAnim.to.opacity !== undefined) toDecls.push(`opacity: ${hoverAnim.to.opacity}`);
    const t = transformFor(hoverAnim.to);
    if (t) toDecls.push(`transform: ${t}`);
    hoverRule = `.${cls}:hover {\n  ${toDecls.join(";\n  ")};\n}`;
    out.reducedMotionSelectors.push(`.${cls}`);
  }
  if (loadAnim) {
    const kf = `${cls}-load`;
    const fromDecls: string[] = [];
    if (loadAnim.from.opacity !== undefined) fromDecls.push(`opacity: ${loadAnim.from.opacity}`);
    const ft = transformFor(loadAnim.from);
    if (ft) fromDecls.push(`transform: ${ft}`);
    const toDecls: string[] = [];
    if (loadAnim.to.opacity !== undefined) toDecls.push(`opacity: ${loadAnim.to.opacity}`);
    const tt = transformFor(loadAnim.to);
    if (tt) toDecls.push(`transform: ${tt}`);
    out.keyframes.push(
      `@keyframes ${kf} {\n  from { ${fromDecls.join("; ")}; }\n  to { ${toDecls.join("; ")}; }\n}`
    );
    decls.push(
      `animation: ${kf} ${loadAnim.duration}ms ${loadAnim.easing} ${loadAnim.delay}ms both`
    );
    out.reducedMotionSelectors.push(`.${cls}`);
  }

  // Responsive overrides -> media queries matching the live preview's breakpoint buckets.
  (["tablet", "mobile"] as Breakpoint[]).forEach((bp) => {
    const o = node.responsive?.[bp];
    if (!o) return;
    const query =
      bp === "tablet" ? "(min-width: 640px) and (max-width: 1023px)" : "(max-width: 639px)";
    const bpDecls: string[] = [];
    if (o.x !== undefined && !inFlexParent) bpDecls.push(`left: ${o.x}px`);
    if (o.y !== undefined && !inFlexParent) bpDecls.push(`top: ${o.y}px`);
    if (o.width !== undefined) bpDecls.push(`width: ${o.width}px`);
    if (o.height !== undefined) bpDecls.push(`height: ${o.height}px`);
    if (o.backgroundColor) bpDecls.push(`background-color: ${o.backgroundColor}`);
    if (o.color) bpDecls.push(`color: ${o.color}`);
    if (o.borderRadius !== undefined) bpDecls.push(`border-radius: ${o.borderRadius}px`);
    if (o.opacity !== undefined) bpDecls.push(`opacity: ${o.opacity}`);
    if (o.fontSize !== undefined) bpDecls.push(`font-size: ${o.fontSize}px`);
    if (bpDecls.length === 0) return;
    mediaRules.push(`@media ${query} {\n  .${cls} {\n    ${bpDecls.join(";\n    ")};\n  }\n}`);
  });

  // Base rule must come first: CSS breaks ties by source order, so hover and
  // responsive-override rules need to follow it to actually win when active.
  out.rules.push(`.${cls} {\n  ${decls.join(";\n  ")};\n}`);
  if (hoverRule) out.rules.push(hoverRule);
  out.rules.push(...mediaRules);

  const childrenHtml = node.children
    .map((childId) => {
      const child = doc.nodes[childId];
      if (!child) return "";
      return renderNode(child, doc, false, !!node.autoLayout, out);
    })
    .join("\n");

  switch (node.type) {
    case "text":
      return `<p class="${cls}">${escapeHtml(node.props.text || "")}</p>`;
    case "button":
      return `<button class="${cls}" type="button">${escapeHtml(node.props.text || "")}</button>`;
    case "image":
      return `<img class="${cls}" src="${escapeHtml(node.props.src || "")}" alt="${escapeHtml(node.props.alt || "")}" />`;
    default:
      return `<div class="${cls}">\n${childrenHtml}\n</div>`;
  }
}

export function generateHtmlDocument(
  page: Page,
  components: ComponentDefinition[],
  projectName: string
): string {
  const flatDoc = flattenInstances(page.document, components);
  const root = flatDoc.nodes[flatDoc.rootId];

  const out: GenResult = { html: "", rules: [], keyframes: [], reducedMotionSelectors: [] };
  const bodyHtml = renderNode(root, flatDoc, true, false, out);

  const reducedMotionBlock =
    out.reducedMotionSelectors.length > 0
      ? `@media (prefers-reduced-motion: reduce) {\n  ${[...new Set(out.reducedMotionSelectors)]
          .map((s) => `${s} { animation: none !important; transition: none !important; }`)
          .join("\n  ")}\n}`
      : "";

  const css = [
    "* { margin: 0; }",
    "body { font-family: system-ui, -apple-system, sans-serif; }",
    ...out.rules,
    ...out.keyframes,
    reducedMotionBlock,
  ]
    .filter(Boolean)
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(projectName)} — ${escapeHtml(page.name)}</title>
<style>
${css}
</style>
</head>
<body>
${bodyHtml}
</body>
</html>
`;
}
