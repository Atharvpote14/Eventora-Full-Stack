"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getErrorMessage } from "@/lib/api";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-700 border-t-ember-500" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const { user, initialized, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const verified = searchParams.get("verified") === "1";

  useEffect(() => {
    if (initialized && user) {
      router.replace("/");
    }
  }, [initialized, user, router]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email.trim(), password);
      router.replace("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to book tickets and manage your events."
    >
      <form onSubmit={(event) => void submit(event)} className="space-y-4" noValidate>
        {verified && (
          <p className="rounded-md border border-moss-500/25 bg-moss-500/10 px-3 py-2 text-sm text-moss-500">
            Email verified! You can now log in.
          </p>
        )}
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
        />
        {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}
        <Button type="submit" className="w-full" size="lg" loading={submitting}>
          Log in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-paper-dim">
        New to Eventora?{" "}
        <Link href="/register" className="font-medium text-ember-400 hover:text-ember-300">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}