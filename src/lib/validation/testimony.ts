import { z } from "zod";

export const TESTIMONY_MIN = 10;
export const TESTIMONY_MAX = 600;
export const DISPLAY_NAME_MAX = 60;

export const testimonySchema = z.object({
  displayName: z.string().trim().max(DISPLAY_NAME_MAX, "That name is a little long. A first name or initial is plenty.").optional(),
  content: z
    .string()
    .trim()
    .min(TESTIMONY_MIN, "Please write at least a sentence.")
    .max(TESTIMONY_MAX, `Please keep it under ${TESTIMONY_MAX} characters.`),
  agreePublic: z.literal("on", { error: "Please confirm we may share this after review." }),
});
