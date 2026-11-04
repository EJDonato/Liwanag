import type { Metadata } from "next";
import { submitExit } from "@/app/forms/actions";
import {
  CheckboxField,
  FormSection,
  ScaleField,
  TextAreaField,
  TextField,
} from "@/components/forms/fields";
import { FormFrame } from "@/components/forms/form-frame";
import { StepPage } from "@/components/forms/step-page";
import { exitRatings, ratingScale } from "@/lib/validation/forms";

export const metadata: Metadata = {
  title: "Exit form",
  description: "Tell Liwanag how it went, so we can do better.",
};

export default function ExitPage() {
  return (
    <StepPage
      step="exit"
      title="Exit form"
      intro="Tell us how it went. Your honesty helps us do better for the next person."
    >
      <FormFrame
        action={submitExit}
        submitLabel="Submit feedback"
        successTitle="Thank you. Your feedback is on file."
        nextHref="/"
        nextLabel="Back to home"
        celebrate
      >
        <FormSection title="How it went">
          <p className="text-muted-foreground">Rate each from 1 (not at all) to 5 (very much).</p>
          <div className="space-y-10">
            {exitRatings.map((r) => (
              <ScaleField key={r.name} name={r.name} legend={r.label} options={ratingScale} />
            ))}
          </div>
        </FormSection>

        <FormSection title="In your words">
          <TextAreaField name="progress" label="What has changed for you, if anything?" />
          <TextAreaField name="comments" label="Comments for the team" />
        </FormSection>

        <FormSection title="Sharing your words">
          <div>
            <CheckboxField name="allowTestimony">
              You may share my comments on the Testimonies page after staff review.
            </CheckboxField>
          </div>
          <TextField
            name="testimonyName"
            label="Name to show"
            hint="A first name or initial is plenty. Leave blank to appear as Anonymous."
          />
        </FormSection>
      </FormFrame>
    </StepPage>
  );
}
