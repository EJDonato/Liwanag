import type { Metadata } from "next";
import { submitAssessment } from "@/app/(site)/forms/actions";
import { FormSection, ScaleField, TextAreaField } from "@/components/forms/fields";
import { FormFrame } from "@/components/forms/form-frame";
import { HelpNow } from "@/components/forms/help-now";
import { StepPage } from "@/components/forms/step-page";
import { assessmentItems, assessmentScale } from "@/lib/services/assessment";

export const metadata: Metadata = {
  title: "Assessment form",
  description: "A short check-in to understand how you have been doing.",
};

const options = assessmentScale.map((o) => ({ value: String(o.value), label: o.label }));

export default function AssessmentPage() {
  return (
    <StepPage
      step="assessment"
      title="Assessment form"
      intro="A short check-in on how you have been feeling. It is a starting point for a conversation, not a diagnosis."
    >
      <HelpNow />

      <FormFrame
        action={submitAssessment}
        submitLabel="Submit check-in"
        successTitle="Thank you. Your check-in is on file."
        nextHref="/forms"
        nextLabel="Back to all forms"
      >
        <FormSection title="Over the last two weeks, how often have you been bothered by…">
          <div className="space-y-10">
            {assessmentItems.map((item, i) => (
              <ScaleField key={i} name={`q${i}`} legend={`${i + 1}. ${item}`} options={options} />
            ))}
          </div>
        </FormSection>

        <FormSection title="Anything to add?">
          <TextAreaField name="notes" label="Notes for your counselor" />
        </FormSection>
      </FormFrame>
    </StepPage>
  );
}
