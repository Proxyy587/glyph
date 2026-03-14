"use server";

interface GenerateSvgProps {
  prompt: string;
  model: "openai" | "gemini";
}

export async function generateSvg(GenerateSvgProps: GenerateSvgProps) {
  const { prompt, model } = GenerateSvgProps;
  return {
    prompt,
    model,
  };
}
