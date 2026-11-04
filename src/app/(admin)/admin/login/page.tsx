import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { signIn } from "@/app/(admin)/admin/actions";
import { TextField } from "@/components/forms/fields";
import { FormFrame } from "@/components/forms/form-frame";
import { LogoMark } from "@/components/logo-mark";
import { getAdmin } from "@/lib/admin/dal";

export const metadata: Metadata = { title: "Sign in" };

// Someone who is already signed in has no reason to see this page. Reading the cookie is
// request-time work, so it sits in its own Suspense boundary and the form below stays static.
async function SendSignedInStaffOn() {
  if (await getAdmin()) redirect("/admin");
  return null;
}

export default function SignInPage() {
  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-heading text-xl font-semibold tracking-tight">
            <LogoMark />
            Liwanag <span className="font-normal text-muted-foreground">staff</span>
          </Link>
        </div>
      </header>

      <main id="main" className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-14 sm:px-6">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Staff sign in</h1>
          <p className="mt-4 text-lg text-muted-foreground">For Liwanag staff only.</p>

          <div className="mt-10">
            <FormFrame action={signIn} submitLabel="Sign in" backLink={false}>
              <TextField name="username" label="Username" required autoComplete="username" />
              <TextField
                name="password"
                label="Password"
                type="password"
                required
                autoComplete="current-password"
              />
            </FormFrame>
          </div>

          <p className="mt-12 text-muted-foreground">
            <Link href="/" className="underline underline-offset-4 hover:text-foreground">
              Back to the Liwanag website
            </Link>
          </p>
        </div>
      </main>

      <Suspense fallback={null}>
        <SendSignedInStaffOn />
      </Suspense>
    </>
  );
}
