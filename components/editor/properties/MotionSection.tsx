"use client";

import { AnimatableProps, AnimationTrigger, DesignNode, Easing, NodeAnimation, Page } from "@/types/document";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-zinc-500">
      {label}
      {children}
    </label>
  );
}

function newAnimation(): NodeAnimation {
  return {
    id: crypto.randomUUID(),
    trigger: "hover",
    duration: 200,
    delay: 0,
    easing: "ease",
    repeat: false,
    from: {},
    to: { scale: 1.05 },
  };
}

const PROP_KEYS: (keyof AnimatableProps)[] = ["opacity", "x", "y", "scale", "rotate"];

function AnimatablePropsFields({
  label,
  value,
  onChange,
}: {
  label: string;
  value: AnimatableProps;
  onChange: (next: AnimatableProps) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-medium text-zinc-400">{label}</p>
      <div className="grid grid-cols-3 gap-1.5">
        {PROP_KEYS.map((key) => (
          <label key={key} className="flex flex-col gap-0.5 text-[10px] text-zinc-500">
            {key}
            <input
              type="number"
              value={value[key] ?? ""}
              placeholder="—"
              onChange={(e) => {
                const raw = e.target.value;
                const next = { ...value };
                if (raw === "") delete next[key];
                else next[key] = Number(raw);
                onChange(next);
              }}
              className="w-full rounded border border-zinc-300 bg-white px-1 py-1 text-xs text-zinc-900 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

interface MotionSectionProps {
  node: DesignNode;
  pages: Page[];
  updateSelected: (
    patch: Partial<Pick<DesignNode, "animations" | "onClickNavigateToPageId">>
  ) => void;
}

export default function MotionSection({ node, pages, updateSelected }: MotionSectionProps) {
  const animations = node.animations ?? [];

  function setAnimations(next: NodeAnimation[]) {
    updateSelected({ animations: next });
  }

  function updateAnimation(id: string, patch: Partial<NodeAnimation>) {
    setAnimations(animations.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  return (
    <>
      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Motion</p>
          <button
            onClick={() => setAnimations([...animations, newAnimation()])}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            + Add
          </button>
        </div>
        {animations.length === 0 && (
          <p className="text-xs text-zinc-400">No animations on this element.</p>
        )}
        <div className="flex flex-col gap-3">
          {animations.map((anim) => (
            <div
              key={anim.id}
              className="rounded-md border border-zinc-200 p-2.5 dark:border-zinc-800"
            >
              <div className="mb-2 flex items-center justify-between">
                <select
                  value={anim.trigger}
                  onChange={(e) =>
                    updateAnimation(anim.id, { trigger: e.target.value as AnimationTrigger })
                  }
                  className={inputClass + " !w-auto"}
                >
                  <option value="load">On load</option>
                  <option value="hover">On hover</option>
                  <option value="click">On click</option>
                </select>
                <button
                  onClick={() => setAnimations(animations.filter((a) => a.id !== anim.id))}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <Field label="Duration (ms)">
                  <input
                    type="number"
                    value={anim.duration}
                    onChange={(e) => updateAnimation(anim.id, { duration: Number(e.target.value) })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Delay (ms)">
                  <input
                    type="number"
                    value={anim.delay}
                    onChange={(e) => updateAnimation(anim.id, { delay: Number(e.target.value) })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Easing">
                  <select
                    value={anim.easing}
                    onChange={(e) => updateAnimation(anim.id, { easing: e.target.value as Easing })}
                    className={inputClass}
                  >
                    <option value="linear">Linear</option>
                    <option value="ease">Ease</option>
                    <option value="ease-in">Ease in</option>
                    <option value="ease-out">Ease out</option>
                    <option value="ease-in-out">Ease in-out</option>
                  </select>
                </Field>
              </div>

              <label className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
                <input
                  type="checkbox"
                  checked={anim.repeat}
                  onChange={(e) => updateAnimation(anim.id, { repeat: e.target.checked })}
                />
                Repeat
              </label>

              <div className="mt-2 flex flex-col gap-2">
                <AnimatablePropsFields
                  label="From"
                  value={anim.from}
                  onChange={(from) => updateAnimation(anim.id, { from })}
                />
                <AnimatablePropsFields
                  label="To"
                  value={anim.to}
                  onChange={(to) => updateAnimation(anim.id, { to })}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
          Interaction
        </p>
        <Field label="On click">
          <select
            value={node.onClickNavigateToPageId ?? ""}
            onChange={(e) =>
              updateSelected({ onClickNavigateToPageId: e.target.value || undefined })
            }
            className={inputClass}
          >
            <option value="">No action</option>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>
                Navigate to &quot;{p.name}&quot;
              </option>
            ))}
          </select>
        </Field>
      </section>
    </>
  );
}
