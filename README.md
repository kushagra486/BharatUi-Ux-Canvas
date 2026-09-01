# Bharat UI Canvas

A browser-based visual creation platform for designing modern websites and
web applications — combining a visual UI/UX editor, responsive layout
system, motion studio, illustration and 3D tools, AI-assisted creation,
reusable components, code generation, and a creator marketplace.

This repository currently implements **MVP 1** from the project blueprint:
auth, dashboard, project persistence, the visual canvas with layers, the
core element set (frame/container/text/image/button), the properties
panel, and save/load.

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

## Roadmap

See the full blueprint for the complete feature catalogue, architecture,
and phased roadmap (motion studio, illustration, 3D, marketplace, AI
studio, collaboration, and publishing).
