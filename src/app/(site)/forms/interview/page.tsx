import type { Metadata } from "next";
import { submitInterview } from "@/app/(site)/forms/actions";
import {
  CheckboxGroup,
  FormSection,
  RadioGroup,
  SelectWithOtherField,
  TextAreaField,
  TextField,
} from "@/components/forms/fields";
import { FormFrame } from "@/components/forms/form-frame";
import { StepPage } from "@/components/forms/step-page";
import {
  contactOptions,
  historyOptions,
  interviewConcerns,
  pronounOptions,
  yearLevelOptions,
} from "@/lib/validation/forms";

export const metadata: Metadata = {
  title: "Interview form",
  description: "Share what brings you to Liwanag, in your own words.",
};

export default function InterviewPage() {
  return (
    <StepPage
      step="interview"
      title="Interview form"
      intro="Share what brings you here, in your own words. Skip anything you would rather not answer, except the few marked required."
    >
      <FormFrame
        action={submitInterview}
        submitLabel="Submit interview"
        successTitle="Thank you for sharing. Your interview is on file."
        nextHref="/forms/assessment"
        nextLabel="Continue to Assessment"
      >
        <FormSection title="A little about you">
          <SelectWithOtherField
            name="pronouns"
            label="Pronouns"
            options={pronounOptions}
            otherLabel="Your pronouns"
          />
          <SelectWithOtherField
            name="yearLevel"
            label="Grade or year level"
            options={yearLevelOptions}
            otherLabel="Your grade or year level"
          />
        </FormSection>

        <FormSection title="What brings you here">
          <TextAreaField
            name="reason"
            label="What would you like support with?"
            required
            rows={5}
            hint="A few sentences is plenty. There are no wrong answers."
          />
          <CheckboxGroup
            name="concerns"
            legend="Which of these feel true right now?"
            hint="Choose any that apply."
            options={interviewConcerns}
          />
          <TextField name="concernsOther" label="Anything else on your mind?" />
        </FormSection>

        <FormSection title="Support so far">
          <RadioGroup
            name="history"
            legend="Have you talked to a counselor or mental health professional before?"
            options={historyOptions}
            inline
          />
          <TextAreaField name="historyDetails" label="If you like, tell us a little about that" />
          <TextAreaField
            name="supportSystem"
            label="Who supports you right now?"
            hint="Friends, family, teachers, or anyone else you can lean on."
          />
        </FormSection>

        <FormSection title="Reaching you">
          <RadioGroup
            name="preferredContact"
            legend="How would you like us to reach you?"
            options={contactOptions}
          />
          <TextField name="bestTime" label="Best days or times" hint="For example weekday afternoons." />
        </FormSection>
      </FormFrame>
    </StepPage>
  );
}
