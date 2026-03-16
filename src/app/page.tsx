"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, isLoading } = useChat();

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-[0_18px_60px_rgba(0,0,0,0.75)] backdrop-blur-md flex flex-col overflow-hidden">
        <header className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              llm-chat
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Ask anything, get responses in real time.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/40">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </header>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-zinc-500 text-sm mt-6">
              <p className="font-medium text-zinc-300 mb-1">
                Start a conversation
              </p>
              <p>Try asking a question or describing what you&apos;re working on.</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap shadow-sm ${
                  message.role === "user"
                    ? "bg-emerald-500 text-emerald-50 rounded-br-sm"
                    : "bg-zinc-900/80 text-zinc-100 border border-zinc-800 rounded-bl-sm"
                }`}
              >
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return <div key={`${message.id}-${i}`}>{part.text}</div>;
                    default:
                      return null;
                  }
                })}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" />
              Thinking...
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim()) return;
            sendMessage({ text: input });
            setInput("");
          }}
          className="border-t border-zinc-800 bg-zinc-950/80 px-4 sm:px-6 py-3 flex items-center gap-2"
        >
          <input
            className="flex-1 bg-zinc-900/80 text-sm text-zinc-100 placeholder:text-zinc-500 px-3 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500/80"
            value={input}
            placeholder="Ask a question..."
            onChange={(e) => setInput(e.currentTarget.value)}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
