"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireSession } from "@/lib/auth/use-session";
import { signOut } from "@/lib/auth";
import {
  createNewProject,
  deleteProject,
  duplicateProject,
  listProjects,
  renameProject,
} from "@/lib/db/projects";
import { Project } from "@/types/document";
import Logo from "@/components/brand/Logo";

export default function DashboardPage() {
  const router = useRouter();
  const session = useRequireSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    listProjects(session.email).then((p) => {
      setProjects(p);
      setLoading(false);
    });
  }, [session]);

  async function handleCreate() {
    if (!session) return;
    const name = `Untitled ${projects.length + 1}`;
    const project = await createNewProject(session.email, name);
    router.push(`/editor/${project.id}`);
  }

  async function handleRename(id: string, current: string) {
    const name = window.prompt("Rename project", current);
    if (!name || !session) return;
    await renameProject(id, name);
    setProjects(await listProjects(session.email));
  }

  async function handleDuplicate(id: string) {
    if (!session) return;
    await duplicateProject(id);
    setProjects(await listProjects(session.email));
  }

  async function handleDelete(id: string) {
    if (!session) return;
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    await deleteProject(id);
    setProjects(await listProjects(session.email));
  }

  if (!session) return null;

  const secondaryAction =
    "cursor-pointer rounded-md px-2 py-1 text-editor-muted transition-colors hover:bg-white/5 hover:text-editor-foreground";

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-editor-border bg-editor/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Logo href="/dashboard" />
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-editor-muted sm:inline">{session.email}</span>
            <button
              onClick={() => {
                signOut();
                router.push("/login");
              }}
              className="cursor-pointer rounded-lg border border-editor-border px-3 py-1.5 text-editor-foreground/90 transition-colors hover:bg-white/5"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-editor-foreground">Your projects</h1>
            <p className="mt-1 text-sm text-editor-muted">
              {loading ? "\u00a0" : `${projects.length} project${projects.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="cursor-pointer rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/25 transition-colors hover:bg-brand-hover"
          >
            + New project
          </button>
        </div>

        {loading ? (
          <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <li key={i} className="h-56 animate-pulse rounded-2xl border border-editor-border bg-editor" />
            ))}
          </ul>
        ) : projects.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-editor-border bg-editor/50 px-6 py-20 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand/15 text-2xl text-violet-300" aria-hidden>
              +
            </span>
            <div>
              <p className="font-medium text-editor-foreground">No projects yet</p>
              <p className="mt-1 text-sm text-editor-muted">Create one to open the editor.</p>
            </div>
            <button
              onClick={handleCreate}
              className="cursor-pointer rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <li
                key={p.id}
                className="group overflow-hidden rounded-2xl border border-editor-border bg-editor transition-colors hover:border-brand/50"
              >
                <button
                  onClick={() => router.push(`/editor/${p.id}`)}
                  aria-label={`Open ${p.name} in the editor`}
                  className="relative flex h-36 w-full cursor-pointer items-center justify-center bg-gradient-to-br from-brand/20 via-editor-elevated to-accent/10"
                >
                  <span className="rounded-md bg-black/30 px-3 py-1.5 text-xs font-medium text-editor-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    Open editor →
                  </span>
                  <span className="absolute bottom-3 left-3 rounded bg-black/30 px-1.5 py-0.5 text-[10px] text-editor-muted">
                    {p.pages.length} page{p.pages.length === 1 ? "" : "s"}
                  </span>
                </button>
                <div className="p-4">
                  <p className="truncate font-medium text-editor-foreground" title={p.name}>
                    {p.name}
                  </p>
                  <p className="mt-0.5 text-xs text-editor-muted">
                    Updated {new Date(p.updatedAt).toLocaleString()}
                  </p>
                  <div className="mt-3 flex gap-1 text-xs">
                    <button onClick={() => handleRename(p.id, p.name)} className={secondaryAction}>
                      Rename
                    </button>
                    <button onClick={() => handleDuplicate(p.id)} className={secondaryAction}>
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="ml-auto cursor-pointer rounded-md px-2 py-1 text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
