import { HotlineLink } from "@/components/hotline-link";
import { hotlines } from "@/lib/site";

// Shown above the check-in, which includes a question about self-harm: help is one tap away
// before anyone has to answer it, not only after they submit.
export function HelpNow() {
  return (
    <div role="note" className="mb-10 rounded-2xl bg-accent p-5">
      <p className="text-lg leading-snug">
        <strong>If you need to talk to someone right now,</strong> you can stop here and call{" "}
        {hotlines[0].name} on <HotlineLink number={hotlines[0].numbers[0]} className="py-1 font-semibold" />. These
        questions can wait.
      </p>
    </div>
  );
}
