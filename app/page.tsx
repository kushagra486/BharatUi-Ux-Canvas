import Link from "next/link";
import Logo from "@/components/brand/Logo";

const features = [
  {
    title: "Visual canvas",
    body: "Frames, text, images and buttons on a free-form canvas, with layers and a full properties panel.",
    icon: "M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5Zm4 3h8M8 12h5",
  },
  {
    title: "Auto layout & breakpoints",
    body: "Flexbox-style direction, gap and padding, with desktop, tablet and mobile overrides per element.",
    icon: "M4 6h16M4 12h10M4 18h6m10-6v6m-3-3h6",
  },
  {
    title: "Reusable components",
    body: "Turn any selection into a component, drop instances anywhere, override text, or detach.",
    icon: "M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Zm0 0v18M4 7.5l8 4.5 8-4.5",
  },
  {
    title: "Motion & interaction",
    body: "Load, hover and click animations with easing and delay, plus click-to-navigate between pages.",
    icon: "M5 12h3l2-6 4 12 2-6h3",
  },
  {
    title: "Asset library",
    body: "Upload images once and drop them into any page; exports embed them automatically.",
    icon: "M4 16l4.5-4.5a1.5 1.5 0 0 1 2.1 0L15 16m-2-2 1.5-1.5a1.5 1.5 0 0 1 2.1 0L20 16M5 20h14a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1Zm10-12h.01",
  },
  {
    title: "Clean HTML/CSS export",
    body: "Export a page as one self-contained file — layout, breakpoints and animations in plain CSS.",
    icon: "m8 9-3 3 3 3m8-6 3 3-3 3M13.5 6l-3 12",
  },
];

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-brand/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 right-[-200px] h-[360px] w-[480px] rounded-full bg-accent/15 blur-3xl"
      />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 font-medium text-editor-muted transition-colors hover:text-editor-foreground"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-white/10 px-3.5 py-2 font-medium text-editor-foreground transition-colors hover:bg-white/15"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <main className="relative mx-auto w-full max-w-6xl flex-1 px-6">
        <section className="flex flex-col items-center pt-20 pb-24 text-center sm:pt-28">
          <span className="rounded-full border border-editor-border bg-white/5 px-3 py-1 text-xs font-medium text-editor-muted">
            Design · Animate · Ship
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-editor-foreground sm:text-6xl">
            Design web experiences{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              visually
            </span>
            , ship real code.
          </h1>
          <p className="mt-5 max-w-xl text-base text-editor-muted sm:text-lg">
            Bharat UI Canvas is a browser-based studio for laying out, animating and exporting
            modern websites — no install, no hand-off.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/30 transition-colors hover:bg-brand-hover"
            >
              Start designing — it&apos;s free
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-editor-border bg-white/5 px-6 py-3 text-sm font-semibold text-editor-foreground transition-colors hover:bg-white/10"
            >
              I have an account
            </Link>
          </div>

          <EditorMockup />
        </section>

        <section aria-labelledby="features-heading" className="pb-28">
          <h2 id="features-heading" className="text-center text-2xl font-semibold text-editor-foreground sm:text-3xl">
            Everything you need to go from idea to page
          </h2>
          <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <li
                key={f.title}
                className="rounded-2xl border border-editor-border bg-editor/70 p-6 transition-colors hover:border-brand/40"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand/15 text-violet-300">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
                    <path d={f.icon} />
                  </svg>
                </span>
                <h3 className="mt-4 font-semibold text-editor-foreground">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-editor-muted">{f.body}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="relative border-t border-editor-border py-6 text-center text-xs text-editor-muted">
        Bharat UI Canvas — built in the browser.
      </footer>
    </div>
  );
}

/** A stylised, static picture of the editor: top bar, layers, canvas, properties. */
function EditorMockup() {
  return (
    <div aria-hidden className="mt-16 w-full max-w-4xl rounded-2xl border border-editor-border bg-editor p-2 shadow-2xl shadow-brand/20">
      <div className="flex h-8 items-center gap-1.5 px-2">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="mx-auto flex gap-1 rounded-md bg-editor-elevated p-0.5">
          <span className="rounded bg-brand px-2 py-0.5 text-[10px] text-white">Desktop</span>
          <span className="px-2 py-0.5 text-[10px] text-editor-muted">Tablet</span>
          <span className="px-2 py-0.5 text-[10px] text-editor-muted">Mobile</span>
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[150px_1fr_170px]">
        <div className="hidden space-y-1.5 rounded-lg bg-editor-elevated p-3 text-left sm:block">
          {["Page", "Hero", "Heading", "Button", "Image"].map((l, i) => (
            <div
              key={l}
              className={`rounded px-2 py-1 text-[10px] ${i === 3 ? "bg-brand/25 text-violet-200" : "text-editor-muted"}`}
              style={{ marginLeft: i > 1 ? 10 : 0 }}
            >
              {l}
            </div>
          ))}
        </div>
        <div className="grid place-items-center rounded-lg bg-slate-200 p-6">
          <div className="w-full max-w-xs rounded-lg bg-white p-5 text-left shadow-lg">
            <div className="h-3 w-2/3 rounded bg-slate-800" />
            <div className="mt-2 h-2 w-full rounded bg-slate-300" />
            <div className="mt-1.5 h-2 w-5/6 rounded bg-slate-300" />
            <div className="mt-4 inline-block rounded-md bg-brand px-3 py-1.5 text-[10px] font-semibold text-white outline-2 outline-offset-2 outline-violet-400">
              Get started
            </div>
          </div>
        </div>
        <div className="hidden space-y-2 rounded-lg bg-editor-elevated p-3 text-left sm:block">
          {["Fill", "Radius", "Padding", "Motion"].map((l) => (
            <div key={l}>
              <div className="text-[9px] uppercase tracking-wide text-editor-muted">{l}</div>
              <div className="mt-1 h-4 rounded bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
