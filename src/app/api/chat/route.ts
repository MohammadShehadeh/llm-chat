import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { UIMessage } from "ai";
import { convertToModelMessages, streamText } from "ai";

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openrouter.chat("tngtech/deepseek-r1t2-chimera:free"),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
