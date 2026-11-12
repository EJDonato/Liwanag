// The Liwanag check-in: a short self-report screen scored 0-3 per item.
// It is a conversation starter for staff, not a diagnosis.

export const assessmentScale = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
] as const;

export const assessmentItems = [
  "Little interest or pleasure in doing things",
  "Feeling down, sad, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Trouble concentrating on schoolwork or daily tasks",
  "Feeling overwhelmed by school or other responsibilities",
  "Pulling away from friends or family",
  "Thoughts that you would be better off not here, or of hurting yourself",
] as const;

// The last item is the safety question: any answer above zero is flagged.
export const safetyItemIndex = assessmentItems.length - 1;

export type AssessmentBand = "steady" | "strained" | "heavy";

export function scoreAssessment(answers: readonly number[]) {
  const totalScore = answers.reduce((sum, n) => sum + n, 0);
  const band: AssessmentBand = totalScore <= 7 ? "steady" : totalScore <= 15 ? "strained" : "heavy";
  const safetyFlag = (answers[safetyItemIndex] ?? 0) > 0;
  return { totalScore, band, safetyFlag };
}

export const bandMessages: Record<AssessmentBand, string> = {
  steady:
    "Your answers suggest things feel fairly steady right now. Our counselors are still here whenever you want to talk.",
  strained:
    "Your answers suggest you are carrying some strain. A counselor can help you sort through it, and the next step is a conversation, not a verdict.",
  heavy:
    "Your answers suggest things have been heavy for a while. You deserve support, and we encourage you to talk with a counselor soon.",
};
