import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LadderRail } from "@/components/generator-ornaments";
import { AppHeader } from "@/components/widgets/app-header";

const placeholderRows = [
  {
    title: "Community prompt feed",
    copy: "Browse prompts people used and the icons they generated from them.",
  },
  {
    title: "Featured packs",
    copy: "Curated collections of outline, rounded, and system-ready SVG sets.",
  },
  {
    title: "Reusable icon recipes",
    copy: "Save prompt patterns that reliably generate consistent icon systems.",
  },
];

export default function LibraryPage() {
  return (
    <div className="dark flex min-h-screen flex-col overflow-hidden bg-[#0a0a0c] text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col border-x border-zinc-800/80">
        <AppHeader backHref="/" backLabel="Back to app" />
      </div>

      <div className="min-h-0 flex-1 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,80rem)_minmax(0,1fr)]">
        <aside className="pointer-events-none hidden xl:flex pr-[18%]">
          <LadderRail side="left" />
        </aside>

        <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 border-x border-zinc-800/80">
          <div className="flex min-w-0 flex-1 flex-col">
            <section className="border-b border-zinc-800/80 px-6 py-12 sm:px-10">
              <div className="inline-flex items-center gap-2 border border-zinc-800 bg-zinc-900/40 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                Community library
              </div>

              <p className="mt-8 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                Under development
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
                A shared place for prompts and generated icon systems.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
                The library route will eventually showcase prompts from the
                community alongside the SVG icons people created from them. For
                now, this page is a placeholder while the storage and community
                features are being built.
              </p>
            </section>

            <section className="grid flex-1 gap-px bg-zinc-800/80 md:grid-cols-3">
              {placeholderRows.map((item) => (
                <article
                  key={item.title}
                  className="relative bg-[#0d0d10] px-6 py-8"
                >
                  <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-600">
                    Placeholder
                  </p>
                  <h2 className="mt-3 text-lg font-medium text-zinc-100">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    {item.copy}
                  </p>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-zinc-600/40" />
                  <span className="absolute top-0 left-0 h-2.5 w-2.5 border-t border-l border-zinc-600/40" />
                </article>
              ))}
            </section>
          </div>

          <aside className="hidden w-[300px] shrink-0 border-l border-zinc-800/80 bg-[#0d0d10] lg:block">
            <div className="border-b border-zinc-800/80 px-5 py-5">
              <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                What&apos;s coming
              </p>
              <ul className="mt-4 space-y-3 text-sm text-zinc-500">
                <li>Public prompt submissions</li>
                <li>Trending generated icon packs</li>
                <li>Search by style, category, and prompt</li>
                <li>Save to your own library</li>
              </ul>
            </div>

            <div className="px-5 py-5">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 border border-zinc-100 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
              >
                Join early access
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </aside>
        </main>

        <aside className="pointer-events-none hidden xl:flex pl-[18%]">
          <LadderRail side="right" />
        </aside>
      </div>
    </div>
  );
}
