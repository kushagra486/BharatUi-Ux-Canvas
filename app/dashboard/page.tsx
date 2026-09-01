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

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-zinc-200 px-8 py-4 dark:border-zinc-800">
        <span className="font-semibold text-zinc-950 dark:text-zinc-50">
          Bharat UI Canvas
        </span>
        <div className="flex items-center gap-4 text-sm text-zinc-500">
          <span>{session.email}</span>
          <button
            onClick={() => {
              signOut();
              router.push("/login");
            }}
            className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-8 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
            Your projects
          </h1>
          <button
            onClick={handleCreate}
            className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            + New project
          </button>
        </div>

        {loading ? (
          <p className="mt-8 text-sm text-zinc-500">Loading…</p>
        ) : projects.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-3 text-center text-zinc-500">
            <p>No projects yet.</p>
            <button
              onClick={handleCreate}
              className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <li
                key={p.id}
                className="group rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <button
                  onClick={() => router.push(`/editor/${p.id}`)}
                  className="flex h-28 w-full items-center justify-center rounded-lg bg-zinc-100 text-xs text-zinc-400 dark:bg-zinc-900"
                >
                  Open editor →
                </button>
                <div className="mt-3 flex items-start justify-between">
                  <div>
                    <p className="font-medium text-zinc-950 dark:text-zinc-50">
                      {p.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Updated {new Date(p.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 text-xs">
                  <button
                    onClick={() => handleRename(p.id, p.name)}
                    className="rounded-md border border-zinc-300 px-2 py-1 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => handleDuplicate(p.id)}
                    className="rounded-md border border-zinc-300 px-2 py-1 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="rounded-md border border-red-300 px-2 py-1 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
