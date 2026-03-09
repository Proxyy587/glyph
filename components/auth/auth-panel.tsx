"use client";

import Link from "next/link";
import { ArrowRight, Github, Lock, Mail, User } from "lucide-react";
import { authClient } from "@/lib/authClient";
import { useState } from "react";

type AuthMode = "sign-in" | "sign-up";

type AuthPanelProps = {
  mode: AuthMode;
};

export function AuthPanel({ mode }: AuthPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isSignUp = mode === "sign-up";

  const handleSignIn = async () => {
    setIsLoading(true);
    await authClient.signIn.social({
      provider: "github",
    });
  };

  return (
    <div className="relative overflow-hidden border border-zinc-800 bg-[#0d0d10]">
      <div className="border-b border-zinc-800/80 px-5 py-5">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          {isSignUp ? "Create account" : "Welcome back"}
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-100">
          {isSignUp ? "Sign up for Glyph" : "Sign in to Glyph"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          {isSignUp
            ? "Reserve your workspace for saved icons, community packs, and synced exports."
            : "Pick up where you left off and access your saved icon library."}
        </p>
      </div>

      <div className="space-y-5 px-5 py-5">
        <button
          type="button"
          onClick={handleSignIn}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 border border-zinc-700 bg-zinc-900/70 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Github className="size-4" />
          Continue with GitHub
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-600">
            or with email
          </span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <form className="space-y-4">
          {isSignUp && (
            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                <User className="size-3.5" />
                Name
              </span>
              <input
                type="text"
                placeholder="Abhijit"
                className="w-full border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-zinc-600"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
              <Mail className="size-3.5" />
              Email
            </span>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-zinc-600"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
              <Lock className="size-3.5" />
              Password
            </span>
            <input
              type="password"
              placeholder={
                isSignUp ? "Create a secure password" : "Enter your password"
              }
              className="w-full border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-zinc-600"
            />
          </label>

          {isSignUp && (
            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                <Lock className="size-3.5" />
                Confirm password
              </span>
              <input
                type="password"
                placeholder="Repeat your password"
                className="w-full border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-zinc-600"
              />
            </label>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-xs leading-5 text-zinc-600">
              {isSignUp
                ? "By creating an account you will later be able to save icon packs and share them."
                : "Authentication flow can be wired to Better Auth next."}
            </p>
            {!isSignUp && (
              <Link
                href="/sign-up"
                className="shrink-0 text-xs text-zinc-400 transition-colors hover:text-zinc-100"
              >
                Need access?
              </Link>
            )}
          </div>

          <button
            type="button"
            className="mt-2 inline-flex w-full items-center justify-center gap-2 border border-zinc-100 bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
          >
            {isSignUp ? "Create account" : "Sign in"}
            <ArrowRight className="size-4" />
          </button>
        </form>
      </div>

      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-zinc-500/40" />
      <span className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l border-zinc-500/40" />
      <span className="absolute top-0 right-0 h-2.5 w-2.5 border-t border-r border-zinc-500/40" />
      <span className="absolute top-0 left-0 h-2.5 w-2.5 border-t border-l border-zinc-500/40" />
    </div>
  );
}
