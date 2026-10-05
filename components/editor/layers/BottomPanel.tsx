"use client";

import { useState } from "react";
import LayersPanel from "./LayersPanel";
import ComponentsPanel from "@/components/editor/components/ComponentsPanel";
import AssetsPanel from "@/components/editor/assets/AssetsPanel";

const tabs = ["Layers", "Components", "Assets"] as const;
type Tab = (typeof tabs)[number];

export default function BottomPanel() {
  const [tab, setTab] = useState<Tab>("Layers");

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-editor">
      <div className="flex border-b border-editor-border">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`cursor-pointer px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors ${
              tab === t
                ? "border-b-2 border-brand text-editor-foreground"
                : "border-b-2 border-transparent text-editor-muted hover:text-editor-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Layers" && <LayersPanel />}
      {tab === "Components" && <ComponentsPanel />}
      {tab === "Assets" && <AssetsPanel />}
    </div>
  );
}
