import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Mail, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authErrorMessage, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/forgot-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset password — Aurora Ledger" },
      {
        name: "description",
        content: "Send yourself a password reset link for your Aurora Ledger account.",
      },
      { property: "og:title", content: "Reset password — Aurora Ledger" },
      {
        property: "og:description",
        content: "Send yourself a password reset link for your Aurora Ledger account.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
      toast.success("Reset link sent — check your inbox.");
    } catch (error) {
      toast.error(authErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="We'll email you a secure link to choose a new one."
      footer={
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-2xl border border-success/40 bg-success/10 p-5 text-center">
          <MailCheck className="mx-auto h-8 w-8 text-success" />
          <p className="mt-3 text-sm font-medium">Reset link sent to {email}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Didn't get it? Check spam, or try again in a minute.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="h-11 rounded-xl pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={busy}
            className="gradient-surface h-11 w-full rounded-xl text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
