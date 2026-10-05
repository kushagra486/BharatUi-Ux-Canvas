import Link from "next/link";

/** Wordmark + mark used across the marketing, auth and dashboard chrome. */
export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-md text-sm font-semibold text-editor-foreground">
      <span
        aria-hidden
        className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-brand to-accent text-[13px] font-bold text-white shadow-lg shadow-brand/25"
      >
        B
      </span>
      Bharat UI Canvas
    </Link>
  );
}
