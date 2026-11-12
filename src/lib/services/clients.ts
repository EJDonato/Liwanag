import { db } from "@/lib/db";

export const stepKeys = ["consent", "privacy", "interview", "assessment", "exit"] as const;
export type StepKey = (typeof stepKeys)[number];

// Consent and privacy must be on file before the other forms open (PRD 5.4, SYSTEM_DESIGN 6.2).
export const stepRequires: Record<StepKey, StepKey[]> = {
  consent: [],
  privacy: ["consent"],
  interview: ["consent", "privacy"],
  assessment: ["consent", "privacy"],
  // Exit closes the journey, so everything before it must be on file.
  exit: ["consent", "privacy", "interview", "assessment"],
};

export type Progress = {
  clientId: string;
  referenceCode: string;
  fullName: string;
  done: Record<StepKey, boolean>;
};

export async function getProgress(referenceCode: string | null): Promise<Progress | null> {
  if (!referenceCode) return null;
  const client = await db.client.findUnique({
    where: { referenceCode },
    select: {
      id: true,
      referenceCode: true,
      fullName: true,
      consent: { select: { id: true } },
      privacy: { select: { id: true } },
      interview: { select: { id: true } },
      assessment: { select: { id: true } },
      exit: { select: { id: true } },
    },
  });
  if (!client) return null;
  return {
    clientId: client.id,
    referenceCode: client.referenceCode,
    fullName: client.fullName,
    done: {
      consent: !!client.consent,
      privacy: !!client.privacy,
      interview: !!client.interview,
      assessment: !!client.assessment,
      exit: !!client.exit,
    },
  };
}

export function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export function missingStep(progress: Progress, step: StepKey) {
  return stepRequires[step].find((required) => !progress.done[required]) ?? null;
}
