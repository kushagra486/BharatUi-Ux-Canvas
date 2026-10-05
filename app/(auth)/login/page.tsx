"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth";
import AuthShell, {
  authInputClass,
  authLabelClass,
  authPrimaryButtonClass,
} from "@/components/brand/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    signIn(email);
    router.push("/dashboard");
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue to Bharat UI Canvas.">
      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
        <div>
          <label htmlFor="email" className={authLabelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={!!error}
            aria-describedby={error ? "email-error" : undefined}
            className={authInputClass}
          />
          {error && (
            <p id="email-error" role="alert" className="mt-2 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>
        <button type="submit" className={authPrimaryButtonClass}>
          Continue
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-editor-muted">
        No account?{" "}
        <Link href="/signup" className="font-medium text-violet-400 hover:text-violet-300">
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}
