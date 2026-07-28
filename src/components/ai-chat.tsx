import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, User2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { streamChat } from "@/lib/ai";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How can I cut my monthly spending by 10%?",
  "Am I saving enough for my goals?",
  "Where is most of my money going?",
];

export function AiChat({ context }: { context: unknown }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: question }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      await streamChat(next, context, (chunk) => {
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, content: last.content + chunk };
          return copy;
        });
      });
    } catch (error) {
      setMessages(next);
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  return (
    <section className="glass-card flex h-[540px] flex-col p-5">
      <div className="flex items-center gap-3">
        <span className="gradient-surface grid h-9 w-9 shrink-0 place-items-center rounded-xl text-primary-foreground">
          <Bot className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">Ask Aurora</h2>
          <p className="truncate text-xs text-muted-foreground">
            Your AI finance coach, aware of your numbers
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <p className="max-w-xs text-sm text-muted-foreground">
              Ask anything about your spending, budgets or goals.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => void send(s)}
                  className="rounded-full border border-border/60 bg-accent/40 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className="flex gap-3">
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                  m.role === "user" ? "bg-accent text-foreground" : "gradient-surface text-primary-foreground"
                }`}
                aria-hidden
              >
                {m.role === "user" ? <User2 className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1 whitespace-pre-wrap text-sm leading-relaxed">
                {m.content || (
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="mt-4 flex items-end gap-2"
      >
        <Textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          rows={1}
          aria-label="Message Aurora"
          placeholder="Ask about your money…"
          className="max-h-32 min-h-11 resize-none rounded-xl"
        />
        <Button
          type="submit"
          size="icon"
          disabled={busy || !input.trim()}
          aria-label="Send message"
          className="gradient-surface h-11 w-11 shrink-0 rounded-xl text-primary-foreground"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </section>
  );
}
