import { z } from "zod";

export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 2000;

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please tell us your name.").max(100, "That name is a little long."),
  email: z.email("Enter an email address we can reply to.").max(200, "That email address is too long."),
  message: z
    .string()
    .trim()
    .min(MESSAGE_MIN, "Please write at least a sentence.")
    .max(MESSAGE_MAX, `Please keep it under ${MESSAGE_MAX} characters.`),
});

// What staff can change on a testimony before approving it.
export const testimonyEditSchema = z.object({
  displayName: z.string().trim().max(60, "That name is a little long.").optional(),
  content: z
    .string()
    .trim()
    .min(10, "A testimony needs at least a sentence.")
    .max(600, "Please keep it under 600 characters."),
});

// Ids come from our own pages, but actions are public endpoints, so check them anyway.
export const idSchema = z.string().min(1).max(40);
