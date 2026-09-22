# Bharat UI Canvas

A browser-based visual creation platform for designing modern websites and
web applications — combining a visual UI/UX editor, responsive layout
system, motion studio, illustration and 3D tools, AI-assisted creation,
reusable components, code generation, and a creator marketplace.

This repository currently implements **MVP 1, MVP 2, and the core of
MVP 3** from the project blueprint:

- Auth, dashboard, project persistence, multi-page projects
- Visual canvas with layers, the core element set
  (frame/container/text/image/button), properties panel, save/load
- Auto layout (flexbox-style direction/gap/padding/align) on
  frames/containers
- Responsive breakpoints (desktop/tablet/mobile) with per-node overrides,
  plus a live preview that adapts to the real viewport width
- Reusable components: create a component from any selection, insert
  instances elsewhere, override an instance's text without touching the
  source definition, and detach an instance back into editable nodes
- A read-only `/preview/[projectId]` route separate from the editor
- Motion: per-node load/hover/click animations (opacity, position, scale,
  rotate) with duration/delay/easing/repeat, played back in preview and
  respecting `prefers-reduced-motion`
- Interaction: an on-click "navigate to page" rule per node, live in
  preview
- Code generation: export a page as a self-contained static HTML/CSS
  file (auto layout, breakpoints, load/hover animations, and
  reduced-motion all reproduced in plain CSS — no app JS dependency)
- Undo/redo across the whole editor (inserts, deletes, property edits,
  pages, components), with Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z — a continuous
  gesture like a drag or a burst of typing collapses into one undo step

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up with any
email to create an account (MVP auth is local-only, stored in the
browser), then create a project from the dashboard to open the editor.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Zustand for editor state

## Project structure

```
app/            routes: auth, dashboard, editor, preview
components/     editor UI (canvas, toolbar, layers, properties)
engine/document/ pure operations over the design document tree
store/          editor state (Zustand)
lib/auth/       session handling
lib/db/         project persistence
types/          shared document/project types
```

The design document (`types/document.ts`) is framework-neutral: the same
node tree is meant to power the editor, the preview renderer, and — in
later milestones — the code generator, per the project blueprint.

## Known limitations

- Component instances render their definition read-only and support only
  a single text override (the first text/button node found); there is no
  per-descendant override editing yet.
- Auto-layout containers don't "hug" their contents — resize the
  container manually if children overflow it.
- Breakpoint preview buckets window width into exactly three sizes
  (desktop/tablet/mobile); there's no arbitrary custom breakpoint.
- Motion is a simplified from/to transition model, not a full multi-
  keyframe timeline: one animation per trigger (load/hover/click) per
  node, and only click/hover/load — no scroll-linked or gesture triggers
  yet. Animation and interaction playback only run in preview and inside
  component-instance previews, not live on the editing canvas.
- Export is HTML/CSS only, one page at a time. Click-triggered animations
  and the click-navigate interaction aren't in the export (no JS is
  emitted). There is no React/Next.js export yet.

## Roadmap

See the full blueprint for the complete feature catalogue, architecture,
and phased roadmap (illustration, 3D, marketplace, AI studio,
collaboration, and publishing). Still outstanding after MVP 1–3: real
backend/auth (everything today is local-only, per-browser storage), asset
library/upload, design tokens, a full keyframe timeline UI, scroll/
cinematic effects, React/Next.js export, whole-project export, illustration/
3D/AI studio, collaboration, marketplace, and deployment.
