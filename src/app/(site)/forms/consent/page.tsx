import type { Metadata } from "next";
import { submitConsent } from "@/app/(site)/forms/actions";
import { CheckboxField, FormSection, TextField } from "@/components/forms/fields";
import { FormFrame } from "@/components/forms/form-frame";
import { StepPage } from "@/components/forms/step-page";

export const metadata: Metadata = {
  title: "Consent form",
  description: "Tell Liwanag you are ready, and what you agree to.",
};

export default function ConsentPage() {
  return (
    <StepPage
      step="consent"
      title="Consent form"
      intro="Tell us a little about you, and what you agree to. Taking part is always your choice."
    >
      <FormFrame
        action={submitConsent}
        submitLabel="Give my consent"
        successTitle="Thank you. Your consent is on file."
        nextHref="/forms/privacy"
        nextLabel="Continue to Data Privacy"
        requireSavedCode
      >
        <FormSection title="About you">
          <TextField name="fullName" label="Full name" required autoComplete="name" />
          <TextField name="birthdate" label="Birthdate" type="date" required autoComplete="bday" />
          <TextField
            name="guardianName"
            label="Parent or guardian's name"
            hint="Needed if you are under 18."
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            hint="Only if you would like us to be able to reach you by email."
          />
          <TextField name="phone" label="Phone" type="tel" autoComplete="tel" />
        </FormSection>

        <FormSection title="What you agree to">
          <div>
            <CheckboxField name="agreeVoluntary">
              I am taking part by choice, and I can stop or withdraw at any time.
            </CheckboxField>
            <CheckboxField name="agreeConfidentiality">
              I understand what I share is kept confidential, except when someone may be in serious
              danger, in which case Liwanag may need to involve other people to keep them safe.
            </CheckboxField>
            <CheckboxField name="agreeNotEmergency">
              I understand Liwanag is not an emergency service, and that I can call a hotline at any
              time if I need help right away.
            </CheckboxField>
          </div>
        </FormSection>

        <FormSection title="Sign">
          <TextField
            name="signature"
            label="Type your full name to sign"
            required
            hint="Your typed name works as your signature. Today's date is recorded automatically."
            autoComplete="off"
          />
        </FormSection>
      </FormFrame>
    </StepPage>
  );
}
