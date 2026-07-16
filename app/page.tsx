import type { Metadata } from "next";
import { GeneratorLayout } from "@/components/generator-layout";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: `${siteConfig.name} — ${siteConfig.tagline}`,
  },
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default function Home() {
  return <GeneratorLayout />;
}
