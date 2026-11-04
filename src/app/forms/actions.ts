"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { db } from "@/lib/db";
import { readForm } from "@/lib/forms/read";
import { fail, invalid, screen } from "@/lib/forms/respond";
import type { FormState } from "@/lib/forms/state";
import { assessmentItems, bandMessages, scoreAssessment } from "@/lib/services/assessment";
import { getProgress, missingStep, type Progress, type StepKey } from "@/lib/services/clients";
import { generateReferenceCode, normalizeReferenceCode } from "@/lib/services/reference-code";
import { clearReferenceCode, getReferenceCode, setReferenceCode } from "@/lib/session";
import {
  assessmentSchema,
  consentSchema,
  exitSchema,
  interviewSchema,
  parseBirthdate,
  privacySchema,
  resumeSchema,
  sameName,
} from "@/lib/validation/forms";

const stepNames: Record<StepKey, string> = {
  consent: "consent",
  privacy: "data privacy",
  interview: "interview",
  assessment: "assessment",
  exit: "exit",
};

// Prisma Json columns reject `undefined`, so drop it.
function toJson(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

// Never log form contents (SYSTEM_DESIGN 8): name the error and nothing else.
async function guarded(fd: FormData, step: StepKey, run: () => Promise<FormState>): Promise<FormState> {
  try {
    return await run();
  } catch (e) {
    unstable_rethrow(e); // let Next's own redirect/not-found signals through
    if ((e as { code?: string }).code === "P2002") {
      return fail(fd, `The ${stepNames[step]} form is already on file for this reference code.`);
    }
    console.error(`Saving the ${step} form failed:`, e instanceof Error ? e.name : "unknown error");
    return fail(fd, "Something went wrong while saving. Please try again in a moment.");
  }
}

// Checks the cookie's client exists and has finished the forms this step depends on.
async function requireProgress(fd: FormData, step: StepKey): Promise<Progress | FormState> {
  const progress = await getProgress(await getReferenceCode());
  if (!progress) {
    return fail(
      fd,
      "We could not find your reference code. Start with the consent form, or enter your code on the Forms page.",
    );
  }
  const missing = missingStep(progress, step);
  if (missing) return fail(fd, `Please complete the ${stepNames[missing]} form first.`);
  return progress;
}

function isFormState(value: Progress | FormState): value is FormState {
  return "status" in value;
}

export async function submitConsent(_prev: FormState, fd: FormData): Promise<FormState> {
  const blocked = screen(fd);
  if (blocked) return blocked;
  const parsed = consentSchema.safeParse(readForm(fd));
  if (!parsed.success) return invalid(fd, parsed.error);
  const data = parsed.data;

  return guarded(fd, "consent", async () => {
    const existing = await getProgress(await getReferenceCode());
    if (existing?.done.consent) {
      return fail(
        fd,
        "A consent form is already on file on this device. Use the Forms page to continue or start over.",
      );
    }

    // A code collision is astronomically unlikely, but the unique index makes retrying safe.
    for (let attempt = 0; attempt < 5; attempt++) {
      const referenceCode = generateReferenceCode();
      try {
        await db.client.create({
          data: {
            referenceCode,
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            birthdate: parseBirthdate(data.birthdate),
            consent: {
              create: {
                agreements: { voluntary: true, confidentiality: true, notEmergency: true },
                guardianName: data.guardianName,
                signature: data.signature,
              },
            },
          },
        });
        await setReferenceCode(referenceCode);
        return { status: "success", referenceCode } satisfies FormState;
      } catch (e) {
        if ((e as { code?: string }).code !== "P2002") throw e;
      }
    }
    return fail(fd, "Something went wrong while saving. Please try again in a moment.");
  });
}

export async function submitPrivacy(_prev: FormState, fd: FormData): Promise<FormState> {
  const blocked = screen(fd);
  if (blocked) return blocked;
  const parsed = privacySchema.safeParse(readForm(fd));
  if (!parsed.success) return invalid(fd, parsed.error);

  const progress = await requireProgress(fd, "privacy");
  if (isFormState(progress)) return progress;
  if (!sameName(parsed.data.signature, progress.fullName)) {
    return fail(fd, "Please check the highlighted fields.", {
      signature: ["Your signature should match the name on your consent form."],
    });
  }

  return guarded(fd, "privacy", async () => {
    await db.privacyForm.create({
      data: {
        clientId: progress.clientId,
        acknowledgments: { notice: true, processing: true, rights: true },
        signature: parsed.data.signature,
      },
    });
    return { status: "success", referenceCode: progress.referenceCode };
  });
}

export async function submitInterview(_prev: FormState, fd: FormData): Promise<FormState> {
  const blocked = screen(fd);
  if (blocked) return blocked;
  const parsed = interviewSchema.safeParse(readForm(fd, ["concerns"]));
  if (!parsed.success) return invalid(fd, parsed.error);

  const progress = await requireProgress(fd, "interview");
  if (isFormState(progress)) return progress;

  // Store the answer people meant: the typed text when they chose "Other", else the option.
  const { pronounsOther, yearLevelOther, ...rest } = parsed.data;
  const responses = {
    ...rest,
    pronouns: rest.pronouns === "other" ? pronounsOther : rest.pronouns,
    yearLevel: rest.yearLevel === "other" ? yearLevelOther : rest.yearLevel,
  };

  return guarded(fd, "interview", async () => {
    await db.interviewForm.create({
      data: { clientId: progress.clientId, responses: toJson(responses) },
    });
    return { status: "success", referenceCode: progress.referenceCode };
  });
}

export async function submitAssessment(_prev: FormState, fd: FormData): Promise<FormState> {
  const blocked = screen(fd);
  if (blocked) return blocked;
  const parsed = assessmentSchema.safeParse(readForm(fd));
  if (!parsed.success) return invalid(fd, parsed.error);

  const progress = await requireProgress(fd, "assessment");
  if (isFormState(progress)) return progress;

  // Score on the server from the validated answers; the client never sends a total.
  const fields = parsed.data as Record<string, string | undefined>;
  const answers = assessmentItems.map((_, i) => Number(fields[`q${i}`]));
  const { totalScore, band, safetyFlag } = scoreAssessment(answers);

  return guarded(fd, "assessment", async () => {
    await db.assessmentForm.create({
      data: {
        clientId: progress.clientId,
        responses: toJson({ answers, notes: fields.notes, band, safetyFlag }),
        totalScore,
      },
    });
    return {
      status: "success",
      referenceCode: progress.referenceCode,
      notice: bandMessages[band],
      crisis: safetyFlag,
    };
  });
}

export async function submitExit(_prev: FormState, fd: FormData): Promise<FormState> {
  const blocked = screen(fd);
  if (blocked) return blocked;
  const parsed = exitSchema.safeParse(readForm(fd));
  if (!parsed.success) return invalid(fd, parsed.error);
  const data = parsed.data;

  const progress = await requireProgress(fd, "exit");
  if (isFormState(progress)) return progress;

  // Permission to share only matters if there is something to share; it enters the moderation queue.
  const shareable = data.allowTestimony === "on" && !!data.comments && data.comments.length >= 10;

  return guarded(fd, "exit", async () => {
    const exitForm = db.exitForm.create({
      data: {
        clientId: progress.clientId,
        ratings: toJson({
          overall: Number(data.overall),
          heard: Number(data.heard),
          safe: Number(data.safe),
          recommend: Number(data.recommend),
          progressNotes: data.progress,
        }),
        comments: data.comments,
        allowTestimony: data.allowTestimony === "on",
      },
    });
    if (shareable) {
      await db.$transaction([
        exitForm,
        db.testimony.create({
          data: {
            displayName: data.testimonyName ?? "Anonymous",
            content: data.comments!,
            rating: Number(data.overall),
            status: "PENDING",
          },
        }),
      ]);
    } else {
      await exitForm;
    }
    return { status: "success", referenceCode: progress.referenceCode };
  });
}

export async function resumeWithCode(_prev: FormState, fd: FormData): Promise<FormState> {
  const parsed = resumeSchema.safeParse(readForm(fd));
  if (!parsed.success) return invalid(fd, parsed.error);

  const code = normalizeReferenceCode(parsed.data.code);
  const progress = code ? await getProgress(code) : null;
  if (!code || !progress) {
    return fail(fd, "Please check the highlighted fields.", {
      code: ["We could not find that code. Check it and try again, or begin with the consent form."],
    });
  }
  await setReferenceCode(code);
  redirect("/forms");
}

export async function startOver() {
  await clearReferenceCode();
  redirect("/forms");
}
