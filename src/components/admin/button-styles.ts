import { cn } from "@/lib/utils";

const tones = {
  primary: "bg-night text-white hover:bg-night-2",
  outline: "border border-input bg-white text-foreground hover:bg-mist",
  danger: "border border-error bg-white text-error hover:bg-mist",
} as const;

export type Tone = keyof typeof tones;

export const buttonClass = (tone: Tone = "outline") =>
  cn("inline-flex min-h-11 items-center justify-center rounded-full px-5 font-semibold transition-colors", tones[tone]);
