import { createFileRoute } from "@tanstack/react-router";

type ChatBody = {
  messages?: { role: "user" | "assistant"; content: string }[];
  context?: unknown;
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("AI is not configured.", { status: 500 });

        const body = (await request.json().catch(() => null)) as ChatBody | null;
        if (!body || !Array.isArray(body.messages)) {
          return new Response("Messages are required.", { status: 400 });
        }

        const system = `You are Aurora, a friendly personal finance coach inside a budgeting app.
Give short, practical, encouraging advice. Use the user's own numbers when relevant.
Never give regulated investment, tax or legal advice — suggest a professional instead.
Keep answers under 180 words and use light markdown.
User's anonymised financial snapshot: ${JSON.stringify(body.context ?? {})}`;

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": key,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model: "google/gemini-3.6-flash",
            stream: true,
            messages: [
              { role: "system", content: system },
              ...body.messages.slice(-16).map((m) => ({ role: m.role, content: m.content })),
            ],
          }),
        });

        if (res.status === 429) return new Response("Rate limit reached. Try again shortly.", { status: 429 });
        if (res.status === 402) return new Response("AI credits exhausted.", { status: 402 });
        if (!res.ok || !res.body) return new Response("AI request failed.", { status: 502 });

        return new Response(res.body, {
          headers: {
            "content-type": "text/event-stream",
            "cache-control": "no-cache",
            connection: "keep-alive",
          },
        });
      },
    },
  },
});
