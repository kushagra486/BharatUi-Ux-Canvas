"use client";

import { useEditorStore } from "@/store/editor-store";

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

export default function PropertiesPanel() {
  const project = useEditorStore((s) => s.project);
  const activePageId = useEditorStore((s) => s.activePageId);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const updateSelected = useEditorStore((s) => s.updateSelected);
  const deleteSelected = useEditorStore((s) => s.deleteSelected);

  const page = project?.pages.find((p) => p.id === activePageId);
  const node = selectedNodeId ? page?.document.nodes[selectedNodeId] : null;

  if (!node) {
    return (
      <aside className="w-72 border-l border-zinc-200 bg-white p-4 text-sm text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950">
        Select an element to edit its properties.
      </aside>
    );
  }

  return (
    <aside className="flex w-72 flex-col gap-5 overflow-auto border-l border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <input
          value={node.name}
          onChange={(e) => updateSelected({ name: e.target.value })}
          className={inputClass}
        />
      </div>

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

      {(node.type === "text" || node.type === "button") && (
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

      {node.type === "image" && (
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

      <button
        onClick={deleteSelected}
        className="mt-auto rounded-md border border-red-300 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
      >
        Delete element
      </button>
    </aside>
  );
}
