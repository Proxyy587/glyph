import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LadderRail } from "@/components/generator-ornaments";
import { AppHeader } from "../widgets/app-header";

type AuthShellProps = {
  badge: string;
  title: string;
  description: string;
  eyebrow: string;
  alternateHref: string;
  alternateLabel: string;
  alternateText: string;
  children: React.ReactNode;
};

const featureRows = [
  ["Prompt to SVG", "Clean output"],
  ["Saved library", "Sync soon"],
  ["Outline presets", "Developer-first"],
];

export function AuthShell({
  badge,
  title,
  description,
  eyebrow,
  alternateHref,
  alternateLabel,
  alternateText,
  children,
}: AuthShellProps) {
  return (
    <div className="dark flex min-h-screen flex-col overflow-hidden bg-[#0a0a0c] text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col border-x border-zinc-800/80">
        <AppHeader />
      </div>

      <div className="min-h-0 flex-1 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,80rem)_minmax(0,1fr)]">
        <aside className="pointer-events-none hidden xl:flex pr-[18%]">
          <LadderRail side="left" />
        </aside>

        <section className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 border-x border-zinc-800/80">
          <div className="flex min-w-0 flex-1 flex-col border-r border-zinc-800/80">
            <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10">
              <div className="inline-flex w-fit items-center gap-2 border border-zinc-800 bg-zinc-900/40 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                {badge}
              </div>

              <p className="mt-8 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                {eyebrow}
              </p>
              <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
                {description}
              </p>

              <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
                {featureRows.map(([label, value]) => (
                  <div
                    key={label}
                    className="relative overflow-hidden border border-zinc-800 bg-zinc-900/30 px-4 py-4"
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                      {label}
                    </p>
                    <p className="mt-2 text-sm text-zinc-300">{value}</p>
                    <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-zinc-600/40" />
                    <span className="absolute top-0 left-0 h-2 w-2 border-t border-l border-zinc-600/40" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex w-full flex-none items-center justify-center px-6 py-10 md:w-[420px] lg:w-[460px] lg:px-8">
            <div className="w-full">
              {children}
              <p className="mt-6 text-center text-xs text-zinc-500">
                {alternateText}{" "}
                <Link
                  href={alternateHref}
                  className="inline-flex items-center gap-1 text-zinc-300 transition-colors hover:text-zinc-100"
                >
                  {alternateLabel}
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </p>
            </div>
          </div>
        </section>

        <aside className="pointer-events-none hidden xl:flex pl-[18%]">
          <LadderRail side="right" />
        </aside>
      </div>
    </div>
  );
}
