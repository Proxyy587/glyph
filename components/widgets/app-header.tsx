import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function AppHeader() {
  return (
    <header className="relative flex h-14 items-center justify-between px-4 sm:px-6">
      <Link
        href="/"
        className="text-sm uppercase tracking-[0.18em] text-zinc-100 no-underline"
      >
        Glyph
      </Link>
    
      <Link
        href="/"
        className="inline-flex items-center gap-2 border border-dashed border-zinc-700 px-3 py-1.5 text-[11px] text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
      >
        <ArrowLeft className="size-3.5" />
        Back to app
      </Link>

      <div className="absolute bottom-0 left-0 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rounded-full border border-zinc-700 bg-[#0a0a0c]" />
      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 translate-x-1/2 translate-y-1/2 rounded-full border border-zinc-700 bg-[#0a0a0c]" />
      <div className="absolute bottom-0 left-1/2 h-px w-screen -translate-x-1/2 bg-zinc-800/80" />
    </header>
  );
}
