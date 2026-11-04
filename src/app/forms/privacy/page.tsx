import type { Metadata } from "next";
import { submitPrivacy } from "@/app/forms/actions";
import { CheckboxField, FormSection, TextField } from "@/components/forms/fields";
import { FormFrame } from "@/components/forms/form-frame";
import { StepPage } from "@/components/forms/step-page";
import { contact } from "@/lib/site";

export const metadata: Metadata = {
  title: "Data privacy form",
  description: "How Liwanag collects, stores and protects your information.",
};

export default function PrivacyPage() {
  return (
    <StepPage
      step="privacy"
      title="Data privacy form"
      intro="Here is plainly how your information is collected, used and protected. Read it, then let us know you understand."
    >
      <div className="mb-12 space-y-6 rounded-2xl bg-mist p-6 text-lg leading-relaxed sm:p-8">
        <h2 className="text-2xl font-semibold tracking-tight">Our privacy notice</h2>
        <p className="text-base text-muted-foreground">
          Written in line with the Philippine Data Privacy Act of 2012 (Republic Act 10173).
        </p>
        <dl className="space-y-5">
          <div>
            <dt className="font-semibold">What we collect</dt>
            <dd>
              Your name, birthdate and optional contact details, and your answers on the interview,
              assessment and exit forms. Much of this is sensitive personal information about your
              health, so we collect only what we need.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Why we collect it</dt>
            <dd>
              To understand how to support you, to follow up when you ask us to, and to improve our
              services. We do not sell it or use it for advertising.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Who can see it</dt>
            <dd>
              Only authorized Liwanag staff. We share it outside the clinic only with your
              permission, or when the law requires it or someone may be in serious danger.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">How it is protected</dt>
            <dd>
              It is stored in a private database with restricted access. Your forms are tied to a
              reference code, not shown publicly.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">How long we keep it</dt>
            <dd>Only as long as needed for the purposes above, then it is deleted.</dd>
          </div>
          <div>
            <dt className="font-semibold">Your rights</dt>
            <dd>
              You may ask to see, correct, or delete your information, object to how it is used, and
              withdraw your consent at any time. Write to us at{" "}
              <a href={`mailto:${contact.email}`} className="underline underline-offset-4">
                {contact.email}
              </a>
              .
            </dd>
          </div>
        </dl>
      </div>

      <FormFrame
        action={submitPrivacy}
        submitLabel="Acknowledge and continue"
        successTitle="Thank you. Your privacy acknowledgment is on file."
        nextHref="/forms/interview"
        nextLabel="Continue to Interview"
      >
        <FormSection title="Your acknowledgment">
          <div>
            <CheckboxField name="agreeNotice">I have read and understood the privacy notice above.</CheckboxField>
            <CheckboxField name="agreeProcessing">
              I agree that Liwanag may collect and use my information, including sensitive personal
              information, for the purposes described.
            </CheckboxField>
            <CheckboxField name="agreeRights">
              I understand my rights to access, correct, delete, and withdraw consent for my
              information.
            </CheckboxField>
          </div>
          <TextField
            name="signature"
            label="Type your full name to sign"
            required
            hint="This should match the name on your consent form."
            autoComplete="off"
          />
        </FormSection>
      </FormFrame>
    </StepPage>
  );
}
