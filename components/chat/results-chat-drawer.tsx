"use client";

import { useMemo, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { ChatIcon, CloseIcon, SendIcon } from "@/components/ui/icons";
import { useProject } from "@/contexts/project-context";
import {
  sendChatMessage,
  type ChatPage,
  type ChatTurn,
} from "@/lib/chat-api";
import { getApiErrorMessage } from "@/lib/axios";
import { FormattedChatReply } from "@/lib/format-chat-reply";

function resolveChatContext(
  pathname: string,
  params: { id?: string },
  projectId?: string | null,
): {
  page: ChatPage;
  run_id?: string;
  mapping_id?: string;
  comparison_id?: string;
  project_id?: string;
} {
  const id = typeof params.id === "string" ? params.id : undefined;
  if (pathname.startsWith("/validation_result/") && id) {
    return { page: "validation_result", run_id: id, project_id: projectId || undefined };
  }
  if (pathname.startsWith("/field-mapping/") && id && id !== "new") {
    return { page: "mapping_result", mapping_id: id, project_id: projectId || undefined };
  }
  if (pathname.startsWith("/compare/") && id && id !== "new") {
    return { page: "comparison_result", comparison_id: id, project_id: projectId || undefined };
  }
  if (pathname.startsWith("/report")) {
    return { page: "report", project_id: projectId || undefined };
  }
  return { page: "dashboard" };
}

function contextLabel(page: ChatPage): string {
  if (page === "validation_result") return "This validation run";
  if (page === "mapping_result") return "This mapping run";
  if (page === "comparison_result") return "This comparison run";
  if (page === "report") return "This project report";
  return "All your projects";
}

function suggestedPrompts(page: ChatPage): string[] {
  if (page === "validation_result") {
    return ["Explain the top failures", "Find duplicate customers before load"];
  }
  if (page === "mapping_result") {
    return ["Generate an LSMW load layout"];
  }
  if (page === "comparison_result") {
    return ["Summarize last comparison"];
  }
  return [
    "Suggest rules on this draft",
    "Summarize last comparison",
    "Find duplicate customers before load",
  ];
}

export function ResultsChatDrawer() {
  const pathname = usePathname();
  const params = useParams<{ id?: string }>();
  const { selectedProject } = useProject();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [error, setError] = useState<string | null>(null);

  const context = useMemo(
    () => resolveChatContext(pathname, params, selectedProject?.id),
    [pathname, params, selectedProject?.id],
  );

  async function sendMessage() {
    const message = input.trim();
    if (!message || pending) return;
    setInput("");
    setError(null);
    const nextTurns: ChatTurn[] = [...turns, { role: "user", content: message }];
    setTurns(nextTurns);
    setPending(true);
    try {
      const result = await sendChatMessage(message, context, nextTurns.slice(0, -1));
      setTurns([...nextTurns, { role: "assistant", content: result.reply }]);
    } catch (err) {
      setError(getApiErrorMessage(err, "Chat is unavailable right now."));
    } finally {
      setPending(false);
    }
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    void sendMessage();
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    void sendMessage();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg hover:opacity-90"
        aria-label="Open results assistant"
      >
        <ChatIcon className="h-6 w-6" />
      </button>

      {open ? (
        <div className="fixed right-4 bottom-4 z-50 flex h-[min(560px,80vh)] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-xl">
          <header className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-on-surface">MIGR8 assistant</p>
              <p className="text-xs text-on-surface-variant">{contextLabel(context.page)}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container-high"
              aria-label="Close assistant"
            >
              <CloseIcon />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {turns.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm leading-6 text-on-surface-variant">
                  Ask about validation, mapping, comparison, or an allowed
                  action — suggest rules, explain failures, or summarize the
                  last reconciliation.
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedPrompts(context.page).map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setInput(prompt)}
                      className="rounded-full border border-outline-variant px-3 py-1 text-xs text-on-surface-variant hover:bg-surface-container-high"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {turns.map((turn, index) => (
              <div
                key={`${turn.role}-${index}`}
                className={
                  turn.role === "user"
                    ? "ml-8 rounded-2xl bg-primary/10 px-3 py-2 text-sm leading-6 text-on-surface"
                    : "mr-4 rounded-2xl bg-surface-container-high px-3 py-2"
                }
              >
                {turn.role === "assistant" ? (
                  <FormattedChatReply text={turn.content} />
                ) : (
                  turn.content
                )}
              </div>
            ))}
            {pending ? (
              <p className="text-xs text-on-surface-variant">Thinking…</p>
            ) : null}
            {error ? <p className="text-xs text-error">{error}</p> : null}
          </div>

          <form
            onSubmit={onSubmit}
            className="flex items-end gap-2 border-t border-outline-variant p-3"
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Ask about this project's results… (Enter to send)"
              rows={2}
              className="min-h-[44px] flex-1 resize-none rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary disabled:opacity-40"
              aria-label="Send"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
