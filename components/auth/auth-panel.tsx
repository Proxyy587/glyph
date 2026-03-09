"use client";

import Link from "next/link";
import { ArrowRight, Github, Lock, Mail, User } from "lucide-react";
import { authClient } from "@/lib/authClient";
import { useState, type ChangeEvent, type FormEvent } from "react";

type AuthMode = "sign-in" | "sign-up";

type AuthPanelProps = {
  mode: AuthMode;
};

export function AuthPanel({ mode }: AuthPanelProps) {
  const isSignUp = mode === "sign-up";
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange =
    (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleSignIn = async () => {
    setError(null);
    setIsGithubLoading(true);

    const { error } = await authClient.signIn.social({
      provider: "github",
      callbackURL: "/",
    });

    if (error) {
      setError(error.message ?? "GitHub sign-in failed.");
      setIsGithubLoading(false);
    }
  };

  const handleEmailAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (isSignUp && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsEmailLoading(true);

    const result = isSignUp
      ? await authClient.signUp.email({
          name: form.name,
          email: form.email,
          password: form.password,
          callbackURL: "/",
        })
      : await authClient.signIn.email({
          email: form.email,
          password: form.password,
          callbackURL: "/",
          rememberMe: true,
        });

    if (result.error) {
      setError(result.error.message ?? "Authentication failed.");
      setIsEmailLoading(false);
      return;
    }

    window.location.href = "/";
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
          disabled={isGithubLoading || isEmailLoading}
          className="flex w-full items-center justify-center gap-2 border border-zinc-700 bg-zinc-900/70 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-50"
        >
          <Github className="size-4" />
          {isGithubLoading ? "Redirecting to GitHub..." : "Continue with GitHub"}
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-600">
            or with email
          </span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <form className="space-y-4" onSubmit={handleEmailAuth}>
          {isSignUp && (
            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                <User className="size-3.5" />
                Name
              </span>
              <input
                type="text"
                placeholder="Abhijit"
                value={form.name}
                onChange={handleChange("name")}
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
              value={form.email}
              onChange={handleChange("email")}
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
              value={form.password}
              onChange={handleChange("password")}
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
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                className="w-full border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-zinc-600"
              />
            </label>
          )}

          {error && (
            <p className="border border-red-900/60 bg-red-950/40 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-xs leading-5 text-zinc-600">
              {isSignUp
                ? "By creating an account you will later be able to save icon packs and share them."
                : "Email/password and GitHub both authenticate through Better Auth."}
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
            type="submit"
            disabled={isGithubLoading || isEmailLoading}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 border border-zinc-100 bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-50"
          >
            {isEmailLoading
              ? isSignUp
                ? "Creating account..."
                : "Signing in..."
              : isSignUp
                ? "Create account"
                : "Sign in"}
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
