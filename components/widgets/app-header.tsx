"use client";

import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/authClient";
import { UserDialog } from "@/components/widgets/user-dialog";

type AppHeaderProps = {
  backHref?: string;
  backLabel?: string;
  meta?: ReactNode;
};

export function AppHeader({
  backHref,
  backLabel = "Back to app",
  meta,
}: AppHeaderProps) {
  const { data: session, isPending } = useSession();

  return (
    <header className="relative flex h-14 items-center justify-between px-4 sm:px-6">
      <Link
        href="/"
        className=" tracking-[0.18em] text-zinc-100 uppercase no-underline"
      >
        Glyph
      </Link>

      <div className="hidden items-center gap-3 md:flex">
        {meta}
      </div>

      <div className="flex items-center gap-3">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 border border-dashed border-zinc-700 px-3 py-1.5 text-[11px] text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
          >
            <ArrowLeft className="size-3.5" />
            {backLabel}
          </Link>
        ) : null}

        {session?.user ? (
          <UserDialog user={session.user} />
        ) : (
          <Button
            asChild
            variant="ghost"
            size="sm"
            disabled={isPending}
            className="h-8 rounded-none border border-dashed border-zinc-700 bg-transparent px-3 text-[11px] text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
          >
            <Link href="/sign-in">Log in</Link>
          </Button>
        )}
      </div>

      <div className="absolute bottom-0 left-0 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rounded-full border border-zinc-700 bg-[#0a0a0c]" />
      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 translate-x-1/2 translate-y-1/2 rounded-full border border-zinc-700 bg-[#0a0a0c]" />
      <div className="absolute bottom-0 left-1/2 h-px w-screen -translate-x-1/2 bg-zinc-800/80" />
    </header>
  );
}
