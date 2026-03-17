"use client";

import Link from "next/link";
import { useState } from "react";
import { FolderOpen, LogOut, User2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { authClient } from "@/lib/authClient";

type UserDialogProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "U";
  return source.slice(0, 1).toUpperCase();
}

export function UserDialog({ user }: UserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await authClient.signOut();
    window.location.href = "/sign-in";
  };

  const initials = getInitials(user.name, user.email);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-zinc-700 bg-zinc-900 text-xs font-medium text-zinc-100 transition-colors hover:border-zinc-500 hover:bg-zinc-800"
          aria-label="Open user menu"
        >
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name ?? "User avatar"}
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-72 rounded-none border-zinc-800 bg-[#0d0d10] p-0 text-zinc-100 shadow-2xl"
      >
        <div className="border-b border-zinc-800/80 px-4 py-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            Account
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-sm font-medium text-zinc-100">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name ?? "User avatar"}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-100">
                {user.name || "Glyph user"}
              </p>
              <p className="truncate text-xs text-zinc-500">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="p-2">
          <Link
            href="/library"
            className="flex items-center gap-3 border border-transparent px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:border-zinc-800 hover:bg-zinc-900/70 hover:text-zinc-100"
          >
            <FolderOpen className="size-4 text-zinc-500" />
            Library
          </Link>

          <button
            type="button"
            disabled
            className="flex w-full items-center gap-3 border border-transparent px-3 py-2.5 text-left text-sm text-zinc-500"
          >
            <User2 className="size-4" />
            Account settings
            <span className="ml-auto text-[10px] uppercase tracking-[0.2em]">
              Soon
            </span>
          </button>
        </div>

        <div className="border-t border-zinc-800/80 p-2">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoading}
            className="flex w-full items-center gap-3 border border-transparent px-3 py-2.5 text-left text-sm text-red-300 transition-colors hover:border-red-950 hover:bg-red-950/30 disabled:opacity-50"
          >
            <LogOut className="size-4" />
            {isLoading ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default UserDialog;
