// Shape shared by every form Server Action and the client form frame.
// Kept out of the "use server" file because that file may only export async functions.

export type FormValues = Record<string, string | string[]>;

export type FormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[]>;
  // Echoed back on error because React resets uncontrolled forms after an action.
  values?: FormValues;
  referenceCode?: string;
  // A gentle note shown on the confirmation screen (e.g. the check-in result).
  notice?: string;
  // Show crisis resources on the confirmation screen.
  crisis?: boolean;
};

export const idleState: FormState = { status: "idle" };
