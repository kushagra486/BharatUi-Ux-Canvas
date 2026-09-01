import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 text-center dark:bg-black">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Bharat UI Canvas
      </h1>
      <p className="mt-3 max-w-md text-zinc-600 dark:text-zinc-400">
        Design, animate and ship web experiences visually.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/login"
          className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
