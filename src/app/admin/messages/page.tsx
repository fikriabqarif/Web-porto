import { deleteMessage, setMessageRead } from "@/actions/messages";
import { ConfirmButton } from "@/components/confirm-button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await prisma.message.findMany({ orderBy: { createdAt: "desc" } });
  const unread = messages.filter((message) => !message.read).length;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="label">Inbox</p>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-sm text-muted">
          {messages.length} total · {unread} unread
        </p>
      </header>

      {messages.length === 0 ? (
        <p className="text-sm text-muted">No messages yet.</p>
      ) : (
        <ul className="space-y-4">
          {messages.map((message) => (
            <li key={message.id} className="border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-medium">
                    {message.name}
                    {message.read ? null : <span className="label ml-2">New</span>}
                  </p>
                  <p className="text-xs text-muted">
                    <a href={`mailto:${message.email}`} className="link-underline">
                      {message.email}
                    </a>{" "}
                    · {message.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={setMessageRead}>
                    <input type="hidden" name="id" value={message.id} />
                    <input type="hidden" name="read" value={message.read ? "false" : "true"} />
                    <button type="submit" className="btn-quiet">
                      {message.read ? "Mark unread" : "Mark read"}
                    </button>
                  </form>
                  <form action={deleteMessage}>
                    <input type="hidden" name="id" value={message.id} />
                    <ConfirmButton message={`Delete the message from ${message.name}?`}>Delete</ConfirmButton>
                  </form>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm">{message.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
