# Bharat UI Canvas

A browser-based visual creation platform for designing modern websites and
web applications — combining a visual UI/UX editor, responsive layout
system, motion studio, illustration and 3D tools, AI-assisted creation,
reusable components, code generation, and a creator marketplace.

This repository currently implements **MVP 1 and MVP 2** from the project
blueprint:

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

## Known MVP2 limitations

- Component instances render their definition read-only and support only
  a single text override (the first text/button node found); there is no
  per-descendant override editing yet.
- Auto-layout containers don't "hug" their contents — resize the
  container manually if children overflow it.
- Breakpoint preview buckets window width into exactly three sizes
  (desktop/tablet/mobile); there's no arbitrary custom breakpoint.

## Roadmap

See the full blueprint for the complete feature catalogue, architecture,
and phased roadmap (motion studio, illustration, 3D, marketplace, AI
studio, collaboration, and publishing). Still outstanding after MVP 1/2:
undo/redo, real backend/auth (everything today is local-only, per-browser
storage), asset library/upload, design tokens, code generation, and
everything from MVP 3 onward (motion, illustration, 3D, AI studio,
collaboration, marketplace, deployment).
