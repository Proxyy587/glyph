"use client";

import { useSvgGenerator } from "@/contexts/svg-generator-context";
import { ModeToggle } from "./mode-toggle";
import { PromptInput } from "./prompt-input";
import { PackPromptInput } from "./pack-prompt-input";
import { StylePresets } from "./style-presets";
import { IconControls } from "./icon-controls";
import { GenerateButton } from "./generate-button";

export function Sidebar() {
  const { mode } = useSvgGenerator();

  return (
    <aside className="flex w-[320px] shrink-0 flex-col border-r border-border bg-background px-5 py-5">
      <ModeToggle />

      {mode === "single" ? <PromptInput /> : <PackPromptInput />}

      <StylePresets />
      <IconControls />
      <GenerateButton />
    </aside>
  );
}
