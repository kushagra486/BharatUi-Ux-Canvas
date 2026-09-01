"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { getSession, Session } from "@/lib/auth";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

// useSyncExternalStore requires getSnapshot to return a referentially stable
// value when the underlying data hasn't changed (getSession() re-parses
// localStorage on every call, which would otherwise loop forever).
let cachedRaw: string | null = null;
let cachedSession: Session | null = null;

function getSnapshot(): Session | null {
  const raw = typeof window === "undefined" ? null : window.localStorage.getItem("buc:session");
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSession = getSession();
  }
  return cachedSession;
}

function getServerSnapshot(): Session | null {
  return null;
}

// Redirects to /login when no session exists; returns the session once resolved.
export function useRequireSession(): Session | null {
  const router = useRouter();
  const session = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (!session) {
      router.replace("/login");
    }
  }, [session, router]);

  return session;
}
