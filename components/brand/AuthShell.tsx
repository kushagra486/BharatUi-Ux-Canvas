import Logo from "@/components/brand/Logo";

export const authInputClass =
  "mt-1.5 w-full rounded-lg border border-editor-border bg-editor-elevated px-3 py-2.5 text-sm text-editor-foreground placeholder:text-editor-muted/70 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30";

export const authLabelClass = "block text-sm font-medium text-editor-foreground/90";

export const authPrimaryButtonClass =
  "w-full cursor-pointer rounded-lg bg-brand py-2.5 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/25 transition-colors hover:bg-brand-hover";

/** Centered card layout shared by the login and signup pages. */
export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-brand/20 blur-3xl"
      />
      <div className="relative mb-8">
        <Logo />
      </div>
      <div className="relative w-full max-w-sm rounded-2xl border border-editor-border bg-editor/80 p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <h1 className="text-xl font-semibold text-editor-foreground">{title}</h1>
        <p className="mt-1 text-sm text-editor-muted">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
