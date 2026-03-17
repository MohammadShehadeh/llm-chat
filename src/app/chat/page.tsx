"use client";

import { useChat } from "@ai-sdk/react";
import {
  IconCheck,
  IconCopy,
  IconMicrophone,
  IconPaperclip,
  IconSend,
  IconSparkles,
  IconSquare,
} from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import ChatLayout from "@/components/chat-layout";
import Markdown from "@/components/markdown";
import { Button } from "@/components/ui/button";

export default function ChatPageWrapper() {
  return (
    <Suspense
      fallback={
        <ChatLayout>
          <div className="flex h-full items-center justify-center">
            <div className="text-sm text-muted-foreground">Loading…</div>
          </div>
        </ChatLayout>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}

function ChatPageContent() {
  const searchParams = useSearchParams();
  const initialQuestion = searchParams.get("q") ?? "";

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const { messages, status, sendMessage, stop } = useChat();

  const isLoading = status === "submitted" || status === "streaming";

  const hasSentInitialRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-send initial question from URL
  useEffect(() => {
    if (!hasSentInitialRef.current && initialQuestion.trim()) {
      hasSentInitialRef.current = true;
      sendMessage({ text: initialQuestion });
    }
  }, [initialQuestion, sendMessage]);

  // Auto-scroll to bottom

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  };

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      sendMessage({ text: input.trim() });
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <ChatLayout>
      <div className="flex h-full flex-col">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6">
            {messages.length === 0 && !isLoading && (
              <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                    <IconSparkles className="size-6 text-primary" />
                  </div>
                  <p className="text-lg font-medium text-foreground">
                    How can I help you today?
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Start a conversation by typing a message below.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {messages.map((message) => {
                const isUser = message.role === "user";
                const text = message.parts
                  .filter((p) => p.type === "text")
                  .map((p) => (p as { type: "text"; text: string }).text)
                  .join("");

                return (
                  <div key={message.id}>
                    {isUser ? (
                      /* User message: right-aligned bubble */
                      <div className="flex justify-end">
                        <div className="max-w-[85%] rounded-3xl bg-muted px-4 py-3 text-sm leading-relaxed text-foreground">
                          <p className="whitespace-pre-wrap">{text}</p>
                        </div>
                      </div>
                    ) : (
                      /* AI message: left-aligned, no bubble */
                      <div className="group relative">
                        <div className="text-sm text-foreground">
                          <Markdown content={text} />
                        </div>
                        {/* Action buttons */}
                        <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(text, message.id)}
                            className="flex items-center gap-1 rounded-lg p-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            {copiedId === message.id ? (
                              <IconCheck className="size-3.5" />
                            ) : (
                              <IconCopy className="size-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Loading indicator */}
              {isLoading &&
                messages.length > 0 &&
                messages[messages.length - 1].role === "user" && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="size-2 animate-bounce rounded-full bg-foreground/40 [animation-delay:0ms]" />
                      <span className="size-2 animate-bounce rounded-full bg-foreground/40 [animation-delay:150ms]" />
                      <span className="size-2 animate-bounce rounded-full bg-foreground/40 [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
            </div>

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="shrink-0 px-4 pb-4 pt-2">
          <div className="mx-auto max-w-3xl">
            <div className="relative rounded-2xl border border-border bg-muted/50 shadow-sm transition-colors focus-within:border-border focus-within:bg-muted/70">
              <div className="flex items-end gap-2 p-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mb-0.5 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                  aria-label="Attach file"
                >
                  <IconPaperclip className="size-5" />
                </Button>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Message AI Chat…"
                  rows={1}
                  className="max-h-[200px] min-h-[24px] flex-1 resize-none bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />

                <div className="mb-0.5 flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:text-foreground"
                    aria-label="Voice input"
                  >
                    <IconMicrophone className="size-5" />
                  </Button>

                  {isLoading ? (
                    <Button
                      type="button"
                      onClick={stop}
                      size="icon"
                      className="rounded-full bg-foreground text-background hover:bg-foreground/90"
                      aria-label="Stop generating"
                    >
                      <IconSquare className="size-3.5" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSend}
                      size="icon"
                      disabled={!input.trim()}
                      className="rounded-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-30"
                      aria-label="Send message"
                    >
                      <IconSend className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-2 text-center text-xs text-muted-foreground/60">
              AI can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </ChatLayout>
  );
}
