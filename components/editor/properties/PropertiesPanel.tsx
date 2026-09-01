"use client";

import { useEditorStore } from "@/store/editor-store";
import { resolveNode } from "@/engine/document/document";
import { AutoLayout } from "@/types/document";
import MotionSection from "./MotionSection";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-zinc-500">
      {label}
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-50";

const selectClass = inputClass;

const defaultAutoLayout: AutoLayout = {
  direction: "column",
  gap: 8,
  padding: 16,
  align: "start",
  justify: "start",
};

export default function PropertiesPanel() {
  const project = useEditorStore((s) => s.project);
  const activePageId = useEditorStore((s) => s.activePageId);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const activeBreakpoint = useEditorStore((s) => s.activeBreakpoint);
  const updateSelected = useEditorStore((s) => s.updateSelected);
  const deleteSelected = useEditorStore((s) => s.deleteSelected);
  const createComponentFromSelection = useEditorStore((s) => s.createComponentFromSelection);
  const detachSelected = useEditorStore((s) => s.detachSelected);

  const page = project?.pages.find((p) => p.id === activePageId);
  const rawNode = selectedNodeId ? page?.document.nodes[selectedNodeId] : null;
  const node = rawNode ? resolveNode(rawNode, activeBreakpoint) : null;
  const hasOverride =
    activeBreakpoint !== "desktop" && !!rawNode?.responsive?.[activeBreakpoint];
  const isInstance = node?.type === "instance";
  const component = isInstance
    ? project?.components.find((c) => c.id === node.componentId)
    : undefined;

  if (!node || !rawNode) {
    return (
      <aside className="w-72 border-l border-zinc-200 bg-white p-4 text-sm text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950">
        Select an element to edit its properties.
      </aside>
    );
  }

  const canAutoLayout = node.type === "frame" || node.type === "container";
  const autoLayout = node.autoLayout;

  return (
    <aside className="flex w-72 flex-col gap-5 overflow-auto border-l border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <input
          value={node.name}
          onChange={(e) => updateSelected({ name: e.target.value })}
          className={inputClass}
        />
      </div>

      {activeBreakpoint !== "desktop" && (
        <div className="flex items-center justify-between rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <span>Editing {activeBreakpoint} override</span>
          {hasOverride && (
            <button
              onClick={() => {
                const responsive = { ...rawNode.responsive };
                delete responsive[activeBreakpoint];
                updateSelected({ responsive });
              }}
              className="font-medium underline"
            >
              Reset
            </button>
          )}
        </div>
      )}

      <section>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">Layout</p>
        <div className="grid grid-cols-2 gap-2">
          <Field label="X">
            <input
              type="number"
              value={node.layout.x}
              onChange={(e) =>
                updateSelected({ layout: { ...node.layout, x: Number(e.target.value) } })
              }
              className={inputClass}
            />
          </Field>
          <Field label="Y">
            <input
              type="number"
              value={node.layout.y}
              onChange={(e) =>
                updateSelected({ layout: { ...node.layout, y: Number(e.target.value) } })
              }
              className={inputClass}
            />
          </Field>
          <Field label="Width">
            <input
              type="number"
              value={node.layout.width}
              onChange={(e) =>
                updateSelected({ layout: { ...node.layout, width: Number(e.target.value) } })
              }
              className={inputClass}
            />
          </Field>
          <Field label="Height">
            <input
              type="number"
              value={node.layout.height}
              onChange={(e) =>
                updateSelected({ layout: { ...node.layout, height: Number(e.target.value) } })
              }
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      {canAutoLayout && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Auto layout
            </p>
            <label className="flex items-center gap-1.5 text-xs text-zinc-500">
              <input
                type="checkbox"
                checked={!!autoLayout}
                onChange={(e) =>
                  updateSelected({
                    autoLayout: e.target.checked ? defaultAutoLayout : undefined,
                  })
                }
              />
              Enabled
            </label>
          </div>
          {autoLayout && (
            <div className="grid grid-cols-2 gap-2">
              <Field label="Direction">
                <select
                  value={autoLayout.direction}
                  onChange={(e) =>
                    updateSelected({
                      autoLayout: { ...autoLayout, direction: e.target.value as AutoLayout["direction"] },
                    })
                  }
                  className={selectClass}
                >
                  <option value="column">Vertical</option>
                  <option value="row">Horizontal</option>
                </select>
              </Field>
              <Field label="Gap">
                <input
                  type="number"
                  value={autoLayout.gap}
                  onChange={(e) =>
                    updateSelected({ autoLayout: { ...autoLayout, gap: Number(e.target.value) } })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Padding">
                <input
                  type="number"
                  value={autoLayout.padding}
                  onChange={(e) =>
                    updateSelected({
                      autoLayout: { ...autoLayout, padding: Number(e.target.value) },
                    })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Align">
                <select
                  value={autoLayout.align}
                  onChange={(e) =>
                    updateSelected({
                      autoLayout: { ...autoLayout, align: e.target.value as AutoLayout["align"] },
                    })
                  }
                  className={selectClass}
                >
                  <option value="start">Start</option>
                  <option value="center">Center</option>
                  <option value="end">End</option>
                </select>
              </Field>
              <Field label="Justify">
                <select
                  value={autoLayout.justify}
                  onChange={(e) =>
                    updateSelected({
                      autoLayout: { ...autoLayout, justify: e.target.value as AutoLayout["justify"] },
                    })
                  }
                  className={selectClass}
                >
                  <option value="start">Start</option>
                  <option value="center">Center</option>
                  <option value="end">End</option>
                  <option value="between">Space between</option>
                </select>
              </Field>
            </div>
          )}
        </section>
      )}

      {isInstance && (
        <section>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
            Component instance
          </p>
          <p className="mb-3 text-xs text-zinc-500">
            {component ? `Instance of "${component.name}"` : "Missing component definition"}
          </p>
          {component && (
            <Field label="Text override">
              <input
                value={node.overrideText ?? ""}
                placeholder="Same as component"
                onChange={(e) => updateSelected({ overrideText: e.target.value || undefined })}
                className={inputClass}
              />
            </Field>
          )}
          <button
            onClick={detachSelected}
            className="mt-3 w-full rounded-md border border-zinc-300 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Detach instance
          </button>
        </section>
      )}

      {!isInstance && node.id !== page?.document.rootId && (
        <button
          onClick={createComponentFromSelection}
          className="rounded-md border border-zinc-300 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          Create component from selection
        </button>
      )}

      {!isInstance && (node.type === "text" || node.type === "button") && (
        <section>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">Content</p>
          <Field label="Text">
            <input
              value={node.props.text ?? ""}
              onChange={(e) => updateSelected({ props: { text: e.target.value } })}
              className={inputClass}
            />
          </Field>
        </section>
      )}

      {!isInstance && node.type === "image" && (
        <section>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">Content</p>
          <Field label="Image URL">
            <input
              value={node.props.src ?? ""}
              onChange={(e) => updateSelected({ props: { src: e.target.value } })}
              className={inputClass}
            />
          </Field>
          <div className="mt-2">
            <Field label="Alt text">
              <input
                value={node.props.alt ?? ""}
                onChange={(e) => updateSelected({ props: { alt: e.target.value } })}
                className={inputClass}
              />
            </Field>
          </div>
        </section>
      )}

      {!isInstance && (
      <section>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">Style</p>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Background">
            <input
              type="color"
              value={node.style.backgroundColor ?? "#ffffff"}
              onChange={(e) => updateSelected({ style: { backgroundColor: e.target.value } })}
              className="h-8 w-full rounded-md border border-zinc-300 dark:border-zinc-700"
            />
          </Field>
          <Field label="Text color">
            <input
              type="color"
              value={node.style.color ?? "#171717"}
              onChange={(e) => updateSelected({ style: { color: e.target.value } })}
              className="h-8 w-full rounded-md border border-zinc-300 dark:border-zinc-700"
            />
          </Field>
          <Field label="Radius">
            <input
              type="number"
              value={node.style.borderRadius ?? 0}
              onChange={(e) => updateSelected({ style: { borderRadius: Number(e.target.value) } })}
              className={inputClass}
            />
          </Field>
          <Field label="Font size">
            <input
              type="number"
              value={node.style.fontSize ?? 14}
              onChange={(e) => updateSelected({ style: { fontSize: Number(e.target.value) } })}
              className={inputClass}
            />
          </Field>
        </div>
      </section>
      )}

      <MotionSection node={rawNode} pages={project?.pages ?? []} updateSelected={updateSelected} />

      <button
        onClick={deleteSelected}
        className="mt-auto rounded-md border border-red-300 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
      >
        Delete element
      </button>
    </aside>
  );
}
