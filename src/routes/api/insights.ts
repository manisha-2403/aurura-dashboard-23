import { createFileRoute } from "@tanstack/react-router";

export type AiInsights = {
  summary: string;
  healthVerdict: string;
  spendingHabits: string[];
  unnecessaryExpenses: { title: string; detail: string; monthlySaving: number }[];
  suggestedMonthlySaving: number;
  predictedNextMonthExpense: number;
  trendNote: string;
  tips: string[];
  budgetRecommendations: { category: string; limit: number; reason: string }[];
  weeklyReport: string;
};

const SYSTEM_PROMPT = `You are Aurora, a concise, warm personal-finance analyst.
You receive anonymised aggregate spending data and must reply with STRICT JSON only, matching:
{
  "summary": string,
  "healthVerdict": string,
  "spendingHabits": string[],
  "unnecessaryExpenses": [{ "title": string, "detail": string, "monthlySaving": number }],
  "suggestedMonthlySaving": number,
  "predictedNextMonthExpense": number,
  "trendNote": string,
  "tips": string[],
  "budgetRecommendations": [{ "category": string, "limit": number, "reason": string }],
  "weeklyReport": string
}
Rules: 3-5 items per array, amounts are plain numbers in the user's currency, no markdown, no currency symbols inside numbers, never invent transactions that were not provided.`;

export const Route = createFileRoute("/api/insights")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return json({ error: "AI is not configured." }, 500);

        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return json({ error: "Invalid request body." }, 400);
        }

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": key,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model: "google/gemini-3.6-flash",
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: JSON.stringify(payload) },
            ],
          }),
        });

        if (res.status === 429) return json({ error: "Rate limit reached. Try again shortly." }, 429);
        if (res.status === 402)
          return json({ error: "AI credits exhausted. Add credits to continue." }, 402);
        if (!res.ok) return json({ error: `AI request failed (${res.status}).` }, 502);

        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const content = data.choices?.[0]?.message?.content ?? "";
        try {
          return json(JSON.parse(content) as AiInsights, 200);
        } catch {
          return json({ error: "Could not read the AI response. Please retry." }, 502);
        }
      },
    },
  },
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
