"use client";

import AiChat from "@/components/ai-chat";
import ChatLayout from "@/components/chat-layout";

export default function Home() {
  return (
    <ChatLayout>
      <div className="flex h-full items-center justify-center px-4">
        <div className="w-full max-w-3xl">
          <AiChat />
        </div>
      </div>
    </ChatLayout>
  );
}
