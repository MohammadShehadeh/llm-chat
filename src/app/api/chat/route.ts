import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { UIMessage } from "ai";
import { convertToModelMessages, streamText } from "ai";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const {
    messages,
    model = "openai/gpt-oss-120b:free",
  }: { messages: UIMessage[]; model?: string } = await req.json();

  const result = streamText({
    model: openrouter(model),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
