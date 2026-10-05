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

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    signIn(email, name);
    router.push("/dashboard");
  }

  return (
    <AuthShell title="Create your account" subtitle="Start designing in Bharat UI Canvas.">
      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
        <div>
          <label htmlFor="name" className={authLabelClass}>
            Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={authInputClass}
          />
        </div>
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
          Create account
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-editor-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-violet-400 hover:text-violet-300">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
