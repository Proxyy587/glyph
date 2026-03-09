import { AuthShell } from "@/components/auth/auth-shell";
import { AuthPanel } from "@/components/auth/auth-panel";

export default function SignInPage() {
  return (
    <AuthShell
      badge="Account access"
      eyebrow="Sign in"
      title="Return to your icon workspace."
      description="Access saved icons, keep your generated packs organized, and sync your design system assets as the library grows."
      alternateHref="/sign-up"
      alternateLabel="Create an account"
      alternateText="New to Glyph?"
    >
      <AuthPanel mode="sign-in" />
    </AuthShell>
  );
}
