import type { Metadata } from "next";
import { ActionButton, FilterTabs, PageTitle, linkButtonClass } from "@/components/admin/ui";
import { verifyAdmin } from "@/lib/admin/dal";
import { formatDateTime } from "@/lib/admin/format";
import { getNavCounts, listMessages } from "@/lib/admin/queries";
import { cn } from "@/lib/utils";
import { deleteMessage, setMessageRead } from "./actions";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  await verifyAdmin();
  const { show } = await searchParams;
  const unreadOnly = show === "unread";

  const [messages, { unreadMessages }] = await Promise.all([listMessages(unreadOnly), getNavCounts()]);

  return (
    <>
      <PageTitle title="Messages">Sent from the Contact page. Replying opens your email app.</PageTitle>

      <FilterTabs
        label="Message filter"
        items={[
          { label: "Unread", href: "/admin/messages?show=unread", active: unreadOnly, count: unreadMessages },
          { label: "All messages", href: "/admin/messages", active: !unreadOnly },
        ]}
      />

      {messages.length === 0 ? (
        <p id="admin-results" tabIndex={-1} className="mt-10 max-w-xl text-lg text-muted-foreground outline-none">
          {unreadOnly ? "No unread messages. You're all caught up." : "No messages yet. They appear here when someone uses the form on the Contact page."}
        </p>
      ) : (
        <ul id="admin-results" tabIndex={-1} aria-label="Messages" className="mt-6 divide-y divide-border border-y border-border outline-none">
          {messages.map((m) => (
            <li key={m.id} className="py-3">
              <div className={cn("-mx-3 rounded-xl px-3 py-4", !m.isRead && "bg-accent")}>
                <div className="grid gap-5 md:grid-cols-[1fr_auto] md:gap-10">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 [overflow-wrap:anywhere]">
                      <strong className="text-lg">{m.name}</strong>
                      <a href={`mailto:${m.email}`} className="underline underline-offset-4">
                        {m.email}
                      </a>
                      {!m.isRead && <span className="rounded-full bg-sun px-2.5 py-0.5 text-sm font-semibold text-night ring-1 ring-night">Unread</span>}
                    </p>
                    <p className="mt-1 text-muted-foreground">{formatDateTime(m.createdAt)}</p>
                    <p className="mt-4 whitespace-pre-line text-lg leading-relaxed [overflow-wrap:anywhere]">{m.message}</p>
                  </div>

                  <div className="flex flex-wrap content-start gap-2 md:max-w-56 md:justify-end">
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message to Liwanag")}`}
                      className={linkButtonClass("primary")}
                    >
                      Reply by email
                    </a>
                    <ActionButton action={setMessageRead.bind(null, m.id, !m.isRead)} doneMessage={m.isRead ? "Marked as unread." : "Marked as read."}>
                      {m.isRead ? "Mark as unread" : "Mark as read"}
                    </ActionButton>
                    <details className="w-full md:text-right">
                      <summary className={cn(linkButtonClass("outline"), "cursor-pointer list-none")}>Delete…</summary>
                      <div className="mt-2 rounded-xl border border-error bg-white p-4 text-left">
                        <p>Delete this message for good? This cannot be undone.</p>
                        <div className="mt-3">
                          <ActionButton action={deleteMessage.bind(null, m.id)} doneMessage="Message deleted." tone="danger">
                            Yes, delete it
                          </ActionButton>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
