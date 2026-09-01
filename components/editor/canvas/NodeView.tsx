"use client";

import { useRef } from "react";
import { DesignDocument, DesignNode } from "@/types/document";
import { useEditorStore } from "@/store/editor-store";

interface NodeViewProps {
  node: DesignNode;
  document: DesignDocument;
  isRoot?: boolean;
}

export default function NodeView({ node, document, isRoot }: NodeViewProps) {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectNode = useEditorStore((s) => s.selectNode);
  const updateSelected = useEditorStore((s) => s.updateSelected);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null
  );
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(
    null
  );

  const isSelected = selectedNodeId === node.id;

  function handlePointerDown(e: React.PointerEvent) {
    if (isRoot) return;
    e.stopPropagation();
    selectNode(node.id);
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

  const style: React.CSSProperties = isRoot
    ? {
        position: "relative",
        width: node.layout.width,
        height: node.layout.height,
        backgroundColor: node.style.backgroundColor,
        borderRadius: node.style.borderRadius,
      }
    : {
        position: "absolute",
        left: node.layout.x,
        top: node.layout.y,
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
        alignItems: node.type === "button" ? "center" : "flex-start",
        justifyContent:
          node.style.textAlign === "center"
            ? "center"
            : node.style.textAlign === "right"
              ? "flex-end"
              : "flex-start",
        cursor: "move",
        userSelect: "none",
        outline: isSelected ? "2px solid #2563eb" : "1px solid transparent",
        outlineOffset: -1,
      };

  return (
    <div
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      data-node-id={node.id}
    >
      {node.type === "text" && <span className="px-1">{node.props.text || "Text"}</span>}
      {node.type === "button" && <span className="px-2">{node.props.text || "Button"}</span>}
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

      {node.children.map((childId) => {
        const child = document.nodes[childId];
        if (!child) return null;
        return <NodeView key={childId} node={child} document={document} />;
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
