// MVP auth: local, email-only session (blueprint 5.21 / 21.1 auth).
// Swappable later for a real provider (e.g. Supabase auth per section 10) behind this same interface.

export interface Session {
  email: string;
  name: string;
}

const SESSION_KEY = "buc:session";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function signIn(email: string, name?: string): Session {
  const session: Session = { email, name: name || email.split("@")[0] };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function signOut(): void {
  window.localStorage.removeItem(SESSION_KEY);
}
