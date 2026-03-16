"use client";

import { useChat } from "@ai-sdk/react";
import {
  IconCheck,
  IconChevronDown,
  IconCopy,
  IconMicrophone,
  IconPaperclip,
  IconSend,
  IconSparkles,
  IconSquare,
} from "@tabler/icons-react";
import { DefaultChatTransport } from "ai";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ChatLayout from "@/components/chat-layout";
import Markdown from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MODELS = [
  { id: "openai/gpt-oss-120b:free", label: "GPT OSS 120B" },
  {
    id: "google/gemini-2.5-flash-preview:thinking",
    label: "Gemini 2.5 Flash",
  },
  { id: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4" },
  { id: "meta-llama/llama-4-maverick:free", label: "Llama 4 Maverick" },
];

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

  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ model: selectedModel }),
      }),
    [selectedModel],
  );

  const { messages, status, sendMessage, stop } = useChat({ transport });

  const isLoading = status === "submitted" || status === "streaming";

  const hasSentInitialRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);

  // Auto-send initial question from URL
  useEffect(() => {
    if (!hasSentInitialRef.current && initialQuestion.trim()) {
      hasSentInitialRef.current = true;
      sendMessage({ text: initialQuestion });
    }
  }, [initialQuestion, sendMessage]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when messages change
  useEffect(scrollToBottom, [messages.length, scrollToBottom]);

  // Close model menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        modelMenuRef.current &&
        !modelMenuRef.current.contains(e.target as Node)
      ) {
        setShowModelMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-resize textarea
  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      const ta = e.target;
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
    },
    [],
  );

  const handleSend = useCallback(() => {
    if (input.trim() && !isLoading) {
      sendMessage({ text: input.trim() });
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }, [input, isLoading, sendMessage]);

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

  const currentModelLabel =
    MODELS.find((m) => m.id === selectedModel)?.label ?? "Select model";

  return (
    <ChatLayout>
      <div className="flex h-full flex-col">
        {/* Header */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
          <div className="relative" ref={modelMenuRef}>
            <button
              type="button"
              onClick={() => setShowModelMenu(!showModelMenu)}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {currentModelLabel}
              <IconChevronDown className="size-4 text-muted-foreground" />
            </button>

            {showModelMenu && (
              <div className="absolute top-full left-0 z-50 mt-1 w-56 rounded-xl border border-border bg-popover p-1 shadow-lg">
                {MODELS.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowModelMenu(false);
                    }}
                    className={cn(
                      "flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                      selectedModel === model.id
                        ? "bg-muted text-foreground"
                        : "text-foreground/80",
                    )}
                  >
                    {model.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

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
