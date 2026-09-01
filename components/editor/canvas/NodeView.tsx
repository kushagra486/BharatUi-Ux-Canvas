"use client";

import { useRef } from "react";
import { DesignDocument, DesignNode } from "@/types/document";
import { useEditorStore } from "@/store/editor-store";
import { findFirstTextNodeId, resolveNode } from "@/engine/document/document";

interface NodeViewProps {
  node: DesignNode;
  document: DesignDocument;
  isRoot?: boolean;
  inFlexParent?: boolean;
  /** True inside a component instance's embedded preview: no drag/resize/selection, content is inert. */
  readOnly?: boolean;
  overrideTargetId?: string | null;
  overrideText?: string;
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

export default function NodeView({
  node: rawNode,
  document,
  isRoot,
  inFlexParent,
  readOnly,
  overrideTargetId,
  overrideText,
}: NodeViewProps) {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectNode = useEditorStore((s) => s.selectNode);
  const updateSelected = useEditorStore((s) => s.updateSelected);
  const activeBreakpoint = useEditorStore((s) => s.activeBreakpoint);
  const project = useEditorStore((s) => s.project);
  const node = resolveNode(rawNode, readOnly ? "desktop" : activeBreakpoint);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null
  );
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(
    null
  );

  const isSelected = !readOnly && selectedNodeId === node.id;
  const draggable = !readOnly && !isRoot && !inFlexParent;
  const displayText = node.id === overrideTargetId && overrideText ? overrideText : node.props.text;

  function handlePointerDown(e: React.PointerEvent) {
    if (readOnly || isRoot) return;
    e.stopPropagation();
    selectNode(node.id);
    if (!draggable) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: node.layout.x,
      origY: node.layout.y,
    };
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current || selectedNodeId !== node.id) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    updateSelected({
      layout: {
        ...node.layout,
        x: Math.round(dragRef.current.origX + dx),
        y: Math.round(dragRef.current.origY + dy),
      },
    });
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  function handleResizeDown(e: React.PointerEvent) {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origW: node.layout.width,
      origH: node.layout.height,
    };
  }

  function handleResizeMove(e: React.PointerEvent) {
    if (!resizeRef.current) return;
    const dx = e.clientX - resizeRef.current.startX;
    const dy = e.clientY - resizeRef.current.startY;
    updateSelected({
      layout: {
        ...node.layout,
        width: Math.max(16, Math.round(resizeRef.current.origW + dx)),
        height: Math.max(16, Math.round(resizeRef.current.origH + dy)),
      },
    });
  }

  function handleResizeUp() {
    resizeRef.current = null;
  }

  const flexStyles: React.CSSProperties = node.autoLayout
    ? {
        display: "flex",
        flexDirection: node.autoLayout.direction,
        gap: node.autoLayout.gap,
        padding: node.autoLayout.padding,
        alignItems: ALIGN_MAP[node.autoLayout.align],
        justifyContent: JUSTIFY_MAP[node.autoLayout.justify],
      }
    : {};

  const style: React.CSSProperties = isRoot
    ? {
        position: "relative",
        width: node.layout.width,
        height: node.layout.height,
        backgroundColor: node.style.backgroundColor,
        borderRadius: node.style.borderRadius,
        ...flexStyles,
      }
    : {
        position: inFlexParent ? "relative" : "absolute",
        left: inFlexParent ? undefined : node.layout.x,
        top: inFlexParent ? undefined : node.layout.y,
        flexShrink: inFlexParent ? 0 : undefined,
        width: node.layout.width,
        height: node.layout.height,
        backgroundColor: node.style.backgroundColor,
        color: node.style.color,
        borderRadius: node.style.borderRadius,
        borderWidth: node.style.borderWidth,
        borderColor: node.style.borderColor,
        borderStyle: node.style.borderWidth ? "solid" : undefined,
        opacity: node.style.opacity,
        fontSize: node.style.fontSize,
        fontWeight: node.style.fontWeight,
        textAlign: node.style.textAlign,
        display: "flex",
        alignItems: node.autoLayout ? ALIGN_MAP[node.autoLayout.align] : node.type === "button" ? "center" : "flex-start",
        justifyContent: node.autoLayout
          ? JUSTIFY_MAP[node.autoLayout.justify]
          : node.style.textAlign === "center"
            ? "center"
            : node.style.textAlign === "right"
              ? "flex-end"
              : "flex-start",
        flexDirection: node.autoLayout?.direction,
        gap: node.autoLayout?.gap,
        padding: node.autoLayout?.padding,
        cursor: readOnly ? "default" : draggable ? "move" : "default",
        userSelect: "none",
        outline: isSelected ? "2px solid #2563eb" : "1px solid transparent",
        outlineOffset: -1,
        pointerEvents: readOnly ? "none" : undefined,
      };

  const component =
    node.type === "instance" && node.componentId
      ? project?.components.find((c) => c.id === node.componentId)
      : undefined;

  return (
    <div
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      data-node-id={node.id}
    >
      {node.type === "text" && <span className="px-1">{displayText || "Text"}</span>}
      {node.type === "button" && <span className="px-2">{displayText || "Button"}</span>}
      {node.type === "image" && (
        <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
          {node.props.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={node.props.src} alt={node.props.alt || ""} className="h-full w-full object-cover" />
          ) : (
            "Image"
          )}
        </div>
      )}
      {node.type === "instance" && (
        <div className="absolute inset-0 overflow-hidden">
          {component ? (
            <NodeView
              node={component.document.nodes[component.document.rootId]}
              document={component.document}
              isRoot
              readOnly
              overrideTargetId={findFirstTextNodeId(component.document)}
              overrideText={node.overrideText}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
              Missing component
            </div>
          )}
        </div>
      )}

      {node.children.map((childId) => {
        const child = document.nodes[childId];
        if (!child) return null;
        return (
          <NodeView
            key={childId}
            node={child}
            document={document}
            inFlexParent={!!node.autoLayout}
            readOnly={readOnly}
            overrideTargetId={overrideTargetId}
            overrideText={overrideText}
          />
        );
      })}

      {isSelected && !isRoot && (
        <div
          onPointerDown={handleResizeDown}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeUp}
          className="absolute -bottom-1.5 -right-1.5 h-3 w-3 cursor-se-resize rounded-sm border border-white bg-blue-600"
        />
      )}
    </div>
  );
}
