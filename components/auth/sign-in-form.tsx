"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { LockIcon, MailIcon } from "@/components/ui/icons";
import { TextField } from "@/components/ui/text-field";
import { useAuth } from "@/contexts/auth-context";

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { detail?: unknown } } }).response
      ?.data?.detail === "string"
  ) {
    return (error as { response: { data: { detail: string } } }).response.data
      .detail;
  }
  if (error instanceof Error && error.message) return error.message;
  return "Unable to sign in. Please try again.";
}

export function SignInForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      await login({ email: email.trim(), password });
      const next = searchParams.get("next");
      router.replace(next && next.startsWith("/") ? next : "/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error && (
        <p className="rounded bg-error-container/20 px-3 py-2 text-sm text-error">{error}</p>
      )}

      <TextField
        id="email"
        name="email"
        type="email"
        label="Email Address"
        autoComplete="email"
        placeholder="name@company.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        leadingIcon={<MailIcon />}
      />

      <TextField
        id="password"
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        leadingIcon={<LockIcon />}
        trailingLabel={
          <Link
            href="#"
            className="text-xs font-semibold uppercase tracking-[0.02em] leading-4 text-primary transition-colors hover:text-primary-container"
          >
            Forgot password?
          </Link>
        }
      />

      {error ? (
        <p className="text-sm font-medium text-error" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Signing in…" : "Sign In"}
      </Button>
    </form>
  );
}