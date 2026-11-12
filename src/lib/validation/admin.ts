import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Enter your username.").max(64, "That username is too long."),
  // Not trimmed: spaces can be part of a password. bcrypt only uses the first 72 bytes anyway.
  password: z.string().min(1, "Enter your password.").max(200, "That password is too long."),
});
