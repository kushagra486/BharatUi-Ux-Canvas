"use client";

import { useState } from "react";
import LayersPanel from "./LayersPanel";
import ComponentsPanel from "@/components/editor/components/ComponentsPanel";

const tabs = ["Layers", "Components"] as const;
type Tab = (typeof tabs)[number];

export default function BottomPanel() {
  const [tab, setTab] = useState<Tab>("Layers");

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wide ${
              tab === t
                ? "border-b-2 border-zinc-950 text-zinc-950 dark:border-zinc-50 dark:text-zinc-50"
                : "text-zinc-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Layers" ? <LayersPanel /> : <ComponentsPanel />}
    </div>
  );
}
