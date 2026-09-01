// MVP persistence: localStorage-backed project store (blueprint 5.1 / 12 database entities).
// Exposes an async, DB-shaped API so a real backend can replace this module later without
// touching callers.

import { Project, createProject } from "@/types/document";

const PROJECTS_KEY = "buc:projects";

function readAll(): Project[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(PROJECTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Project[];
  } catch {
    return [];
  }
}

function writeAll(projects: Project[]): void {
  window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export async function listProjects(ownerEmail: string): Promise<Project[]> {
  return readAll()
    .filter((p) => p.ownerEmail === ownerEmail)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getProject(id: string): Promise<Project | null> {
  return readAll().find((p) => p.id === id) ?? null;
}

export async function createNewProject(
  ownerEmail: string,
  name: string
): Promise<Project> {
  const project = createProject(ownerEmail, name);
  const all = readAll();
  all.push(project);
  writeAll(all);
  return project;
}

export async function saveProject(project: Project): Promise<void> {
  const all = readAll();
  const idx = all.findIndex((p) => p.id === project.id);
  const updated = { ...project, updatedAt: new Date().toISOString() };
  if (idx === -1) {
    all.push(updated);
  } else {
    all[idx] = updated;
  }
  writeAll(all);
}

export async function renameProject(id: string, name: string): Promise<void> {
  const all = readAll();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], name, updatedAt: new Date().toISOString() };
  writeAll(all);
}

export async function duplicateProject(id: string): Promise<Project | null> {
  const all = readAll();
  const source = all.find((p) => p.id === id);
  if (!source) return null;
  const copy: Project = {
    ...source,
    id: crypto.randomUUID(),
    name: `${source.name} copy`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  all.push(copy);
  writeAll(all);
  return copy;
}

export async function deleteProject(id: string): Promise<void> {
  writeAll(readAll().filter((p) => p.id !== id));
}
