import { z } from "zod";
import { assessmentItems } from "@/lib/services/assessment";

// Option lists live here so the pages that render them and the schemas that check them can't drift.
export const interviewConcerns = [
  "Stress about school",
  "Anxiety or constant worry",
  "Low mood or sadness",
  "Sleep problems",
  "Family or relationship difficulties",
  "Friendships or loneliness",
  "Grief or loss",
  "Something else",
] as const;

export const pronounOptions = [
  "she/her",
  "he/him",
  "they/them",
  "she/they",
  "he/they",
  "Prefer not to say",
] as const;

export const yearLevelOptions = [
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
  "College, 1st year",
  "College, 2nd year",
  "College, 3rd year",
  "College, 4th year or higher",
  "Graduate school",
  "Not a student",
] as const;

export const historyOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "skip", label: "I'd rather not say" },
] as const;

export const contactOptions = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone or text" },
  { value: "in-person", label: "In person, at the wellness room" },
] as const;

export const ratingScale = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
] as const;

export const exitRatings = [
  { name: "overall", label: "Overall, how was your experience with Liwanag?" },
  { name: "heard", label: "I felt heard and understood." },
  { name: "safe", label: "I felt safe and respected." },
  { name: "recommend", label: "I would recommend Liwanag to a friend." },
] as const;

const text = (message: string, max = 200) => z.string().trim().min(1, message).max(max, "That is a little too long.");
const optionalText = (max = 200) => z.string().trim().max(max, "That is a little too long.").optional();
const agree = (message: string) => z.literal("on", { error: message });

export function parseBirthdate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function ageOn(birthdate: Date, today = new Date()) {
  let age = today.getUTCFullYear() - birthdate.getUTCFullYear();
  const beforeBirthday =
    today.getUTCMonth() < birthdate.getUTCMonth() ||
    (today.getUTCMonth() === birthdate.getUTCMonth() && today.getUTCDate() < birthdate.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

// Typed signatures are compared loosely: case, spacing and accents shouldn't block someone.
export function sameName(a: string, b: string) {
  const norm = (s: string) =>
    s
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  return norm(a) === norm(b);
}

export const consentSchema = z
  .object({
    fullName: text("Please enter your full name.", 120),
    email: z.email("Enter a valid email address, or leave this blank.").max(200).optional(),
    phone: optionalText(30),
    birthdate: z.string().min(1, "Please enter your birthdate."),
    guardianName: optionalText(120),
    agreeVoluntary: agree("Please confirm that taking part is your choice."),
    agreeConfidentiality: agree("Please confirm you understand how confidentiality works."),
    agreeNotEmergency: agree("Please confirm you understand Liwanag is not an emergency service."),
    signature: text("Please type your full name to sign.", 120),
  })
  // Zod skips refinements once a field has failed. `when: () => true` keeps these cross-field
  // checks running so people see every problem at once, so each one guards against missing values.
  .refine(
    (d) => {
      if (typeof d.birthdate !== "string" || !d.birthdate) return true; // "required" already covers it
      const birthdate = parseBirthdate(d.birthdate);
      return !!birthdate && birthdate <= new Date() && ageOn(birthdate) <= 120;
    },
    { path: ["birthdate"], message: "Enter a valid birthdate.", when: () => true },
  )
  .refine(
    (d) => {
      const birthdate = typeof d.birthdate === "string" ? parseBirthdate(d.birthdate) : null;
      if (!birthdate || birthdate > new Date()) return true; // reported by the birthdate check
      return ageOn(birthdate) >= 18 || !!d.guardianName;
    },
    {
      path: ["guardianName"],
      message: "Because you are under 18, a parent or guardian's name is needed.",
      when: () => true,
    },
  )
  .refine(
    (d) =>
      typeof d.signature !== "string" ||
      typeof d.fullName !== "string" ||
      !d.signature.trim() ||
      !d.fullName.trim() ||
      sameName(d.signature, d.fullName),
    { path: ["signature"], message: "Your signature should match the full name above.", when: () => true },
  );

export const privacySchema = z.object({
  agreeNotice: agree("Please confirm you have read the privacy notice."),
  agreeProcessing: agree("Please confirm you agree to how your information is handled."),
  agreeRights: agree("Please confirm you understand your rights."),
  signature: text("Please type your full name to sign.", 120),
});

// A dropdown that ends in "Other": the typed value rides along as `<name>Other`.
const withOther = <const T extends readonly [string, ...string[]]>(options: T) =>
  z.enum([...options, "other"], { error: "Please choose one of the options." }).optional();
const otherFilled = (name: "pronouns" | "yearLevel") => ({
  path: [`${name}Other`],
  message: "Please type your answer, or pick another option.",
  when: () => true,
});

export const interviewSchema = z
  .object({
  pronouns: withOther(pronounOptions),
  pronounsOther: optionalText(60),
  yearLevel: withOther(yearLevelOptions),
  yearLevelOther: optionalText(80),
  reason: text("Tell us a little about what brings you here.", 2000),
  concerns: z.array(z.enum(interviewConcerns)).default([]),
  concernsOther: optionalText(300),
  history: z.enum(["yes", "no", "skip"], { error: "Please choose an answer." }),
  historyDetails: optionalText(1000),
  supportSystem: optionalText(1000),
  preferredContact: z.enum(["email", "phone", "in-person"], { error: "Please choose a contact method." }),
  bestTime: optionalText(200),
  })
  .refine((d) => d.pronouns !== "other" || !!d.pronounsOther, otherFilled("pronouns"))
  .refine((d) => d.yearLevel !== "other" || !!d.yearLevelOther, otherFilled("yearLevel"));

const answer = z.enum(["0", "1", "2", "3"], { error: "Please choose an answer." });
export const assessmentSchema = z.object({
  ...Object.fromEntries(assessmentItems.map((_, i) => [`q${i}`, answer])) as Record<`q${number}`, typeof answer>,
  notes: optionalText(1000),
});

const rating = z.enum(["1", "2", "3", "4", "5"], { error: "Please choose a rating from 1 to 5." });
export const exitSchema = z.object({
  overall: rating,
  heard: rating,
  safe: rating,
  recommend: rating,
  progress: optionalText(1500),
  comments: optionalText(1500),
  allowTestimony: z.literal("on").optional(),
  testimonyName: optionalText(60),
});

export const resumeSchema = z.object({
  code: z.string().trim().min(1, "Enter the reference code you were given."),
});
