import { AuthShell } from "@/components/auth/auth-shell";
import { AuthPanel } from "@/components/auth/auth-panel";

export default function SignUpPage() {
  return (
    <AuthShell
      badge="Join the library"
      eyebrow="Sign up"
      title="Create your account and start building packs."
      description="Sign up for a shared library of generated SVG icons, reusable presets, and team-ready exports in the same visual workspace."
      alternateHref="/sign-in"
      alternateLabel="Sign in instead"
      alternateText="Already have an account?"
    >
      <AuthPanel mode="sign-up" />
    </AuthShell>
  );
}